import type { Metadata } from "next";
import { IntegrationCreateDialog } from "@/features/integrations/components/integration-create-dialog";

export const metadata: Metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return (
    <div className="flex flex-1 flex-col p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your platform to external services like Twilio for telephony and n8n for automation.
          </p>
        </div>
        <IntegrationCreateDialog />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Twilio</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">Telephony</div>
            <p className="text-xs text-muted-foreground">
              Connect your phone numbers to Resonance.
            </p>
            <button className="mt-4 w-full rounded-md border border-input bg-background px-3 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Configure
            </button>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">n8n</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">Automation</div>
            <p className="text-xs text-muted-foreground">
              Trigger workflows and sync data with n8n.
            </p>
            <button className="mt-4 w-full rounded-md border border-input bg-background px-3 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
