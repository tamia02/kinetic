import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { emitWebhook } from "@/lib/integrations/webhook-emitter";

const { VoiceResponse } = twilio.twiml;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const callSid = formData.get("CallSid") as string;
    const from = formData.get("From") as string;
    const to = formData.get("To") as string;

    console.log(`[Twilio Webhook] Incoming call from ${from} to ${to} (Sid: ${callSid})`);

    // 1. Find the assistant associated with this dialed number
    // For now, we'll just use a default assistant or mapping.
    // We'd ideally have an "Integration" record that maps a Twilio number to an Assistant.
    
    /*
    const integration = await prisma.integration.findFirst({
      where: { 
        type: "TWILIO",
        config: {
          path: ["phoneNumber"],
          equals: to
        }
      }
    });
    */

    const response = new VoiceResponse();

    // 2. Initial Greeting
    response.say({
      voice: "Polly.Aditi", 
      language: "en-IN",
    }, "Welcome to Resonance. I am your AI assistant. This call is being recorded for quality assurance.");

    // 3. Enable Recording
    response.record({
      action: "/api/webhooks/twilio/recording",
      maxLength: 3600,
      playBeep: false,
    });

    // 4. Start Interaction
    response.gather({
      input: ["speech"],
      action: "/api/webhooks/twilio/gather",
      speechTimeout: "auto",
      language: "en-IN",
    });

    // Emit event
    await emitWebhook("default_org", "call.started", { callSid, from, to }, { callSid });

    return new NextResponse(response.toString(), {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (err) {
    console.error("[Twilio Webhook] Error:", err);
    const response = new VoiceResponse();
    response.say("Sorry, an error occurred. Please try again later.");
    return new NextResponse(response.toString(), {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}
