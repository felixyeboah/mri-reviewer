"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
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

function extractTitle(analysisText: string): string {
  const regionMatch = analysisText.match(
    /\*\*Anatomical Region:\*\*\s*(.+)/
  );
  if (regionMatch) return regionMatch[1].trim();

  const modalityMatch = analysisText.match(/\*\*Modality:\*\*\s*(.+)/);
  if (modalityMatch) return modalityMatch[1].trim();

  return "Medical Image Review";
}

export default function NewReviewPage() {
  const router = useRouter();
  const { messages, sendMessage, status } = useChat();
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageForReference, setImageForReference] = useState<string | null>(
    null
  );
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
    // Store the data URL for saving later
    if (fileParts[0]) {
      setImageDataUrl(fileParts[0].url);
    }

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
    setImageDataUrl(null);
    setIsSaved(false);
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
  const analysisComplete = analysisText.length > 0 && !isStreaming;

  const handleSave = useCallback(async () => {
    if (!fileName || !analysisText) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: extractTitle(analysisText),
          fileName,
          imageUrl: imageDataUrl || imageForReference || "",
          analysisText,
          regions,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setIsSaved(true);
        toast.success("Review saved successfully");
        router.push(`/reviews/${saved.id}`);
      } else {
        toast.error("Failed to save review");
      }
    } catch {
      toast.error("Failed to save review");
    } finally {
      setIsSaving(false);
    }
  }, [fileName, analysisText, imageDataUrl, imageForReference, regions, router]);

  // Full-page upload view when no file selected and no analysis
  if (!hasFile && !hasAnalysis) {
    return (
      <div className="relative">
        <div className="absolute left-6 top-6 z-10">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back
            </Button>
          </Link>
        </div>
        <UploadZone
          onFileSelect={handleFileSelect}
          previewUrl={previewUrl}
          fileName={fileName}
          isAnalyzing={false}
          fullPage
        />
      </div>
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
          <div className="flex items-center gap-2">
            {analysisComplete && !isSaved && (
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving…" : "Save Review"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleReset}>
              New Analysis
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
          </div>
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
