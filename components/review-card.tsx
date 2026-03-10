"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  PanelCard,
  PanelCardHeader,
  PanelCardTitle,
  PanelCardActions,
  PanelCardContent,
  PanelCardBody,
  PanelCardFooter,
} from "@/components/ui/panel-card";
import { Button } from "@/components/ui/button";

interface ReviewCardProps {
  review: {
    id: number;
    title: string;
    fileName: string;
    analysisText: string;
    createdAt: Date;
  };
}

function extractSummary(text: string, maxLength = 120): string {
  const summaryMatch = text.match(/## Summary\n([\s\S]*?)(?=\n>|$)/);
  const raw = summaryMatch
    ? summaryMatch[1].trim()
    : text.replace(/##.*\n/g, "").trim();
  return raw.length > maxLength ? raw.slice(0, maxLength) + "…" : raw;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this review?")) return;

    setIsDeleting(true);
    await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
    router.refresh();
  };

  const date = new Date(review.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/reviews/${review.id}`}>
      <PanelCard className="transition-shadow hover:shadow-md">
        <PanelCardHeader>
          <PanelCardTitle className="truncate">{review.title}</PanelCardTitle>
          <PanelCardActions>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </Button>
          </PanelCardActions>
        </PanelCardHeader>
        <PanelCardContent>
          <PanelCardBody>
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {extractSummary(review.analysisText)}
            </p>
          </PanelCardBody>
        </PanelCardContent>
        <PanelCardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{review.fileName}</span>
          <span className="shrink-0">{formattedDate}</span>
        </PanelCardFooter>
      </PanelCard>
    </Link>
  );
}
