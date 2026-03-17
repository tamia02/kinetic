import type { Metadata } from "next";
import { SarvamPlaygroundView } from "@/features/sarvam/views/sarvam-playground-view";

export const metadata: Metadata = { 
  title: "Sarvam AI Playground",
  description: "Text to Speech in Indian languages powered by Sarvam AI",
};

export default function SarvamPlaygroundPage() {
  return <SarvamPlaygroundView />;
}
