import { prisma } from "../db";

export type WebhookEvent = 
  | "call.started" 
  | "call.ended" 
  | "assistant.speech" 
  | "assistant.thought"
  | "transcript"
  | "tool.call"
  | "status-update";

export type WebhookPayload = {
  event: WebhookEvent;
  timestamp: string;
  orgId: string;
  callSid?: string;
  data: unknown;
};

export type WebhookResponse = {
  action?: "continue" | "hangup" | "transfer";
  modelOverride?: unknown;
  promptOverride?: string;
};

export async function emitWebhook(
  orgId: string, 
  event: WebhookEvent, 
  data: unknown,
  options: { blocking?: boolean; callSid?: string } = {}
): Promise<WebhookResponse | null> {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    orgId,
    callSid: options.callSid,
    data,
  };

  console.log(`[Webhook Emitter] Emitting ${event} for org ${orgId} (Blocking: ${!!options.blocking})`);

  // In a real app, we'd fetch this from the DB. 
  // Since Prisma is currently blocked, we'll try to use a default URL if set in env,
  // or mock the behavior.
  
  /*
  const integrations = await prisma.integration.findMany({
    where: { 
      orgId, 
      type: { in: ["N8N", "GENERIC_WEBHOOK"] } 
    }
  });
  */

  // Mocking integration fetch for now
  const mockIntegrations = [
    { config: { url: process.env.NEXT_PUBLIC_APP_URL + "/api/mock-webhook", secret: "secret" } }
  ];

  let finalResponse: WebhookResponse | null = null;

  for (const integration of mockIntegrations) {
    const config = integration.config as { url: string; secret?: string };
    if (!config.url) continue;

    try {
      const promise = fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.secret && { "x-resonance-secret": config.secret }),
        },
        body: JSON.stringify(payload),
      });

      if (options.blocking) {
        const response = await promise;
        if (response.ok) {
          const json = await response.json();
          finalResponse = json as WebhookResponse;
        }
      } else {
        // Fire and forget
        promise.catch(err => console.error(`[Webhook Emitter] Async error:`, err));
      }
    } catch (err) {
      console.error(`[Webhook Emitter] Failed to send to ${config.url}:`, err);
    }
  }

  return finalResponse;
}
