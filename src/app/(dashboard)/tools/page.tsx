import type { Metadata } from "next";
import { ToolsView } from "@/features/integrations/views/tools-view";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  return <ToolsView />;
}
