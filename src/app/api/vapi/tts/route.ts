import { NextRequest, NextResponse } from "next/server";
import { chatterbox } from "@/lib/chatterbox-client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Vapi TTS Request:", JSON.stringify(body, null, 2));

    // Vapi sends secret in request if configured, or we can use custom headers
    // For now, let's look for text and voiceId
    const text = body.text || body.message?.text;
    const voiceId = body.voiceId || body.message?.voice?.voiceId;
    const secret = req.headers.get("x-vapi-secret") || body.secret || body.message?.voice?.secret;

    if (env.VAPI_SECRET && secret !== env.VAPI_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!text) {
      return new NextResponse("Text is required", { status: 400 });
    }

    // Default to a system voice if none provided
    const effectiveVoiceId = voiceId || "default"; // I should find a real default ID

    const voice = await prisma.voice.findFirst({
      where: {
        OR: [
          { id: effectiveVoiceId },
          { name: effectiveVoiceId },
          { variant: "SYSTEM" } // Fallback to first system voice
        ]
      },
      select: { id: true, r2ObjectKey: true }
    });

    if (!voice || !voice.r2ObjectKey) {
      return new NextResponse("Voice not found", { status: 404 });
    }

    // Call Chatterbox Modal service with sample_rate for PCM
    const { data, error } = await chatterbox.POST("/generate", {
      body: {
        prompt: text,
        voice_key: voice.r2ObjectKey,
        sample_rate: 16000, // Vapi standard
        temperature: 0.8,
        top_p: 0.95,
        top_k: 1000,
        repetition_penalty: 1.2,
        norm_loudness: true,
      },
      parseAs: "arrayBuffer",
    });

    if (error) {
      console.error("Chatterbox Vapi error:", error);
      return new NextResponse("Failed to generate audio", { status: 500 });
    }

    if (!(data instanceof ArrayBuffer)) {
      return new NextResponse("Invalid audio response", { status: 500 });
    }

    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (err) {
    console.error("Vapi TTS route error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
