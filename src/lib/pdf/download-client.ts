/** Trigger a file download from a PDF data URL (avoids popup blockers after fetch). */
export function downloadPdfDataUrl(dataUrl: string, filename: string) {
  const safeName = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : null;

  if (!base64) {
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = safeName;
    anchor.click();
    return;
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = safeName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
}
