import type { Metadata } from "next";
import WorkspaceView from "@/components/WorkspaceView";

export const metadata: Metadata = { title: "Workspace" };

export default function Page() {
  return <WorkspaceView />;
}