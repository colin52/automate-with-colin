// src/components/HomeClient.tsx
"use client";

/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";

import Section from "@/components/Section";
import NavDots from "@/components/NavDots";
import { useActiveTheme } from "@/components/useActiveTheme";
import Footer from "@/components/Footer";

// Solid-background PNG next to this file (or put in /public and update path)
import brandPng from "./logo.png";

type ThemeMode = "dark" | "light";
type CTA = { label: string; href: string };
type SectionData = {
  id: string;
  eyebrow?: string;
  title: string;
  body?: string;
  cta?: CTA[];
  invert?: boolean;
};

/* -------------------------- Logo keying (no flash) ------------------------- */
function KeyedLogo({
  theme,
  source,
  className,
}: {
  theme: ThemeMode;
  source: StaticImageData;
  className?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.decoding = "async";
    img.src = source.src;

    img.onload = () => {
      if (cancelled) return;
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, w, h);
      const id = ctx.getImageData(0, 0, w, h);
      const data = id.data;

      const hardCut = 245;
      const softCut = 232;
      const mono = theme === "dark" ? 255 : 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (r >= hardCut && g >= hardCut && b >= hardCut) {
          data[i + 3] = 0; // fully transparent
          continue;
        }
        if (r >= softCut && g >= softCut && b >= softCut) {
          const avg = (r + g + b) / 3;
          const t = Math.min(1, Math.max(0, (hardCut - avg) / (hardCut - softCut)));
          data[i + 3] = Math.round(a * t); // feather
        }

        data[i] = mono;
        data[i + 1] = mono;
        data[i + 2] = mono;
      }

      ctx.putImageData(id, 0, 0);
      setDims({ w, h });
      setDataUrl(canvas.toDataURL("image/png"));
    };

    return () => {
      cancelled = true;
    };
  }, [theme, source]);

  if (!dataUrl || !dims) return null;

  return (
    <Image
      src={dataUrl}
      alt="Automate with Colin"
      width={dims.w}
      height={dims.h}
      priority
      unoptimized
      className={className ?? "h-auto w-full select-none"}
    />
  );
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left bg-black/40"
    />
  );
}

/* --------------------------------- Icons ---------------------------------- */
function IconWorkflow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M4 4h6v6H4zM14 14h6v6h-6z" strokeWidth="1.5" />
      <path d="M10 7h4a3 3 0 013 3v1M14 17h-4a3 3 0 01-3-3v-1" strokeWidth="1.5" />
    </svg>
  );
}
function IconBot(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="4" y="7" width="16" height="10" rx="2" strokeWidth="1.5" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <path d="M12 4v3M8 19v1a2 2 0 002 2h4a2 2 0 002-2v-1" strokeWidth="1.5" />
    </svg>
  );
}
function IconCable(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M4 12h6M14 12h6" strokeWidth="1.5" />
      <rect x="2" y="10" width="4" height="4" rx="1" />
      <rect x="18" y="10" width="4" height="4" rx="1" />
      <path d="M10 12c0-4 4-4 4 0" strokeWidth="1.5" />
    </svg>
  );
}
function IconCode(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M8 16l-4-4 4-4M16 8l4 4-4 4" strokeWidth="1.5" />
    </svg>
  );
}

