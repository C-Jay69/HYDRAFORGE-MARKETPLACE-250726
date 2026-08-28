import type { Metadata } from "next";
import { HydraSkriptDemo } from "@/components/HydraSkriptDemo";

export const metadata: Metadata = {
  title: "HydraSkript — Live Demo | HYDRAFORGE",
  description:
    "Try HydraSkript's AI co-authoring studio: outline, write, illustrate, export and narrate a book, entirely in your browser.",
};

export default function HydraSkriptDemoPage() {
  return <HydraSkriptDemo />;
}
