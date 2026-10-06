import type { Metadata } from "next";
import FiveSTool from "@/components/tools/FiveSTool";

export const metadata: Metadata = { title: "5S Audit" };

export default function Page() {
  return <FiveSTool />;
}