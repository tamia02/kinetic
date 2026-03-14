"use client";

import { useState } from "react";
import { Plus, Book, FileText, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const MOCK_KNOWLEDGE = [
  {
    id: "1",
    name: "Company Wiki",
    description: "Internal documents about company policies and procedures.",
    files: 12,
  },
  {
    id: "2",
    name: "Support FAQ",
    description: "Frequently asked questions for customer support.",
    files: 45,
  }
];

export default function KnowledgePage() {
  return (
    <div className="flex flex-1 flex-col p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Upload documents and FAQs to give your assistants custom information.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Source
        </Button>
      </div>

      <div className="mt-8 flex max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sources..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_KNOWLEDGE.map((source) => (
          <Card key={source.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium">
                  {source.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {source.description}
                </CardDescription>
              </div>
              <Book className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="size-3" />
                <span>{source.files} files</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  Manage
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
