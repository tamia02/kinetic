import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { chatterbox } from "@/lib/chatterbox-client";
import { prisma } from "@/lib/db";
import { emitWebhook } from "@/lib/integrations/webhook-emitter";
import { executeTool } from "@/lib/integrations/tool-executor";

const { VoiceResponse } = twilio.twiml;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const speechResult = formData.get("SpeechResult") as string;
    const callSid = formData.get("CallSid") as string;

    console.log(`[Twilio Gather] Speech captured: "${speechResult}" (Sid: ${callSid})`);

    const response = new VoiceResponse();

    if (!speechResult) {
      response.say("I didn't quite catch that. Could you please repeat?");
      response.gather({
        input: ["speech"],
        action: "/api/webhooks/twilio/gather",
        speechTimeout: "auto",
        language: "en-IN",
      });
    } else {
      // 1. Process with LLM (Simulated for Phase 3)
      let aiResponse = "";
      
      if (speechResult.toLowerCase().includes("weather")) {
        // Mocking a tool call for weather
        const { result } = await executeTool({ 
          name: "getWeather", 
          type: "WEBHOOK", 
          config: { url: "https://api.weather.com/mock" } 
        }, { location: "London" });
        
        aiResponse = "I've checked the weather for you. It's currently sunny in London.";
      } else {
        aiResponse = `You said: ${speechResult}. How else can I assist you?`;
      }

      // 2. Generate audio via Chatterbox and stream it
      // For simplicity in Phase 2, we use Twilio's standard <Say>
      response.say({
        voice: "Polly.Aditi",
        language: "en-IN",
      }, aiResponse);

      // Continue the conversation
      response.gather({
        input: ["speech"],
        action: "/api/webhooks/twilio/gather",
        speechTimeout: "auto",
        language: "en-IN",
      });

      // Emit event
      await emitWebhook("default_org", "assistant.speech", { callSid, aiResponse });
    }

    return new NextResponse(response.toString(), {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (err) {
    console.error("[Twilio Gather] Error:", err);
    return new NextResponse(null, { status: 500 });
  }
}
