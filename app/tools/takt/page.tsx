import type { Metadata } from "next";
import TaktTool from "@/components/tools/TaktTool";

export const metadata: Metadata = { title: "Takt Time Calculator" };

export default function Page() {
  return <TaktTool />;
}