"use client"

import { useCallback, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload03Icon } from "@hugeicons/core-free-icons"

interface UploadZoneProps {
  onFileSelect: (files: FileList) => void
  previewUrl: string | null
  fileName: string | null
  isAnalyzing: boolean
  fullPage?: boolean
}

export function UploadZone({
  onFileSelect,
  previewUrl,
  fileName,
  isAnalyzing,
  fullPage = false,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      setError(null)

      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setError("Please upload a PNG, JPG, WebP image or PDF file.")
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be under 20MB.")
        return
      }

      onFileSelect(files)
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      validateAndSelect(e.dataTransfer.files)
    },
    [validateAndSelect]
  )

  // Only show PDF icon if rendering failed (previewUrl === "pdf" fallback)
  const showPdfIcon = previewUrl === "pdf"

  const isFullPage = !previewUrl && fullPage

  return (
    <div
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center gap-6 transition-colors",
        isFullPage
          ? "min-h-svh px-6"
          : "rounded-xl border-2 border-dashed bg-card p-8 ring-1 ring-foreground/10",
        isDragOver &&
          (isFullPage ? "bg-primary/5" : "border-primary bg-primary/5"),
        isAnalyzing && "pointer-events-none opacity-60"
      )}
      onClick={() => !previewUrl && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {previewUrl ? (
        <div className="flex w-full flex-col items-center gap-4">
          {showPdfIcon ? (
            <div className="flex flex-col items-center gap-2 rounded-lg bg-muted p-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" x2="8" y1="13" y2="13" />
                <line x1="16" x2="8" y1="17" y2="17" />
                <line x1="10" x2="8" y1="9" y2="9" />
              </svg>
              <span className="text-sm font-medium text-muted-foreground">
                {fileName}
              </span>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Medical image preview"
              className="max-h-[400px] rounded-lg object-contain"
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            disabled={isAnalyzing}
          >
            Change file
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <HugeiconsIcon icon={Upload03Icon} className="size-20" />
          <div>
            <h2
              className={cn(
                "font-semibold",
                isFullPage ? "text-lg" : "text-base"
              )}
            >
              Drop your MRI or X-ray here
            </h2>
            <p
              className={cn(
                "mt-1 text-muted-foreground",
                isFullPage ? "text-sm" : "text-sm"
              )}
            >
              or click anywhere to browse. Supports PNG, JPG, WebP, and PDF.
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_FILE_TYPES.join(",")}
        onChange={(e) => validateAndSelect(e.target.files)}
      />
    </div>
  )
}
