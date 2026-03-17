import { env } from "./env";

export interface SarvamTTSRequest {
  inputs: string[];
  target_language_code: string;
  speaker: string;
  model?: "bulbul:v1"; // Bullbul v1 seems standard for standard REST
  speech_sample_rate?: number;
  enable_preprocessing?: boolean;
}

// Based on Sarvam AI documentation for their REST API
export class SarvamClient {
  private readonly baseUrl = "https://api.sarvam.ai";

  constructor(private readonly apiKey?: string) {}

  async generate(request: SarvamTTSRequest): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error("Sarvam API key is required");
    }

    const response = await fetch(`${this.baseUrl}/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": this.apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sarvam AI error: ${error || response.statusText}`);
    }

    const json = await response.json() as { audios: string[] };
    
    if (!json.audios || json.audios.length === 0) {
      throw new Error("No audio returned from Sarvam AI");
    }

    // Sarvam returns a list of base64 strings if inputs was a list
    const base64Audio = json.audios[0];
    if (!base64Audio) {
      throw new Error("Invalid audio response from Sarvam AI");
    }

    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer as ArrayBuffer;
  }
}

export const sarvam = new SarvamClient(env.SARVAM_API_KEY);
