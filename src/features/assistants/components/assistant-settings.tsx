"use client";


import { MessageSquare, Wrench, Database, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export function AssistantSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            Greeting & Prompt
          </CardTitle>
          <CardDescription>
            The first thing your assistant says and the instructions it follows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="firstMessage">First Message</Label>
            <Input id="firstMessage" placeholder="Hello! I'm your AI assistant..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea 
              id="systemPrompt" 
              className="min-h-[200px]" 
              placeholder="You are a helpful assistant..." 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="size-5" />
            Tools & Functions
          </CardTitle>
          <CardDescription>
            Select the tools this assistant can use during the call.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 rounded-lg border p-4">
            <Checkbox id="tool1" defaultChecked />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="tool1"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Check Appointment
              </label>
              <p className="text-xs text-muted-foreground">
                Allows checking calendar availability.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rounded-lg border p-4">
            <Checkbox id="tool2" />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="tool2"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Create Lead
              </label>
              <p className="text-xs text-muted-foreground">
                Adds user info to CRM.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5" />
            Knowledge Base
          </CardTitle>
          <CardDescription>
            Bind documents and FAQs to this assistant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No knowledge sources attached yet.
          </p>
          <Button variant="outline" size="sm" className="mt-4 gap-2">
            <Search className="size-4" />
            Browse Knowledge
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Discard Changes</Button>
        <Button>Save Assistant</Button>
      </div>
    </div>
  );
}