/* ------------------------------ Page 1 (white) ----------------------------- */
function FeatureGrid() {
  const items = [
    { icon: IconWorkflow, title: "Automation Systems", blurb: "Replace manual steps with reliable flows that scale.", pill: "AI inside" },
    { icon: IconBot,       title: "AI Sidekicks",        blurb: "Practical copilots for ops, support, and decisions.",  pill: "Your data, securely" },
    { icon: IconCable,     title: "Integrations",        blurb: "Apps working together—APIs, webhooks, and clean handoffs.", pill: "API-first" },
    { icon: IconCode,      title: "Custom Development",  blurb: "When templates aren’t enough, we engineer it.", pill: "Full-stack" },
  ];

  return (
    <section id="capabilities" data-theme="light" className="bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 pt-10 md:pt-14">
        {/* Tagline + CTAs */}
        <div className="text-center">
          <h1 className="font-bold leading-tight">
            <span className="block text-4xl md:text-5xl">Smarter Systems.</span>
            <span className="block text-4xl md:text-5xl">Stronger Businesses.</span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg text-black/75">
            Automate the grind and add AI where it actually pays.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#playbooks"
              className="rounded-full border border-black/15 bg-black text-white px-5 py-2 text-sm font-medium hover:bg-black/90 active:scale-[.99]"
            >
              Work With Us
            </a>
            <a
              href="#community"
              className="rounded-full border border-black/15 bg-black/5 px-5 py-2 text-sm font-medium hover:bg-black/10 active:scale-[.99]"
            >
              Learn to Automate
            </a>
          </div>
        </div>

        {/* What we build */}
        <div className="mt-10 md:mt-12">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-black/80 text-center md:text-left">
            What We Build
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {items.map(({ icon: Icon, title, blurb, pill }, i) => (
              <motion.div
                key={title}
                initial={{ y: 12, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="rounded-2xl border border-black/12 p-6 shadow-[0_2px_24px_rgba(0,0,0,0.05)] bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl border border-black/15 p-3 text-black">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium">{title}</h3>
                      <span className="rounded-full border border-black/15 px-2 py-0.5 text-xs">
                        {pill}
                      </span>
                    </div>
                    <p className="mt-1 text-black/75">{blurb}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Give a little space at the bottom so the last card isn't glued to the fold */}
        <div className="h-12 md:h-16" />
      </div>
    </section>
  );
}

/* ------------------------------ Page 2 (black) ----------------------------- */
function PlaybooksCarousel() {
  const plays = [
    { name: "Missed-Call SMS Bot",   time: "Deploy in a week", result: "Captures 20–40% lost leads" },
    { name: "Invoice → Journal Entry", time: "Deploy in days",  result: "Touchless accounting handoffs" },
    { name: "Contract Generator",    time: "Deploy in a week",  result: "One-click Word→PDF→Sign" },
    { name: "Field Tech Scheduler",  time: "Deploy in 2 weeks", result: "Balanced load, fewer no-shows" },
    { name: "Lead Router",           time: "Deploy in days",    result: "Speed-to-lead done right" },
  ];

  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section id="playbooks" data-theme="dark" className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-14">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/70">Templates & Playbooks</p>
        <h2 className="text-3xl font-semibold">Grab a proven starter and go</h2>

        <div className="relative mt-6">
          {/* Desktop arrows */}
          <button
            aria-label="Previous"
            onClick={() => scrollByCards(-1)}
            className="hidden md:flex absolute left-0 top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 w-9 h-9 hover:bg-white/20 transition"
          >
            ‹
          </button>
          <button
            aria-label="Next"
            onClick={() => scrollByCards(1)}
            className="hidden md:flex absolute right-0 top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 w-9 h-9 hover:bg-white/20 transition"
          >
            ›
          </button>

          <div
            ref={trackRef}
            className="no-scrollbar overflow-x-auto scroll-smooth"
          >
            <div className="flex min-w-[640px] gap-4 pr-1">
              {plays.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  data-card
                  className="min-w-[280px] rounded-2xl border border-white/12 bg-white/5 p-5 backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{p.name}</h3>
                    <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-white/80">
                      {p.time}
                    </span>
                  </div>
                  <p className="mt-2 text-white/85">{p.result}</p>
                  <a
                    href="#contact"
                    className="mt-4 inline-block text-sm underline decoration-white/40 underline-offset-4"
                  >
                    See how it works →
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* hide native scrollbar */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}

/* ------------------------------ Page 3 (white) ----------------------------- */
function StatsStrip() {
  const stats = [
    { k: "Hours Saved", v: "12,000+" },
    { k: "Systems Shipped", v: "120+" },
    { k: "Template Library", v: "40+" },
    { k: "Avg ROI (12 mo)", v: "3.7×" },
  ];
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 pt-6 md:pt-8 pb-8 md:pb-10 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.k} className="rounded-2xl border border-black/15 p-5 text-center">
          <div className="text-2xl font-semibold">{s.v}</div>
          <div className="text-sm text-black/60">{s.k}</div>
        </div>
      ))}
    </div>
  );
}
function ProcessStrip() {
  const steps = [
    { k: "Discover", d: "Map goals & bottlenecks." },
    { k: "Design", d: "Blueprint the future workflow." },
    { k: "Deliver", d: "Ship MVP, iterate with data." },
    { k: "Uplift", d: "Measure, train, hand off." },
  ];
  return (
    <div className="mx-auto max-w-6xl px-6 pt-0 pb-14">
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-black/80">Process</p>
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.k}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-black/12 p-5"
          >
            <div className="text-sm text-black/55">Step {i + 1}</div>
            <div className="mt-1 text-lg font-medium">{s.k}</div>
            <div className="mt-1 text-black/75">{s.d}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
function PageThreeAllWhite() {
  return (
    <section id="page-three" data-theme="light" className="bg-white text-black">
      <StatsStrip />
      <ProcessStrip />
    </section>
  );
}

/* ------------------------------ Community (white) -------------------------- */
function Community() {
  return (
    <section id="community" data-theme="light" className="bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-18 md:pt-10 md:pb-20">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-black/70">Community</p>
        <h2 className="text-3xl font-semibold">Build with us, not alone</h2>
        <p className="mt-3 max-w-2xl text-black/80">
          Workshops, templates, office hours, and a community of builders swapping real-world playbooks.
          Learn what actually works, ship faster, and get unstuck with feedback.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="https://skool.link/your-group"
            className="rounded-full border border-black/15 bg-black/5 px-5 py-2 text-sm font-medium hover:bg-black/10 transition"
          >
            Join the Community
          </a>
          <a
            href="#contact"
            className="rounded-full border border-black/15 bg-black/5 px-5 py-2 text-sm font-medium hover:bg-black/10 transition"
          >
            Ask About Coaching
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Page ---------------------------------- */
export default function HomeClient() {
  // Final contact (uses your Section component)
  const sections: SectionData[] = [
    {
      id: "contact",
      title: "Talk to Colin",
      body: "Bring us your bottleneck. We’ll map it, automate the grind, and add AI where it actually pays.",
      cta: [{ label: "Let’s Automate", href: "https://calendly.com/your-link" }],
      invert: true,
    },
  ];

  const ids = useMemo<string[]>(
    () => ["capabilities", "playbooks", "page-three", "community", ...sections.map((s) => s.id)],
    [sections]
  );

  const theme = useActiveTheme(ids);

  return (
    <>
      <ScrollProgressBar />

      {/* Sticky header with hard-refresh on logo click */}
      <header
        className={`sticky top-0 z-40 border-b ${
          theme === "dark" ? "border-white/10 bg-black/60" : "border-black/10 bg-white/70"
        } backdrop-blur`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== "undefined") window.location.assign("/");
            }}
            className="block w-[160px] md:w-[200px]"
            aria-label="Go to homepage"
          >
            <KeyedLogo theme={theme} source={brandPng} />
          </a>
          <nav className="ml-auto hidden gap-5 text-sm md:flex">
            <a href="#capabilities" className="opacity-80 hover:opacity-100">What we build</a>
            <a href="#playbooks" className="opacity-80 hover:opacity-100">Playbooks</a>
            <a href="#page-three" className="opacity-80 hover:opacity-100">Process</a>
            <a href="#community" className="opacity-80 hover:opacity-100">Community</a>
            <a href="#contact" className="opacity-80 hover:opacity-100">Contact</a>
          </nav>
        </div>
      </header>

      <NavDots ids={ids} />

      {/* Page 1 */}
      <FeatureGrid />

      {/* Page 2 */}
      <PlaybooksCarousel />

      {/* Page 3 */}
      <PageThreeAllWhite />

      {/* More content */}
      <Community />

      {/* Contact */}
      {sections.map((s) => (
        <Section key={s.id} {...s} />
      ))}

      {/* Spacer so footer never overlaps contact */}
      <div className="h-10 md:h-14" />

      <Footer />
    </>
  );
}
