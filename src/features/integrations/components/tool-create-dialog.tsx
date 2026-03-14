"use client";

import { useState } from "react";
import { Plus, Wrench, Globe, Terminal, Cpu } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ToolCreateDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("WEBHOOK");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Tool
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Tool</DialogTitle>
          <DialogDescription>
            Create a tool that your assistant can use to interact with the real world.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tool Name</Label>
              <Input id="name" placeholder="e.g. Check Availability" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Instruction for AI)</Label>
              <Input id="description" placeholder="Use this tool when the user asks for..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tool Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEBHOOK">
                    <div className="flex items-center gap-2">
                      <Globe className="size-4" />
                      <span>Webhook</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="GHL">
                    <div className="flex items-center gap-2">
                      <Cpu className="size-4" />
                      <span>GoHighLevel</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="MAKE">
                    <div className="flex items-center gap-2">
                      <Terminal className="size-4" />
                      <span>Make.com</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="configuration" className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" placeholder="https://api.yourdiscovery.com/v1/..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select defaultValue="POST">
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)}>Create Tool</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
