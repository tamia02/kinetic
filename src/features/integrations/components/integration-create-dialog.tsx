"use client";

import { useState } from "react";
import { Plug } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function IntegrationCreateDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"TWILIO" | "N8N" | "GENERIC_WEBHOOK">("TWILIO");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plug className="size-4" />
          Add Integration
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Integration</DialogTitle>
          <DialogDescription>
            Connect an external service to power your AI voice orchestrator.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Integration Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TWILIO">Twilio (Telephony)</SelectItem>
                <SelectItem value="N8N">n8n (Automation)</SelectItem>
                <SelectItem value="GENERIC_WEBHOOK">Generic Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="My Twilio Account" />
          </div>

          {type === "TWILIO" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="sid">Account SID</Label>
                <Input id="sid" placeholder="AC..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="token">Auth Token</Label>
                <Input id="token" type="password" placeholder="Key..." />
              </div>
            </>
          )}

          {type === "N8N" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="url">Webhook URL</Label>
                <Input id="url" placeholder="https://n8n.example.com/webhook/..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="secret">Secret Key (Optional)</Label>
                <Input id="secret" type="password" placeholder="Secret..." />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>
            Save Integration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
