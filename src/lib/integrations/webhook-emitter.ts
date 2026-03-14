import { env } from "../env";

type WebhookEvent = 
  | "call.started" 
  | "call.ended" 
  | "assistant.speech" 
  | "assistant.thought";

type WebhookPayload = {
  event: WebhookEvent;
  timestamp: string;
  orgId: string;
  data: any;
};

export async function emitWebhook(orgId: string, event: WebhookEvent, data: any) {
  // 1. Fetch integrations for this org that are of type N8N or GENERIC_WEBHOOK
  // Note: We'll need to implement the database fetch here once the client is regenerated.
  
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    orgId,
    data,
  };

  console.log(`[Webhook Emitter] Emitting ${event} for org ${orgId}`);

  // For now, let's look for a generic VAPI_SECRET if provided, but really 
  // we want to loop through integration URLs from the DB.
  
  /*
  const integrations = await prisma.integration.findMany({
    where: { 
      orgId, 
      type: { in: ["N8N", "GENERIC_WEBHOOK"] } 
    }
  });

  for (const integration of integrations) {
    const config = integration.config as { url: string; secret?: string };
    if (!config.url) continue;

    try {
      await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.secret && { "x-resonance-secret": config.secret }),
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error(`[Webhook Emitter] Failed to send to ${config.url}:`, err);
    }
  }
  */
}
