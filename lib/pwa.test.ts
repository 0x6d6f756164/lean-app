import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildManifest } from "./pwa";

const manifest = buildManifest();

describe("buildManifest", () => {
  it("is installable: standalone, a start url and a short name", () => {
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.short_name!.length).toBeLessThanOrEqual(12);
  });

  it("provides 192px, 512px and maskable icons", () => {
    const icons = manifest.icons ?? [];
    expect(icons.some((i) => i.sizes === "192x192")).toBe(true);
    expect(icons.some((i) => i.sizes === "512x512" && i.purpose !== "maskable")).toBe(true);
    expect(icons.some((i) => i.purpose === "maskable")).toBe(true);
  });

  it("only references icon files that exist in public/", () => {
    for (const icon of manifest.icons ?? []) {
      const file = path.join(process.cwd(), "public", icon.src);
      expect(fs.existsSync(file), icon.src).toBe(true);
    }
  });
});