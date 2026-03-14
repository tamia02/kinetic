"use client";

import { useState } from "react";
import { Plus, Settings2, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToolCreateDialog } from "../components/tool-create-dialog";

const MOCK_TOOLS = [
  {
    id: "1",
    name: "Check Appointment",
    description: "Checks if a time slot is available in the calendar.",
    type: "WEBHOOK",
    url: "https://api.example.com/calendar/check",
  },
  {
    id: "2",
    name: "Create Lead",
    description: "Adds a new lead to GoHighLevel.",
    type: "GHL",
    url: "https://services.leadconnectorhq.com/hooks/...",
  }
];

export function ToolsView() {
  return (
    <div className="flex flex-1 flex-col p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tools</h1>
          <p className="text-muted-foreground">
            Register external APIs that your assistants can call during conversations.
          </p>
        </div>
        <ToolCreateDialog />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_TOOLS.map((tool) => (
          <Card key={tool.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium">
                  {tool.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {tool.description}
                </CardDescription>
              </div>
              <Badge variant="outline">{tool.type}</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ExternalLink className="size-3" />
                <span className="truncate">{tool.url}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="px-2 text-destructive">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
