import * as React from "react"

import { cn } from "@/lib/utils"

/* -----------------------------------------------------------------------------
 * PanelCard - A card component with header on gray background and elevated white content area
 *
 * Structure:
 * ┌─────────────────────────────────┐
 * │  Header (gray background)       │
 * │ ┌─────────────────────────────┐ │
 * │ │                             │ │
 * │ │  Content (white elevated)   │ │
 * │ │                             │ │
 * │ └─────────────────────────────┘ │
 * │  Footer (gray background)       │
 * └─────────────────────────────────┘
 * -------------------------------------------------------------------------- */

interface PanelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function PanelCard({ className, children, ...props }: PanelCardProps) {
  return (
    <div
      data-slot="panel-card"
      className={cn(
        "rounded-[20px] border border-border bg-[#F5F5F7] dark:bg-[#101010]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface PanelCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function PanelCardHeader({
  className,
  children,
  ...props
}: PanelCardHeaderProps) {
  return (
    <header
      data-slot="panel-card-header"
      className={cn("flex items-center justify-between px-5 py-4", className)}
      {...props}
    >
      {children}
    </header>
  )
}

interface PanelCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

function PanelCardTitle({
  className,
  children,
  ...props
}: PanelCardTitleProps) {
  return (
    <h2
      data-slot="panel-card-title"
      className={cn("text-[15px] font-medium text-foreground", className)}
      {...props}
    >
      {children}
    </h2>
  )
}

interface PanelCardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function PanelCardActions({
  className,
  children,
  ...props
}: PanelCardActionsProps) {
  return (
    <div
      data-slot="panel-card-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface PanelCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function PanelCardContent({
  className,
  children,
  ...props
}: PanelCardContentProps) {
  return (
    <main
      data-slot="panel-card-content"
      className={cn(
        "mb-1.5 rounded-[14px] bg-white ring-1 ring-border dark:bg-[#171717]",
        className
      )}
      {...props}
    >
      {children}
    </main>
  )
}

interface PanelCardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function PanelCardBody({ className, children, ...props }: PanelCardBodyProps) {
  return (
    <div
      data-slot="panel-card-body"
      className={cn("px-5 py-5", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface PanelCardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function PanelCardSection({
  className,
  children,
  ...props
}: PanelCardSectionProps) {
  return (
    <div
      data-slot="panel-card-section"
      className={cn("border-t border-border/30 px-5 py-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface PanelCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function PanelCardFooter({
  className,
  children,
  ...props
}: PanelCardFooterProps) {
  return (
    <footer
      data-slot="panel-card-footer"
      className={cn("px-5 py-4", className)}
      {...props}
    >
      {children}
    </footer>
  )
}

export {
  PanelCard,
  PanelCardActions,
  PanelCardBody,
  PanelCardContent,
  PanelCardFooter,
  PanelCardHeader,
  PanelCardSection,
  PanelCardTitle,
}
