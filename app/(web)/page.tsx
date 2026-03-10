import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiBrain01Icon,
  Upload03Icon,
  SparklesIcon,
  Target02Icon,
  SecurityCheckIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 lg:px-20">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={AiBrain01Icon} className="size-5" />
          <span className="text-sm font-semibold tracking-tight">
            MRI Reviewer
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-20 text-center md:pt-32 md:pb-28">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          AI-Powered Radiology Analysis
        </div>

        <h1 className="text-xl leading-[1.1] font-bold tracking-tight md:text-3xl">
          Every Scan Reviewed.
          <br />
          <span className="text-muted-foreground">Nothing Missed.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-sm text-muted-foreground">
          Upload an MRI, CT, or X-ray and get structured analysis with
          anatomical region mapping in seconds. Built for radiologists,
          researchers, and medical students.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/reviews/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Free Analysis
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </Link>
          <Link
            href="/reviews"
            className="inline-flex h-10 items-center rounded-lg border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
          >
            View Past Reviews
          </Link>
        </div>
      </section>

      {/* Product Screenshot */}
      <section className="mx-auto max-w-5xl px-6">
        <div className="overflow-hidden rounded-xl border border-border bg-muted/50 shadow-2xl shadow-black/5">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
            <div className="size-2.5 rounded-full bg-foreground/10" />
            <div className="size-2.5 rounded-full bg-foreground/10" />
            <div className="size-2.5 rounded-full bg-foreground/10" />
            <div className="ml-3 h-5 w-48 rounded-md bg-foreground/5" />
          </div>
          <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
            {/* Left panel - Image preview mock */}
            <div className="flex flex-col items-center justify-center bg-background px-8 py-16">
              <div className="relative">
                <div className="size-48 rounded-2xl bg-muted" />
                {/* Region markers */}
                <div className="absolute top-4 left-8 flex size-5 items-center justify-center rounded-full bg-chart-3 text-[10px] font-bold text-white">
                  1
                </div>
                <div className="absolute top-12 right-6 flex size-5 items-center justify-center rounded-full bg-chart-1 text-[10px] font-bold text-white">
                  2
                </div>
                <div className="absolute bottom-8 left-12 flex size-5 items-center justify-center rounded-full bg-chart-5 text-[10px] font-bold text-white">
                  3
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="rounded-md bg-chart-3/10 px-2 py-1 text-[10px] font-medium text-chart-3">
                  Frontal Lobe
                </div>
                <div className="rounded-md bg-chart-1/10 px-2 py-1 text-[10px] font-medium text-chart-1">
                  Ventricle
                </div>
                <div className="rounded-md bg-chart-5/10 px-2 py-1 text-[10px] font-medium text-chart-5">
                  Cerebellum
                </div>
              </div>
            </div>
            {/* Right panel - Analysis mock */}
            <div className="space-y-4 bg-background px-8 py-8">
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-foreground/10" />
                <div className="h-2.5 w-full rounded bg-foreground/5" />
                <div className="h-2.5 w-4/5 rounded bg-foreground/5" />
                <div className="h-2.5 w-3/5 rounded bg-foreground/5" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-36 rounded bg-foreground/10" />
                <div className="h-2.5 w-full rounded bg-foreground/5" />
                <div className="h-2.5 w-5/6 rounded bg-foreground/5" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-foreground/10" />
                <div className="h-2.5 w-full rounded bg-foreground/5" />
                <div className="h-2.5 w-2/3 rounded bg-foreground/5" />
                <div className="h-2.5 w-4/5 rounded bg-foreground/5" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-32 rounded bg-foreground/10" />
                <div className="h-2.5 w-full rounded bg-foreground/5" />
                <div className="h-2.5 w-3/4 rounded bg-foreground/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="mx-auto mt-20 max-w-4xl px-6">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Upload03Icon,
              title: "Drag & Drop",
              desc: "MRI, CT, X-ray, or PDF",
            },
            {
              icon: SparklesIcon,
              title: "AI Analysis",
              desc: "Gemini 3.1 Pro vision",
            },
            {
              icon: Target02Icon,
              title: "Region Mapping",
              desc: "Precise x,y coordinates",
            },
            {
              icon: SecurityCheckIcon,
              title: "Save & Review",
              desc: "Persistent review history",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-1 bg-background px-5 py-5"
            >
              <div className="mb-1 text-muted-foreground">
                <HugeiconsIcon icon={f.icon} className="size-4" />
              </div>
              <span className="text-sm font-medium">{f.title}</span>
              <span className="text-xs text-muted-foreground">{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="mx-auto mt-28 max-w-5xl px-6">
        <div className="text-center">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            From upload to insight
            <br />
            in three steps.
          </h2>
        </div>

        {/* Step cards - 2 column top, 1 wide bottom */}
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Card 1: Upload */}
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="px-6 pt-6 pb-4">
              <h3 className="text-lg font-bold">Upload Your Scan</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag and drop any medical image. We handle
                <br className="hidden sm:block" /> MRI, CT, X-ray, and PDF
                reports.
              </p>
            </div>
            {/* Visual: upload flow diagram */}
            <div className="flex flex-col items-center gap-3 px-6 pt-4 pb-8">
              {/* Drop zone mock */}
              <div className="flex w-full max-w-xs flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-8">
                <HugeiconsIcon
                  icon={Upload03Icon}
                  className="size-6 text-muted-foreground"
                />
                <span className="text-xs font-medium">Drop your file here</span>
                <span className="text-[10px] text-muted-foreground">
                  PNG, JPEG, WebP, PDF up to 20 MB
                </span>
              </div>
              {/* File chips */}
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1.5">
                  <div className="size-3 rounded-sm bg-chart-3/30" />
                  <span className="text-[10px] font-medium">brain_mri.png</span>
                  <span className="text-[10px] text-emerald-600">&#10003;</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1.5">
                  <div className="size-3 rounded-sm bg-chart-1/30" />
                  <span className="text-[10px] font-medium">
                    chest_xray.pdf
                  </span>
                  <span className="text-[10px] text-emerald-600">&#10003;</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: AI Analysis */}
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="px-6 pt-6 pb-4">
              <h3 className="text-lg font-bold">AI Reviews the Image</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Gemini 3.1 Pro identifies modality, maps regions,
                <br className="hidden sm:block" /> and generates a structured
                report.
              </p>
            </div>
            {/* Visual: analysis pipeline flowchart */}
            <div className="flex flex-col items-center gap-0 px-6 pt-4 pb-8">
              {/* Step nodes */}
              <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <div className="flex size-5 items-center justify-center rounded-full bg-chart-3 text-[9px] font-bold text-white">
                  <HugeiconsIcon icon={SparklesIcon} className="size-3" />
                </div>
                <span className="text-xs font-medium">
                  Identify Imaging Modality
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <div className="flex size-5 items-center justify-center rounded-full bg-chart-1 text-[9px] font-bold text-white">
                  <HugeiconsIcon icon={Target02Icon} className="size-3" />
                </div>
                <span className="text-xs font-medium">
                  Map Anatomical Regions
                </span>
                <span className="rounded bg-chart-1/10 px-1.5 py-0.5 text-[9px] font-medium text-chart-1">
                  x,y%
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <div className="flex size-5 items-center justify-center rounded-full bg-chart-5 text-[9px] font-bold text-white">
                  <HugeiconsIcon icon={SecurityCheckIcon} className="size-3" />
                </div>
                <span className="text-xs font-medium">
                  Clinical Findings Report
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              {/* Result */}
              <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900 dark:bg-emerald-950">
                <span className="text-xs text-emerald-600">&#10003;</span>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Analysis Complete
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Explore - full width */}
          <div className="overflow-hidden rounded-xl border border-border bg-background md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="flex flex-col justify-center px-6 py-6">
                <h3 className="text-lg font-bold">Explore the Findings</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Interactive markers overlay the image at precise locations.
                  Click any region to see detailed observations and clinical
                  notes.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="rounded-md bg-chart-3/10 px-2.5 py-1 text-[11px] font-medium text-chart-3">
                    Frontal Lobe
                  </div>
                  <div className="rounded-md bg-chart-1/10 px-2.5 py-1 text-[11px] font-medium text-chart-1">
                    Left Ventricle
                  </div>
                  <div className="rounded-md bg-chart-5/10 px-2.5 py-1 text-[11px] font-medium text-chart-5">
                    Cerebellum
                  </div>
                  <div className="rounded-md bg-chart-2/10 px-2.5 py-1 text-[11px] font-medium text-chart-2">
                    Temporal Lobe
                  </div>
                </div>
              </div>
              {/* Visual: interactive scan with markers */}
              <div className="flex items-center justify-center bg-muted/30 px-8 py-10">
                <div className="relative">
                  {/* Scan placeholder */}
                  <div className="size-52 rounded-2xl bg-gradient-to-br from-muted to-muted/50" />
                  {/* Crosshair lines */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute h-full w-px bg-foreground/5" />
                    <div className="absolute h-px w-full bg-foreground/5" />
                  </div>
                  {/* Region markers with pulse */}
                  <div className="absolute top-6 left-10">
                    <div className="absolute -inset-1.5 animate-ping rounded-full bg-chart-3/20" />
                    <div className="relative flex size-5 items-center justify-center rounded-full bg-chart-3 text-[9px] font-bold text-white">
                      1
                    </div>
                  </div>
                  <div className="absolute top-16 right-8">
                    <div className="flex size-5 items-center justify-center rounded-full bg-chart-1 text-[9px] font-bold text-white">
                      2
                    </div>
                  </div>
                  <div className="absolute right-12 bottom-12">
                    <div className="flex size-5 items-center justify-center rounded-full bg-chart-5 text-[9px] font-bold text-white">
                      3
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-14">
                    <div className="flex size-5 items-center justify-center rounded-full bg-chart-2 text-[9px] font-bold text-white">
                      4
                    </div>
                  </div>
                  {/* Tooltip mock */}
                  <div className="absolute -top-2 left-20 rounded-md border border-border bg-background px-2.5 py-1.5 shadow-sm">
                    <p className="text-[10px] font-semibold">Frontal Lobe</p>
                    <p className="text-[9px] text-muted-foreground">
                      Normal morphology observed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto mt-28 max-w-3xl px-6">
        <div className="grid grid-cols-3 divide-x divide-border text-center">
          {[
            { value: "< 30s", label: "Average analysis time" },
            { value: "6+", label: "Imaging modalities" },
            { value: "100%", label: "Client-side privacy" },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-2">
              <p className="text-2xl font-bold tracking-tight md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-28 max-w-xl px-6 pb-28 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Ready to analyze your first scan?
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          No account required. Upload an image and get results instantly.
        </p>
        <div className="mt-6">
          <Link
            href="/reviews/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Analysis
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 md:px-12 lg:px-20">
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={AiBrain01Icon} className="size-4" />
            <span>MRI Reviewer</span>
          </div>
          <p>
            For educational and research purposes only. Not a substitute for
            professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
