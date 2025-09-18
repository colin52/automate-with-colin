// src/components/HomeClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import TypeCycle from "@/components/TypeCycle";
import Section from "@/components/Section";
import NavDots from "@/components/NavDots";
import { useActiveTheme } from "@/components/useActiveTheme";

// Keep your existing solid-background PNG next to this file
import brand from "./logo.png";

/**
 * KeyedLogo
 * - Converts the opaque PNG to transparent (chroma-keys near-white)
 * - Recolors strokes to white on dark sections, black on light sections
 * - Calls onReady once the processed image is available
 * - Renders NOTHING until processing is done (prevents the white flash)
 */
function KeyedLogo({
  theme,
  onReady,
}: {
  theme: "dark" | "light";
  onReady?: () => void;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.src = (brand as any).src ?? (brand as unknown as string);

    img.onload = () => {
      if (cancelled) return;
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, w, h);
      const id = ctx.getImageData(0, 0, w, h);
      const data = id.data;

      // Tune these thresholds as needed for your PNG:
      const hardCut = 245; // >= → fully transparent
      const softCut = 232; // >= → feather/partial alpha
      const toWhite = theme === "dark";

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

        if (r >= hardCut && g >= hardCut && b >= hardCut) {
          data[i + 3] = 0; // punch out full white
          continue;
        }
        if (r >= softCut && g >= softCut && b >= softCut) {
          const avg = (r + g + b) / 3;
          const t = Math.min(1, Math.max(0, (hardCut - avg) / (hardCut - softCut)));
          data[i + 3] = a * t; // feather edges
        }

        // Recolor strokes to mono for contrast
        const v = toWhite ? 255 : 0;
        data[i] = v; data[i + 1] = v; data[i + 2] = v;
      }

      ctx.putImageData(id, 0, 0);
      const url = c.toDataURL("image/png");
      setSrc(url);
      onReady?.();
    };

    return () => { cancelled = true; };
  }, [theme, onReady]);

  if (!src) return null; // ← key line: don't render original PNG at all
  return <img src={src} alt="Automate with Colin" className="h-auto w-full" />;
}

const sections = [
  {
    id: "mission",
    title: "Smarter Systems. Stronger Businesses.",
    body:
      "We map your workflows, uncover inefficiencies, and build automations that save time, reduce costs, and give you a competitive edge.",
    cta: [{ label: "See How We Work", href: "#process" }],
    invert: true,
  },
  {
    id: "services",
    eyebrow: "Services",
    title: "Consult • Build • Train",
    body:
      "Done-for-you automation, architecture and implementation, plus enablement for your team so the wins keep compounding.",
    cta: [{ label: "Book a Call", href: "https://calendly.com/your-link" }],
  },
  {
    id: "community",
    eyebrow: "Community",
    title: "Learn, Share, Collaborate",
    body:
      "Courses on the latest tools and strategies, active peer support, and shared templates/apps you can use or resell.",
    cta: [{ label: "Join the Movement", href: "https://skool.link/your-group" }],
    invert: true,
  },
  {
    id: "process",
    eyebrow: "Process",
    title: "Discover → Design → Deliver",
    body:
      "We document current workflows, propose quick wins and long-term systems, then build and iterate with measurable outcomes.",
    cta: [{ label: "Start a Discovery", href: "mailto:you@yourdomain.com" }],
  },
  {
    id: "contact",
    title: "Talk to Colin",
    body:
      "Tell us where you want leverage. We’ll bring systems, automation, and AI to make it real.",
    cta: [{ label: "Let’s Automate", href: "https://calendly.com/your-link" }],
    invert: true,
  },
];

function IntroOverlay({ show }: { show: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black z-[60]"
      initial={{ opacity: 1 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.35 }}
      style={{ pointerEvents: show ? "auto" : "none" }}
    />
  );
}

function MotionLogo({
  theme,
  startDelayMs = 700,
  moveMs = 900,
  startWidth = 600,
  dockWidthMobile = 170,
  dockWidthDesktop = 240,
  onDone,
}: {
  theme: "dark" | "light";
  startDelayMs?: number;
  moveMs?: number;
  startWidth?: number;
  dockWidthMobile?: number;
  dockWidthDesktop?: number;
  onDone?: () => void;
}) {
  const [logoReady, setLogoReady] = useState(false);
  const [dock, setDock] = useState(false);

  // Start the timing ONLY after the processed logo is ready
  useEffect(() => {
    if (!logoReady) return;
    const t = setTimeout(() => setDock(true), startDelayMs);
    const d = setTimeout(() => onDone?.(), startDelayMs + moveMs);
    return () => { clearTimeout(t); clearTimeout(d); };
  }, [logoReady, startDelayMs, moveMs, onDone]);

  const dockWidth =
    typeof window !== "undefined" && window.innerWidth >= 768
      ? dockWidthDesktop
      : dockWidthMobile;

  return (
    <motion.div
      aria-label="Brand mark"
      className={`${dock ? "pointer-events-auto" : "pointer-events-none"} fixed z-[70] select-none`}
      initial={{
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
        width: startWidth,
        opacity: 1,
      }}
      animate={
        dock
          ? {
              top: 16,           // TOP-LEFT dock
              left: 16,
              x: 0,
              y: 0,
              width: dockWidth,
            }
          : undefined
      }
      transition={{ duration: moveMs / 1000, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Only render the processed logo; when it's ready we begin the timeline */}
      <Link href="/" aria-label="Go to home">
        <KeyedLogo theme={theme} onReady={() => setLogoReady(true)} />
      </Link>
    </motion.div>
  );
}

export default function HomeClient() {
  const ids = useMemo(() => ["hero", ...sections.map((s) => s.id)], []);
  const theme = useActiveTheme(ids); // "dark" | "light"
  const [introRunning, setIntroRunning] = useState(true);

  return (
    <>
      {/* App-like splash stays up until the slide finishes */}
      <IntroOverlay show={introRunning} />

      <MotionLogo
        theme={theme}
        startDelayMs={700}
        moveMs={900}
        startWidth={600}
        dockWidthMobile={170}
        dockWidthDesktop={240}
        onDone={() => {
          (window as any).__INTRO_DONE = true;
          setIntroRunning(false);
        }}
      />

      <NavDots ids={ids} />

      {/* HERO (dark) */}
      <section
        id="hero"
        data-theme="dark"
        className="h-screen snap-start grid place-items-center bg-black text-white"
      >
        <div className="text-center px-6">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] opacity-70">
            Automate with Colin
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            We Help You{" "}
            <TypeCycle
              words={["Automate", "Educate", "Elevate"]}
              typingMs={110}
              eraseMs={80}
              holdMs={1200}
              className="inline-flex"
              highlightClassName="bg-white text-black px-2 rounded"
            />
          </h1>

          <p className="mt-4 text-lg opacity-80 max-w-2xl mx-auto">
            Expert guidance, hands-on learning, and real solutions—built to scale your business.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <a
              href="#services"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/20 active:scale-[.98] transition"
            >
              Work With Us
            </a>
            <a
              href="https://skool.link/your-group"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/20 active:scale-[.98] transition"
            >
              Join the Community
            </a>
          </div>
        </div>
      </section>

      {sections.map((s) => (
        <Section key={s.id} {...s} />
      ))}
    </>
  );
}
