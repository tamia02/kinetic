"use client";

import { useState } from "react";
import { Bot, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AssistantCreateDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Create Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Assistant</DialogTitle>
          <DialogDescription>
            Configure your AI voice assistant's personality and voice.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Assistant Name</Label>
            <Input id="name" placeholder="Customer Support Bot" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="voice">Voice</Label>
            <Select>
              <SelectTrigger id="voice">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="advik">Advik (Hindi)</SelectItem>
                <SelectItem value="meera">Meera (English-IN)</SelectItem>
                <SelectItem value="kavya">Kavya (Tamil)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prompt">System Prompt</Label>
            <Textarea 
              id="prompt" 
              placeholder="You are a helpful customer support agent for..." 
              className="min-h-[150px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
