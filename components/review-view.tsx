"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageReference } from "@/components/image-reference";
import { AnalysisDisplay } from "@/components/analysis-display";
import { Button } from "@/components/ui/button";
import type { Region } from "@/components/image-reference";

interface ReviewViewProps {
  reviewId: number;
  initialTitle: string;
  imageUrl?: string;
  regions?: Region[];
  analysisText?: string;
  mode?: "actions" | "content" | "analysis";
}

export function ReviewView({
  reviewId,
  initialTitle,
  imageUrl,
  regions,
  analysisText,
  mode,
}: ReviewViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);

  const handleDelete = async () => {
    if (!confirm("Delete this review?")) return;
    setIsDeleting(true);
    await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    router.push("/");
  };

  const handleRename = async () => {
    if (!title.trim()) return;
    await fetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    setIsEditing(false);
    router.refresh();
  };

  // Header actions mode (default when no mode specified)
  if (!mode) {
    return (
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <input
              className="h-8 rounded-md border bg-background px-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
            />
            <Button size="sm" onClick={handleRename}>
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTitle(initialTitle);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Rename
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </>
        )}
      </div>
    );
  }

  // Image reference content
  if (mode === "content" && imageUrl && regions) {
    return <ImageReference imageUrl={imageUrl} regions={regions} />;
  }

  // Analysis text
  if (mode === "analysis" && analysisText) {
    return <AnalysisDisplay content={analysisText} isStreaming={false} />;
  }

  return null;
}
