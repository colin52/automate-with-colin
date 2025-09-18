// src/components/HomeClient.tsx
"use client";

/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";

import TypeCycle from "@/components/TypeCycle";
import Section from "@/components/Section";
import NavDots from "@/components/NavDots";
import { useActiveTheme } from "@/components/useActiveTheme";

// Import your solid-background PNG placed next to this file (or in /public and adjust import)
import brandPng from "./logo.png";

/** Allow a window flag without using `any` */
declare global {
  interface Window {
    __INTRO_DONE?: boolean;
  }
}

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

/**
 * KeyedLogo
 * - Loads the opaque PNG, chroma-keys near-white to transparent,
 * - Recolors remaining pixels to mono (white on dark, black on light),
 * - Exposes a data: URL + intrinsic dimensions so we can render via next/image,
 * - Calls onReady() when the processed image is ready.
 */
function KeyedLogo({
  theme,
  onReady,
  source,
}: {
  theme: ThemeMode;
  onReady?: () => void;
  source: StaticImageData;
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

      // Thresholds for white knockout + feather (tweak if needed)
      const hardCut = 245; // >= fully transparent
      const softCut = 232; // >= feather/partial alpha
      const toWhite = theme === "dark";
      const mono = toWhite ? 255 : 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (r >= hardCut && g >= hardCut && b >= hardCut) {
          data[i + 3] = 0; // remove pure white bg
          continue;
        }
        if (r >= softCut && g >= softCut && b >= softCut) {
          // feather edge alpha
          const avg = (r + g + b) / 3;
          const t = Math.min(1, Math.max(0, (hardCut - avg) / (hardCut - softCut)));
          data[i + 3] = Math.round(a * t);
        }

        // recolor remaining strokes to mono contrast
        data[i] = mono;
        data[i + 1] = mono;
        data[i + 2] = mono;
      }

      ctx.putImageData(id, 0, 0);
      const url = canvas.toDataURL("image/png");

      setDims({ w, h });
      setDataUrl(url);
      onReady?.();
    };

    return () => {
      cancelled = true;
    };
  }, [theme, onReady, source]);

  if (!dataUrl || !dims) return null;

  // Render the generated image via next/image (unoptimized for data URLs)
  return (
    <Image
      src={dataUrl}
      alt="Automate with Colin"
      width={dims.w}
      height={dims.h}
      priority
      unoptimized
      className="h-auto w-full select-none"
    />
  );
}

const sections: SectionData[] = [
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
      className="fixed inset-0 z-[60] bg-black"
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
  theme: ThemeMode;
  startDelayMs?: number;
  moveMs?: number;
  startWidth?: number;
  dockWidthMobile?: number;
  dockWidthDesktop?: number;
  onDone?: () => void;
}) {
  const [logoReady, setLogoReady] = useState<boolean>(false);
  const [dock, setDock] = useState<boolean>(false);

  // trigger the move after the keyed logo is ready
  useEffect(() => {
    if (!logoReady) return;
    const t = window.setTimeout(() => setDock(true), startDelayMs);
    const d = window.setTimeout(() => onDone?.(), startDelayMs + moveMs);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(d);
    };
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
              top: 16,
              left: 16, // top-left dock; change to right by using { right: 16, left: "auto" }
              x: 0,
              y: 0,
              width: dockWidth,
            }
          : undefined
      }
      transition={{ duration: moveMs / 1000, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href="/" aria-label="Go to home">
        <KeyedLogo
          theme={theme}
          source={brandPng}
          onReady={() => setLogoReady(true)}
        />
      </Link>
    </motion.div>
  );
}

export default function HomeClient() {
  const ids = useMemo<string[]>(() => ["hero", ...sections.map((s) => s.id)], []);
  const theme = useActiveTheme(ids); // "dark" | "light"
  const [introRunning, setIntroRunning] = useState<boolean>(true);

  return (
    <>
      {/* Splash overlay during the center→dock animation */}
      <IntroOverlay show={introRunning} />

      <MotionLogo
        theme={theme}
        startDelayMs={700}
        moveMs={900}
        startWidth={600}
        dockWidthMobile={170}
        dockWidthDesktop={260}
        onDone={() => {
          window.__INTRO_DONE = true;
          setIntroRunning(false);
        }}
      />

      <NavDots ids={ids} />

      {/* HERO (dark) */}
      <section
        id="hero"
        data-theme="dark"
        className="grid h-screen place-items-center bg-black text-white snap-start"
      >
        <div className="px-6 text-center">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] opacity-70">
            Automate with Colin
          </div>

          <h1 className="text-5xl font-bold leading-tight md:text-6xl">
            We Help You{" "}
            <TypeCycle
              words={["Automate", "Educate", "Elevate"]}
              typingMs={110}  // slower per your request
              eraseMs={80}
              holdMs={1200}
              className="inline-flex"
              highlightClassName="rounded bg-white px-2 text-black"
            />
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-80">
            Expert guidance, hands-on learning, and real solutions—built to scale your business.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <a
              href="#services"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20 active:scale-[.98]"
            >
              Work With Us
            </a>
            <a
              href="https://skool.link/your-group"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20 active:scale-[.98]"
            >
              Join the Community
            </a>
          </div>
        </div>
      </section>

      {/* Remaining sections */}
      {sections.map((s) => (
        <Section key={s.id} {...s} />
      ))}
    </>
  );
}
