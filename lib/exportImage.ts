import { toPng } from "html-to-image";

export async function exportNodeAsPng(
  node: HTMLElement,
  filename: string,
  backgroundColor = "#ffffff",
): Promise<void> {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor,
    skipFonts: true, // the export uses a system font, so there is nothing to embed
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}