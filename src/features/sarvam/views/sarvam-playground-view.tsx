"use client";

import { useState } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  Languages, 
  Layers, 
  Info,
  Waves,
  Zap,
  Mic2,
  Settings2
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

import { SARVAM_VOICES, SARVAM_LANGUAGES } from "../data/sarvam";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export function SarvamPlaygroundView() {
  const [text, setText] = useState("नमस्ते! Sarvam AI में आपका स्वागत है।\n\nहम भारतीय भाषाओं के लिए अत्याधुनिक voice technology बनाते हैं। हमारे text-to-speech models प्राकृतिक और इंसान जैसी आवाज़ें produce करते हैं, जो बेहद realistic लगती हैं।");
  const [language, setLanguage] = useState("hi-IN");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(SARVAM_VOICES[1].id); // Priya
  const [speed, setSpeed] = useState(1.0);
  const [model, setModel] = useState("bulbul:v3-beta");
  const [quality, setQuality] = useState("standard");
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const trpc = useTRPC();
  const generateMutation = useMutation(
    trpc.generations.create.mutationOptions({})
  );

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    try {
      const selectedVoice = SARVAM_VOICES.find(v => v.id === selectedVoiceId);
      
      // Note: We need a system voice ID for the DB link, or we'll have to create one for Sarvam
      // For now, I'll pass the voice name as voiceId and handle it in the router or just use a placeholder
      
      const res = await generateMutation.mutateAsync({
        text: text.trim(),
        voiceId: selectedVoice?.name || "Priya",
        provider: "SARVAM",
        language: language,
        model: model,
        pace: speed,
      });

      toast.success("Audio generated!");
      // Handle audio playback here or redirect to detail view
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate");
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#F9FAFB] overflow-hidden">
      {/* Header */}
      <div className="border-b bg-white p-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Text to Speech</h1>
        <p className="text-sm text-[#6B7280]">Convert text to natural speech in Indian languages</p>
      </div>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        {/* Main Controls Panel */}
        <div className="flex flex-col flex-1 gap-6 min-w-0">
          <Card className="flex flex-col flex-1 shadow-sm border-none overflow-hidden">
            <CardContent className="p-0 flex flex-col flex-1 h-full relative">
              <div className="flex flex-col flex-1 p-6 gap-4">
                <div className="relative flex-1">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text here..."
                    className="h-full w-full resize-none border-none bg-transparent p-0 text-lg leading-relaxed focus-visible:ring-0"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[180px] bg-white border-gray-200">
                      <Languages className="size-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SARVAM_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border-t p-6 bg-white/50 backdrop-blur-sm space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                      Model
                    </label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <Layers className="size-4 mr-2 text-[#059669]" />
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bulbul:v3-beta">Bulbul V3</SelectItem>
                        <SelectItem value="bulbul:v2">Bulbul V2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        Audio Quality <Info className="size-3 cursor-help" />
                      </label>
                    </div>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger className="bg-white border-gray-200">
                        <Waves className="size-4 mr-2 text-[#2563EB]" />
                        <SelectValue placeholder="Quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (22.05 kHz)</SelectItem>
                        <SelectItem value="high">High (44.1 kHz)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                      Speed
                    </label>
                    <span className="text-xs font-medium text-gray-600 tabular-nums bg-gray-100 px-1.5 py-0.5 rounded">
                      {speed.toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Zap className="size-4 text-gray-400 shrink-0" />
                    <Slider
                      value={[speed]}
                      onValueChange={([val]) => setSpeed(val)}
                      min={0.5}
                      max={2.0}
                      step={0.01}
                      className="flex-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white border-t flex justify-end">
                <Button 
                   onClick={handleGenerate}
                   disabled={generateMutation.isPending}
                   className="bg-[#111827] hover:bg-[#1F2937] text-white rounded-full px-8 font-semibold shadow-lg shadow-gray-200 transition-all h-12"
                >
                  {generateMutation.isPending ? "Generating..." : "Generate Speech"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Voices list */}
        <Card className="w-96 shadow-sm border-none overflow-hidden h-full flex flex-col">
          <CardContent className="p-0 flex flex-col h-full">
            <Tabs defaultValue="conversational" className="w-full flex flex-col h-full">
              <TabsList className="w-full justify-start bg-transparent border-b h-14 rounded-none px-4 gap-4 overflow-x-auto overflow-y-hidden no-scrollbar whitespace-nowrap">
                <TabsTrigger value="conversational" className="px-0 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#111827] data-[state=active]:bg-transparent shadow-none gap-2 text-xs font-semibold uppercase tracking-wider">
                  <Mic2 className="size-3.5" /> Conversational
                </TabsTrigger>
                <TabsTrigger value="audiobooks" className="px-0 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#111827] data-[state=active]:bg-transparent shadow-none gap-2 text-xs font-semibold uppercase tracking-wider">
                   Audiobooks
                </TabsTrigger>
                <TabsTrigger value="sales" className="px-0 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[#111827] data-[state=active]:bg-transparent shadow-none gap-2 text-xs font-semibold uppercase tracking-wider">
                   Sales
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {SARVAM_VOICES.map((voice) => (
                  <div 
                    key={voice.id}
                    onClick={() => setSelectedVoiceId(voice.id)}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer border ${
                      selectedVoiceId === voice.id 
                        ? "bg-white border-[#E5E7EB] shadow-md ring-1 ring-[#111827]/5" 
                        : "hover:bg-gray-50 border-transparent"
                    }`}
                  >
                    <div className={`shrink-0 size-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                      voice.gender === "male" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#FCE7F3] text-[#BE185D]"
                    }`}>
                      <Volume2 className="size-6" />
                      <div className="absolute -bottom-1 -right-1">
                        <div className={`size-4 rounded-full border-2 border-white ${
                          isPlaying === voice.id ? "bg-green-500" : "bg-gray-300"
                        }`} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{voice.name}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 py-0 font-medium bg-gray-100 text-gray-600 border-none capitalize">
                          {voice.gender}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 leading-normal line-clamp-2">
                        {voice.description}
                      </p>
                    </div>

                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className={`size-8 rounded-full shrink-0 transition-opacity ${selectedVoiceId === voice.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle preview audio
                        setIsPlaying(isPlaying === voice.id ? null : voice.id);
                      }}
                    >
                      {isPlaying === voice.id ? <Pause className="size-4" /> : <Play className="size-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
