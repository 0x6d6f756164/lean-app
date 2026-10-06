import type { Metadata } from "next";
import OeeTool from "@/components/tools/OeeTool";

export const metadata: Metadata = { title: "OEE Calculator" };

export default function Page() {
  return <OeeTool />;
}