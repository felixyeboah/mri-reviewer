"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AnalysisDisplayProps {
  content: string;
  isStreaming: boolean;
}

interface Section {
  title: string;
  body: string;
  subSections: { title: string; body: string }[];
}

function parseSections(markdown: string): Section[] {
  const parts = markdown.split(/(?=^## )/m).filter(Boolean);

  return parts.map((part) => {
    const lines = part.split("\n");
    const title = lines[0].replace(/^## /, "").trim();
    const bodyLines = lines.slice(1);
    const bodyText = bodyLines.join("\n");

    const subParts = bodyText.split(/(?=^### )/m).filter(Boolean);
    const topBody = subParts.length > 0 && !subParts[0].startsWith("### ")
      ? subParts.shift()!.trim()
      : "";

    const subSections = subParts
      .filter((s) => s.startsWith("### "))
      .map((s) => {
        const subLines = s.split("\n");
        const subTitle = subLines[0].replace(/^### /, "").trim();
        const subBody = subLines.slice(1).join("\n").trim();
        return { title: subTitle, body: subBody };
      });

    return { title, body: topBody, subSections };
  });
}

function renderBody(text: string) {
  return text.split("\n").map((line, i) => {
    // Bold labels like **Location:** value
    const boldMatch = line.match(/^\*\*(.+?):\*\*\s*(.*)/);
    if (boldMatch) {
      return (
        <p key={i} className="leading-relaxed">
          <span className="font-semibold">{boldMatch[1]}:</span>{" "}
          {boldMatch[2]}
        </p>
      );
    }

    // Blockquote (disclaimer)
    if (line.startsWith("> ")) {
      const disclaimerText = line.replace(/^>\s*/, "").replace(/\*\*/g, "");
      return (
        <div
          key={i}
          className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400"
        >
          {disclaimerText}
        </div>
      );
    }

    if (line.trim() === "") return null;

    return (
      <p key={i} className="leading-relaxed">
        {line}
      </p>
    );
  });
}

function SectionIcon({ title }: { title: string }) {
  const lower = title.toLowerCase();
  if (lower.includes("overview")) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="16" y2="12" />
        <line x1="12" x2="12.01" y1="8" y2="8" />
      </svg>
    );
  }
  if (lower.includes("anatomical")) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20a6 6 0 0 0-12 0" />
        <circle cx="12" cy="10" r="4" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
  }
  if (lower.includes("findings") || lower.includes("clinical")) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <line x1="10" x2="8" y1="9" y2="9" />
      </svg>
    );
  }
  if (lower.includes("summary")) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    );
  }
  return null;
}

export function AnalysisDisplay({ content, isStreaming }: AnalysisDisplayProps) {
  if (!content && !isStreaming) return null;

  if (!content && isStreaming) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const sections = parseSections(content);
  const isAnatomical = (title: string) =>
    title.toLowerCase().includes("anatomical");

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="flex flex-col gap-4 pr-4">
        {sections.map((section, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SectionIcon title={section.title} />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {section.body && (
                <div className="flex flex-col gap-1">
                  {renderBody(section.body)}
                </div>
              )}
              {section.subSections.map((sub, j) => (
                <div
                  key={j}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-lg border p-4",
                    isAnatomical(section.title) && "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isAnatomical(section.title) ? (
                      <Badge variant="secondary">{sub.title}</Badge>
                    ) : (
                      <h4 className="font-semibold">{sub.title}</h4>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {renderBody(sub.body)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {isStreaming && (
          <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
            Analyzing...
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
