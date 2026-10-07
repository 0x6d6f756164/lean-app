import { toPng } from "html-to-image";

export async function exportNodeAsPng(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    // keeps the export readable in both light and dark mode
    backgroundColor: getComputedStyle(document.body).backgroundColor,
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}