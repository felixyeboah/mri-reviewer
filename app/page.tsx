"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useState } from "react";
import { UploadZone } from "@/components/upload-zone";
import { AnalysisDisplay } from "@/components/analysis-display";
import { ImageReference, extractRegions } from "@/components/image-reference";
import { Button } from "@/components/ui/button";
import { pdfToImage } from "@/lib/pdf-to-image";

async function convertFilesToDataURLs(
  files: FileList
): Promise<
  { type: "file"; filename: string; mediaType: string; url: string }[]
> {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<{
          type: "file";
          filename: string;
          mediaType: string;
          url: string;
        }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              type: "file",
              filename: file.name,
              mediaType: file.type,
              url: reader.result as string,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );
}

export default function Page() {
  const { messages, sendMessage, status } = useChat();
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  // Stores the rendered image URL (works for both images and PDFs rendered to canvas)
  const [imageForReference, setImageForReference] = useState<string | null>(null);

  const isStreaming = status === "streaming";
  const isLoading = status === "submitted" || isStreaming;

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    setFiles(selectedFiles);
    const file = selectedFiles[0];
    setFileName(file.name);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setImageForReference(url);
    } else if (file.type === "application/pdf") {
      // Show PDF icon immediately while rendering
      setPreviewUrl("pdf");
      pdfToImage(file)
        .then((renderedImage) => {
          setPreviewUrl(renderedImage);
          setImageForReference(renderedImage);
        })
        .catch((err) => {
          console.error("PDF rendering failed:", err);
        });
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!files || files.length === 0) return;

    const fileParts = await convertFilesToDataURLs(files);

    sendMessage({
      role: "user",
      parts: [
        { type: "text" as const, text: "Please analyze this medical image." },
        ...fileParts,
      ],
    });
  }, [files, sendMessage]);

  const handleReset = useCallback(() => {
    setFiles(undefined);
    setPreviewUrl(null);
    setFileName(null);
    setImageForReference(null);
  }, []);

  const latestAnalysis = messages.filter((m) => m.role === "assistant").pop();
  const analysisText =
    latestAnalysis?.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? "";

  const hasAnalysis = analysisText.length > 0 || isLoading;
  const hasFile = !!files;
  const regions = extractRegions(analysisText);

  // Full-page upload view when no file selected and no analysis
  if (!hasFile && !hasAnalysis) {
    return (
      <UploadZone
        onFileSelect={handleFileSelect}
        previewUrl={previewUrl}
        fileName={fileName}
        isAnalyzing={false}
        fullPage
      />
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              MRI Reviewer
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered medical image analysis
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            New Analysis
          </Button>
        </div>
      </header>

      <main className="flex-1 px-6 py-6">
        <div
          className={`mx-auto max-w-6xl ${
            hasAnalysis
              ? "grid gap-6 lg:grid-cols-[2fr_3fr]"
              : "flex flex-col items-center justify-center"
          }`}
        >
          <div className="w-full">
            <div className="sticky top-6 flex flex-col gap-4">
              {hasAnalysis && imageForReference ? (
                <ImageReference
                  imageUrl={imageForReference}
                  regions={regions}
                />
              ) : (
                <>
                  <UploadZone
                    onFileSelect={handleFileSelect}
                    previewUrl={previewUrl}
                    fileName={fileName}
                    isAnalyzing={isLoading}
                  />

                  {files && !isLoading && (
                    <Button onClick={handleAnalyze} className="w-full">
                      Analyze Image
                    </Button>
                  )}
                </>
              )}

              {isLoading && !isStreaming && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
                  Preparing analysis...
                </div>
              )}
            </div>
          </div>

          {hasAnalysis && (
            <AnalysisDisplay
              content={analysisText}
              isStreaming={isStreaming}
            />
          )}
        </div>
      </main>
    </div>
  );
}
