import type { Metadata } from "next";
import ParetoTool from "@/components/tools/ParetoTool";

export const metadata: Metadata = { title: "Pareto Chart Builder" };

export default function Page() {
  return <ParetoTool />;
}