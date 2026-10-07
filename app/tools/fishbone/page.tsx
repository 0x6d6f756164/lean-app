import type { Metadata } from "next";
import FishboneTool from "@/components/tools/FishboneTool";

export const metadata: Metadata = { title: "Fishbone Diagram" };

export default function Page() {
  return <FishboneTool />;
}