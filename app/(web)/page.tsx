import Link from "next/link"
import Image from "next/image"
import { headers } from "next/headers"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiBrain01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { auth } from "@/lib/auth"

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md border border-border bg-muted/50">
            <HugeiconsIcon icon={AiBrain01Icon} className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            MRI Reviewer
          </span>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="text-xs text-muted-foreground">
                {session.user.name}
              </span>
              <Link
                href="/reviews"
                className="inline-flex h-8 items-center rounded-md border border-border bg-foreground px-4 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex h-8 items-center rounded-md border border-border bg-foreground px-4 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-16 md:pt-24">
        <div className="flex flex-col items-center text-center">
          {/* Status badge */}
          <div className="mb-8 flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-1.5">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] text-muted-foreground">
              3D Heightmap Visualization + AI Analysis
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-2xl text-3xl font-bold leading-[1.15] tracking-tight md:text-5xl">
            Medical imaging,
            <br />
            <span className="text-muted-foreground">rendered in depth.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Upload any MRI, CT, or X-ray. Get a 3D heightmap you can rotate,
            slice, and measure — with AI-generated anatomical analysis in seconds.
          </p>

          {/* CTA */}
          <div className="mt-8 flex items-center gap-3">
            <Link
              href="/reviews/new"
              className="group inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-all hover:bg-foreground/90"
            >
              Start Analysis
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/reviews"
              className="inline-flex h-10 items-center rounded-lg border border-border px-5 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
            >
              View Reviews
            </Link>
          </div>
        </div>

        {/* Product Screenshot — the hero */}
        <div className="relative mt-16 md:mt-20">
          {/* Glow behind screenshot */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent blur-2xl" />
          <div className="absolute inset-x-0 -bottom-8 h-32 bg-gradient-to-t from-background to-transparent" />

          {/* Browser chrome */}
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background shadow-2xl shadow-black/20">
            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="size-2 rounded-full bg-foreground/10" />
                <div className="size-2 rounded-full bg-foreground/10" />
                <div className="size-2 rounded-full bg-foreground/10" />
              </div>
              <div className="ml-2 flex h-5 flex-1 items-center rounded-md bg-foreground/5 px-3">
                <span className="text-[10px] text-muted-foreground/50">
                  mri-reviewer.app/reviews/1
                </span>
              </div>
            </div>
            <Image
              src="/images/hero-image.png"
              alt="MRI Reviewer — 3D heightmap visualization with AI analysis"
              width={1920}
              height={1080}
              className="block w-full"
              priority
            />
          </div>
        </div>
      </section>

      {/* Capabilities — tight grid */}
      <section className="relative z-10 mx-auto mt-32 max-w-5xl px-6">
        <div className="mb-10 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground">
            Capabilities
          </span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "3D Heightmap",
              desc: "Pixel brightness becomes elevation. Rotate, zoom, and pan to explore tissue density as a tactile 3D surface.",
              tag: "React Three Fiber",
            },
            {
              label: "AI Analysis",
              desc: "Gemini 3.1 Pro vision identifies modality, maps anatomical regions, and generates structured clinical reports.",
              tag: "< 30s",
            },
            {
              label: "Region Mapping",
              desc: "Click numbered markers to zoom into specific anatomical regions with detailed observations and findings.",
              tag: "x,y coordinates",
            },
            {
              label: "Color Modes",
              desc: "Switch between grayscale, heatmap, and contour views to highlight different tissue characteristics.",
              tag: "3 modes",
            },
            {
              label: "Measurement",
              desc: "Click two points on the 3D surface to measure distance. Crosshair slices show intensity profiles.",
              tag: "Interactive",
            },
            {
              label: "Privacy First",
              desc: "All image processing happens client-side. Your medical data never leaves your browser.",
              tag: "Client-side",
            },
          ].map((cap) => (
            <div
              key={cap.label}
              className="group flex flex-col justify-between bg-background p-6 transition-colors hover:bg-muted/30"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{cap.label}</h3>
                  <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[9px] text-muted-foreground">
                    {cap.tag}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {cap.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — horizontal steps */}
      <section className="relative z-10 mx-auto mt-32 max-w-5xl px-6">
        <div className="mb-10 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground">
            Workflow
          </span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Upload",
              desc: "Drag and drop any MRI, CT, X-ray, or PDF. Supports PNG, JPEG, WebP up to 20 MB.",
            },
            {
              step: "02",
              title: "Analyze",
              desc: "AI processes the image, identifies the modality, maps anatomical regions with precise coordinates.",
            },
            {
              step: "03",
              title: "Explore",
              desc: "Interact with the 3D heightmap. Click regions, adjust depth, switch color modes, measure distances.",
            },
          ].map((s, i) => (
            <div key={s.step} className="relative">
              {i < 2 && (
                <div className="absolute top-4 right-0 hidden h-px w-6 translate-x-full bg-border/50 md:block" />
              )}
              <div className="rounded-xl border border-border/60 bg-background p-6">
                <span className="text-[10px] font-medium text-muted-foreground/50">
                  {s.step}
                </span>
                <h3 className="mt-2 text-lg font-bold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 mx-auto mt-32 max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-4">
          {[
            { value: "< 30s", label: "Analysis time" },
            { value: "6+", label: "Modalities" },
            { value: "3D", label: "Heightmap viewer" },
            { value: "100%", label: "Client-side" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-background px-6 py-5 text-center"
            >
              <p className="text-xl font-bold tracking-tight">{stat.value}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto mt-32 max-w-xl px-6 pb-32 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          See your scans
          <br />
          <span className="text-muted-foreground">like never before.</span>
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          No account required. Upload an image and explore in 3D instantly.
        </p>
        <div className="mt-8">
          <Link
            href="/reviews/new"
            className="group inline-flex h-11 items-center gap-2 rounded-lg bg-foreground px-7 text-sm font-medium text-background transition-all hover:bg-foreground/90"
          >
            Start Free Analysis
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-6 py-6 md:px-12 lg:px-20">
        <div className="flex flex-col items-center justify-between gap-3 text-[11px] text-muted-foreground/60 sm:flex-row">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={AiBrain01Icon} className="size-3.5" />
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
