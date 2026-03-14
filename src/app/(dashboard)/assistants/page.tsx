import type { Metadata } from "next";
import { AssistantCreateDialog } from "@/features/assistants/components/assistant-create-dialog";

export const metadata: Metadata = { title: "Assistants" };

export default function AssistantsPage() {
  return (
    <div className="flex flex-1 flex-col p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assistants</h1>
          <p className="text-muted-foreground">
            Configure AI assistants that bind voices to specific language models and behaviors.
          </p>
        </div>
        <AssistantCreateDialog />
      </div>
      <div className="mt-8 flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-xl font-bold tracking-tight">
            You have no assistants
          </h3>
          <p className="text-sm text-muted-foreground">
            You can start by creating a new assistant.
          </p>
          <div className="mt-4">
            <AssistantCreateDialog />
          </div>
        </div>
      </div>
    </div>
  );
}
