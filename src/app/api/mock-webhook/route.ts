import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("[Mock Webhook] Received event:", body.event);

  // Return a Vapi-style response
  return NextResponse.json({
    action: "continue",
    message: "Acknowledged",
  });
}
