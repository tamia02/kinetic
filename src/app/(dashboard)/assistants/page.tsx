import { AssistantCreateDialog } from "@/features/assistants/components/assistant-create-dialog";
import { AssistantSettings } from "@/features/assistants/components/assistant-settings";

export const metadata: Metadata = { title: "Assistants" };

export default function AssistantsPage() {
  return (
    <div className="flex flex-1 flex-col p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">
            Configure the brain of your voice orchestrator.
          </p>
        </div>
        <AssistantCreateDialog />
      </div>

      <div className="grid gap-6">
        <AssistantSettings />
      </div>
    </div>
  );
}
