"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import TypeCycle from "@/components/TypeCycle";
import Footer from "@/components/Footer";
import brandPng from "./logo.png";

/* ======================== TWEAKABLE CONSTANTS ======================== */
const STATS_PROCESS_DESKTOP = [
  { k: "Hours Saved", v: "12,000+" },
  { k: "Systems Shipped", v: "120+" },
  { k: "Template Library", v: "40+" },
  { k: "Avg ROI (12 mo)", v: "3.7×" },
];

const LOGO = {
  startWidthMobile: 120,
  startWidthDesktop: 520,
  dockWidthMobile: 110,
  dockWidthDesktop: 240,
  dockTopMobile: 10,
  dockTopDesktop: 16,
  startDelayMs: 420,
  moveMs: 760,
};

const MOBILE_LOGO_RESERVED = 92; // px of space under the fixed logo on mobile

/* ==================================================================== */
type ThemeMode = "dark" | "light";

function useIsMobile(bp = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onR = () => setIsMobile(window.innerWidth < bp);
    onR();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, [bp]);
  return isMobile;
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });
  return <motion.div style={{ scaleX }} className="fixed left-0 top-0 z-[80] h-[2px] w-full origin-left bg-white/70" />;
}

function useSectionTheme() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>("[data-theme]"));
    if (!secs.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) {
          const t = (best.target as HTMLElement).dataset.theme as ThemeMode;
          if (t && t !== theme) setTheme(t);
        }
      },
      { threshold: [0.25, 0.5, 0.75, 0.9] }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [theme]);
  return theme;
}

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

function KeyedLogo({
  theme,
  source,
  onReady,
}: {
  theme: ThemeMode;
  source: StaticImageData;
  onReady?: () => void;
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
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2],
          a = data[i + 3];

        if (r >= hardCut && g >= hardCut && b >= hardCut) {
          data[i + 3] = 0;
          continue;
        }
        if (r >= softCut && g >= softCut && b >= softCut) {
          const avg = (r + g + b) / 3;
          const t = Math.min(1, Math.max(0, (hardCut - avg) / (hardCut - softCut)));
          data[i + 3] = Math.round(a * t);
        }
        data[i] = mono;
        data[i + 1] = mono;
        data[i + 2] = mono;
      }

      ctx.putImageData(id, 0, 0);
      setDims({ w, h });
      setDataUrl(canvas.toDataURL("image/png"));
      onReady?.();
    };
    return () => {
      cancelled = true;
    };
  }, [theme, source, onReady]);

  if (!dataUrl || !dims) return null;
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

function MotionLogo({ theme, onDone }: { theme: ThemeMode; onDone?: () => void }) {
  const [logoReady, setLogoReady] = useState(false);
  const [dock, setDock] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    if (!logoReady) return;
    const t = window.setTimeout(() => setDock(true), LOGO.startDelayMs);
    const d = window.setTimeout(() => onDone?.(), LOGO.startDelayMs + LOGO.moveMs);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(d);
    };
  }, [logoReady, onDone]);

  const dockWidth = isMobile ? LOGO.dockWidthMobile : LOGO.dockWidthDesktop;
  const dockTop = isMobile ? LOGO.dockTopMobile : LOGO.dockTopDesktop;
  const startWidth = isMobile ? LOGO.startWidthMobile : LOGO.startWidthDesktop;

  return (
    <motion.div
      aria-label="Brand mark"
      className={`${dock ? "pointer-events-auto" : "pointer-events-none"} fixed z-[70] select-none`}
      initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%", width: startWidth, opacity: 1 }}
      animate={dock ? { top: dockTop, left: 16, x: 0, y: 0, width: dockWidth } : undefined}
      transition={{ duration: LOGO.moveMs / 1000, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      <Link
        href="/"
        aria-label="Go to home"
        prefetch={false}
        onClick={(e) => {
          e.preventDefault();
          window.location.assign("/");
          router.replace("/");
        }}
      >
        <KeyedLogo theme={theme} source={brandPng} onReady={() => setLogoReady(true)} />
      </Link>
    </motion.div>
  );
}

/* ---------------- Shared bits ---------------- */
const sectionReveal: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

function StatsRow({
  items,
  variant,
  mobileCarousel,
  className = "",
}: {
  items: { v: string; k: string }[];
  variant: "dark" | "light";
  mobileCarousel?: boolean;
  className?: string;
}) {
  const base =
    variant === "dark"
      ? "bg-black text-white border-black/15"
      : "bg-white text-black border-white/30 shadow-[0_2px_24px_rgba(255,255,255,0.12)]";

  if (mobileCarousel) {
    return (
      <div className={`no-scrollbar flex gap-4 overflow-x-auto px-2 ${className}`}>
        {items.map((s) => (
          <div key={s.k} className={`min-w-[240px] rounded-2xl border p-5 text-center ${base}`}>
            <div className="text-2xl font-semibold">{s.v}</div>
            <div className={variant === "dark" ? "text-white/70 text-sm" : "text-black/60 text-sm"}>{s.k}</div>
          </div>
        ))}
        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 justify-center ${className}`}>
      {items.map((s) => (
        <div key={s.k} className={`rounded-2xl border p-5 text-center ${base}`}>
          <div className="text-2xl font-semibold">{s.v}</div>
          <div className={variant === "dark" ? "text-white/70 text-sm" : "text-black/60 text-sm"}>{s.k}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Sections ---------------- */
function Hero() {
  return (
    <section
      id="hero"
      data-theme="dark"
      className="snap-start min-h-[100dvh] bg-black text-white flex items-center [scroll-snap-stop:always]"
    >
      <motion.div
        variants={sectionReveal}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.6 }}
        className="mx-auto max-w-6xl px-6 w-full text-center"
      >
        <h1 className="font-bold leading-tight md:text-7xl text-[clamp(1.35rem,7.2vw,3.2rem)]">
          Smarter Systems. <br />
          Stronger Businesses.
        </h1>
        <h2 className="mt-4 text-2xl md:text-3xl">
          We Help You{" "}
          <TypeCycle
            words={["Automate", "Augment with AI", "Elevate", "Educate"]}
            typingMs={110}
            eraseMs={80}
            holdMs={1200}
            className="inline-flex"
            highlightClassName="rounded bg-white px-2 text-black"
          />
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg opacity-85">Automate the grind, and add AI where it actually pays.</p>

        {/* Updated CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://calendar.app.google/VfP3ygN6ZbCdpj9X9"
            className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20 active:scale-[.98]"
          >
            Work With Us
          </a>
          <a
            href="https://forms.gle/1RZmwfzDTaFGpJQ79"
            className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20 active:scale-[.98]"
          >
            Discover Automations
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/** Desktop: combined page */
function AutomationWithPlaybooksDesktop() {
  const items = [
    { Icon: IconWorkflow, title: "Automation Systems", blurb: "Replace manual steps with reliable flows that scale.", pill: "AI inside" },
    { Icon: IconBot, title: "AI Sidekicks", blurb: "Practical copilots for ops, support, and decisions.", pill: "Your data, secure" },
    { Icon: IconCable, title: "Integrations", blurb: "Apps working together—APIs, webhooks, and clean handoffs.", pill: "API-first" },
    { Icon: IconCode, title: "Custom Development", blurb: "When templates aren’t enough, we engineer it.", pill: "Full-stack" },
  ];

  const plays = [
    { name: "Missed-Call SMS Bot", time: "Deploy in a week", result: "Captures 20–40% lost leads" },
    { name: "Invoice → Journal Entry", time: "Deploy in days", result: "Touchless accounting handoffs" },
    { name: "Contract Generator", time: "Deploy in a week", result: "One-click Word→PDF→Sign" },
    { name: "Field Tech Scheduler", time: "Deploy in 2 weeks", result: "Balanced load, fewer no-shows" },
    { name: "Lead Router", time: "Deploy in days", result: "Speed-to-lead done right" },
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, []);

  const scrollByCards = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section
      id="automation-desktop"
      data-theme="light"
      className="hidden md:grid snap-start min-h-[100dvh] grid-rows-[minmax(48dvh,1fr)_minmax(42dvh,1fr)] [scroll-snap-stop:always]"
    >
      {/* Row 1 (white) */}
      <div className="bg-white text-black flex items-center">
        <motion.div
          variants={sectionReveal}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.55 }}
          className="mx-auto max-w-6xl px-6 w-full"
        >
          <p className="mb-1.5 text-xs uppercase tracking-[0.2em] text-black/80">What We Build</p>
          <h2 className="text-3xl font-semibold">Automation with AI at the core</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 auto-rows-[1fr] pb-4">
            {items.map(({ Icon, title, blurb, pill }, i) => (
              <motion.div
                key={title}
                initial={{ y: 12, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="h-full rounded-2xl border border-black/12 p-5 shadow-[0_2px_24px_rgba(0,0,0,0.05)] bg-white"
              >
                <div className="flex items-start gap-4 h-full">
                  <div className="rounded-xl border border-black/15 p-3 text-black shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium">{title}</h3>
                      <span className="rounded-full border border-black/15 px-2 py-0.5 text-xs">{pill}</span>
                    </div>
                    <p className="mt-1 text-black/75 leading-relaxed">{blurb}</p>
                    <div className="mt-auto" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2 (black) */}
      <div className="bg-black text-white flex items-center">
        <motion.div
          variants={sectionReveal}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.55 }}
          className="mx-auto max-w-6xl px-6 w-full"
        >
          <p className="mb-1.5 text-xs uppercase tracking-[0.2em] text-white/70">Templates & Playbooks</p>
          <h2 className="text-3xl font-semibold">Grab a proven starter and go</h2>
          <div className="relative mt-5">
            <button
              aria-label="Previous"
              onClick={() => scrollByCards(-1)}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 hidden md:flex items-center justify-center rounded-full border border-white/20 bg-white/10 w-9 h-9 hover:bg-white/20 transition"
            >
              ‹
            </button>
            <button
              aria-label="Next"
              onClick={() => scrollByCards(1)}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 hidden md:flex items-center justify-center rounded-full border border-white/20 bg-white/10 w-9 h-9 hover:bg-white/20 transition"
            >
              ›
            </button>
            <div ref={trackRef} className="no-scrollbar overflow-x-auto scroll-smooth pt-2 pb-1">
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
                      <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-white/80">{p.time}</span>
                    </div>
                    <p className="mt-2 text-white/85">{p.result}</p>
                    <a href="https://calendar.app.google/VfP3ygN6ZbCdpj9X9" className="mt-4 inline-block text-sm underline decoration-white/40 underline-offset-4">
                      See how it works →
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <style jsx>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </motion.div>
      </div>
    </section>
  );
}

/* Mobile split pages */
function AutomationMobile() {
  const items = [
    { Icon: IconWorkflow, title: "Automation Systems", blurb: "Replace manual steps with reliable flows that scale.", pill: "AI inside" },
    { Icon: IconBot, title: "AI Sidekicks", blurb: "Practical copilots for ops, support, and decisions.", pill: "Your data, secure" },
    { Icon: IconCable, title: "Integrations", blurb: "Apps working together—APIs, webhooks, and clean handoffs.", pill: "API-first" },
    { Icon: IconCode, title: "Custom Development", blurb: "When templates aren’t enough, we engineer it.", pill: "Full-stack" },
  ];

  return (
    <section
      id="automation"
      data-theme="light"
      className="md:hidden snap-start min-h-[100dvh] bg-white text-black flex items-start [scroll-snap-stop:always] pt-[calc(env(safe-area-inset-top)+76px)]"
      style={{ paddingTop: `calc(env(safe-area-inset-top) + ${MOBILE_LOGO_RESERVED}px)` }}
    >
      <motion.div
        variants={sectionReveal}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.55 }}
        className="mx-auto max-w-6xl px-6 w-full"
      >
        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-black/80">What We Build</p>
        <h2 className="text-3xl font-semibold">Automation with AI at the core</h2>
        <div className="mt-3 md:mt-5 grid gap-4 pb-6">
          {items.map(({ Icon, title, blurb, pill }, i) => (
            <motion.div
              key={title}
              initial={{ y: 12, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="rounded-2xl border border-black/12 p-5 shadow-[0_2px_24px_rgba(0,0,0,0.05)] bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl border border-black/15 p-3 text-black">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium">{title}</h3>
                    <span className="rounded-full border border-black/15 px-2 py-0.5 text-xs">{pill}</span>
                  </div>
                  <p className="mt-1 text-black/75">{blurb}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function PlaybooksMobile() {
  const plays = [
    { name: "Missed-Call SMS Bot", time: "Deploy in a week", result: "Captures 20–40% lost leads" },
    { name: "Invoice → Journal Entry", time: "Deploy in days", result: "Touchless accounting handoffs" },
    { name: "Contract Generator", time: "Deploy in a week", result: "One-click Word→PDF→Sign" },
    { name: "Field Tech Scheduler", time: "Deploy in 2 weeks", result: "Balanced load, fewer no-shows" },
    { name: "Lead Router", time: "Deploy in days", result: "Speed-to-lead done right" },
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, []);

  const [isUserInteracting, setIsUserInteracting] = useState(false);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let t: number | null = null;
    const start = () => {
      stop();
      t = window.setInterval(() => {
        if (isUserInteracting) return;
        el.scrollBy({ left: el.clientWidth * 0.9, behavior: "smooth" });
        if (Math.abs(el.scrollLeft + el.clientWidth - el.scrollWidth) < 16) el.scrollTo({ left: 0, behavior: "smooth" });
      }, 3500);
    };
    const stop = () => {
      if (t) window.clearInterval(t);
      t = null;
    };
    start();
    return stop;
  }, [isUserInteracting]);

  return (
    <section id="playbooks" data-theme="dark" className="md:hidden snap-start min-h-[100dvh] bg-black text-white flex items-center [scroll-snap-stop:always] pt-[calc(env(safe-area-inset-top)+24px)]">
      <motion.div variants={sectionReveal} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.55 }} className="mx-auto max-w-6xl px-6 w-full">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/70">Templates & Playbooks</p>
        <h2 className="text-3xl font-semibold">Grab a proven starter and go</h2>
        <div className="mt-6">
          <div
            ref={trackRef}
            className="no-scrollbar overflow-x-auto scroll-smooth pt-2 pb-1"
            onPointerDown={() => setIsUserInteracting(true)}
            onTouchStart={() => setIsUserInteracting(true)}
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
                    <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-white/80">{p.time}</span>
                  </div>
                  <p className="mt-2 text-white/85">{p.result}</p>
                  <a href="https://calendar.app.google/VfP3ygN6ZbCdpj9X9" className="mt-4 inline-block text-sm underline decoration-white/40 underline-offset-4">
                    See how it works →
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ProcessPage() {
  const isMobile = useIsMobile();
  const steps = [
    { k: "Discover", d: "Map goals & bottlenecks." },
    { k: "Design", d: "Blueprint the future workflow." },
    { k: "Deliver", d: "Ship MVP, iterate with data." },
    { k: "Uplift", d: "Measure, train, hand off." },
  ];
  return (
    <section
      id="process"
      data-theme="light"
      className="snap-start min-h-[100dvh] bg-white text-black flex items-center md:py-4 [scroll-snap-stop:always] pt-[calc(env(safe-area-inset-top)+20px)] md:pt-0"
    >
      <div className="mx-auto max-w-6xl px-6 w-full text-center">
        <p className="mb-1.5 text-xs uppercase tracking-[0.2em] text-black/80">Process</p>
        <motion.div
          variants={sectionReveal}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.55 }}
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-center"
        >
          {steps.map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-black/12 p-5 bg-white"
            >
              <div className="text-sm text-black/55">Step {i + 1}</div>
              <div className="mt-1 text-lg font-medium">{s.k}</div>
              <div className="mt-1 text-black/75">{s.d}</div>
            </motion.div>
          ))}
        </motion.div>

        {!isMobile && (
          <div className="mt-10">
            <StatsRow items={STATS_PROCESS_DESKTOP.map(({ v, k }) => ({ v, k }))} variant="dark" />
          </div>
        )}
      </div>
    </section>
  );
}

function ContactPage({
  onInViewChange,
  visibilityAmount = 0.8,
  bottomPadPx = 0,
}: {
  onInViewChange?: (v: boolean) => void;
  visibilityAmount?: number;
  bottomPadPx?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => onInViewChange?.(e.isIntersecting && e.intersectionRatio >= visibilityAmount),
      { threshold: [visibilityAmount] }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [onInViewChange, visibilityAmount]);

  return (
    <section
      ref={ref}
      id="contact"
      data-theme="light"
      className="snap-start min-h-[100dvh] bg-white text-black flex items-center pt-[calc(env(safe-area-inset-top)+16px)] md:pt-4 [scroll-snap-stop:always]"
      style={{ paddingBottom: bottomPadPx ? bottomPadPx + 16 : undefined }}
    >
      <motion.div
        variants={sectionReveal}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.6 }}
        className="mx-auto max-w-6xl px-6 w-full text-center relative z-10"
      >
        <p className="mb-1.5 text-xs uppercase tracking-[0.2em] text-black/70">Contact</p>
        <h2 className="text-3xl font-semibold">Talk to Colin</h2>
        <p className="mt-3 max-w-2xl mx-auto text-black/80">
          Bring us your bottleneck. We’ll map it, automate the grind, and add AI where it actually pays.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a
            href="https://calendar.app.google/VfP3ygN6ZbCdpj9X9"
            className="inline-flex items-center justify-center rounded-full border border-black/15 bg-black px-5 py-2 text-sm font-medium text-white hover:bg-black/90"
          >
            Let’s Automate
          </a>
          <a
            href="https://forms.gle/1RZmwfzDTaFGpJQ79"
            className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-5 py-2 text-sm font-medium text-black hover:bg-black/5"
          >
            Discover Automations
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------- Simple Policy Modal ---------------- */
type PolicyType = "privacy" | "terms" | null;

function PolicyModal({ type, onClose }: { type: PolicyType; onClose: () => void }) {
  if (!type) return null;

  const title = type === "privacy" ? "Privacy Policy" : "Terms & Conditions";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 max-w-2xl w-full rounded-2xl border border-white/15 bg-neutral-900 text-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 bg-white/10 w-9 h-9 grid place-items-center hover:bg-white/20"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {type === "privacy" ? (
          <div className="mt-4 space-y-3 text-sm text-white/90 leading-relaxed">
            <p>
              We only collect the information you choose to share with us (for example when you book a call or submit a form).
            </p>
            <p>
              We use your information only if you allow us to for marketing and to provide the services you request. We do not sell,
              rent, or share your personal information with third parties, except as needed to operate our services (e.g., scheduling,
              payment, or email providers) and only under confidentiality obligations.
            </p>
            <p>
              You can ask us to update or delete your information at any time by contacting us. If this policy changes, we’ll update
              it here.
            </p>
            <p className="text-xs text-white/60">This simple policy is provided for convenience and is not legal advice.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-sm text-white/90 leading-relaxed">
            <p>
              By using this site and our services, you agree to act lawfully and not misuse the site. All content is provided “as is”
              without warranties. To the extent permitted by law, we’re not liable for indirect or consequential losses.
            </p>
            <p>
              If you purchase services, the specific proposal or order may include additional terms. U.S. law governs, and disputes
              will be handled in our home state courts unless otherwise agreed in writing.
            </p>
            <p>
              If any part of these terms is unenforceable, the rest remains in effect. We may update these terms by posting changes
              here.
            </p>
            <p className="text-xs text-white/60">This simple summary is not legal advice.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Icons ---------------- */
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

/* ---------------- Main page ---------------- */
export default function HomeClient() {
  const theme = useSectionTheme();

  const [introRunning, setIntroRunning] = useState(true);
  const [showFooter, setShowFooter] = useState(false);
  const [footerH, setFooterH] = useState(0);
  const footerRef = useRef<HTMLDivElement | null>(null);

  // Policy modal state
  const [policyType, setPolicyType] = useState<PolicyType>(null);

  // Measure footer height so Contact can pad safely under it
  useEffect(() => {
    const measure = () => {
      const h = footerRef.current?.getBoundingClientRect().height ?? 0;
      setFooterH(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (footerRef.current) ro.observe(footerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  // ---- Footer buttons patch (no Footer.tsx edits needed) ----
  useEffect(() => {
    const patchFooter = () => {
      const root = footerRef.current;
      if (!root) return;
      const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>("a"));
      anchors.forEach((a) => {
        const txt = (a.textContent || "").trim().toLowerCase();
        if (txt.includes("get in touch")) {
          a.href = "https://forms.gle/SaVfGjp3foDMeWuBA";
          a.textContent = "Get In Touch";
        } else if (txt.includes("learn to automate") || txt.includes("discover automations")) {
          a.href = "https://forms.gle/1RZmwfzDTaFGpJQ79";
          a.textContent = "Discover Automations";
        }
      });
    };
    patchFooter();
    const mo = new MutationObserver(patchFooter);
    if (footerRef.current) mo.observe(footerRef.current, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, []);

  // Helper: decide if an anchor href is a policy/terms link
  function isPolicyHref(href: string) {
    const h = (href || "").toLowerCase().trim();
    const isPrivacy =
      h.endsWith("#privacy") ||
      h.endsWith("/privacy") ||
      h.includes("/legal/privacy") ||
      h === "privacy" ||
      h.includes("?page=privacy") ||
      h.includes("#privacy") ||
      h.includes("privacy");

    const isTerms =
      h.endsWith("#terms") ||
      h.endsWith("/terms") ||
      h.includes("terms-and-conditions") ||
      h.includes("/legal/terms") ||
      h === "terms" ||
      h.includes("?page=terms") ||
      h.includes("#terms") ||
      h.includes("terms");

    return { isPrivacy, isTerms };
  }

  // Intercept policy/terms clicks BEFORE Next.js handles navigation (capture phase)
  useEffect(() => {
    const intercept = (ev: Event) => {
      const target = ev.target as HTMLElement | null;
      const a = target?.closest("a") as HTMLAnchorElement | null;
      if (!a) return;

      const href = a.getAttribute("href") || "";
      const { isPrivacy, isTerms } = isPolicyHref(href);
      if (!isPrivacy && !isTerms) return;

      ev.preventDefault();
      ev.stopImmediatePropagation?.();
      ev.stopPropagation();

      setPolicyType(isPrivacy ? "privacy" : "terms");
    };

    document.addEventListener("pointerdown", intercept, true);
    document.addEventListener("click", intercept, true);
    document.addEventListener("auxclick", intercept, true);
    const keydownHandler = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Enter" || ke.key === " ") intercept(e);
    };
    document.addEventListener("keydown", keydownHandler, true);

    return () => {
      document.removeEventListener("pointerdown", intercept, true);
      document.removeEventListener("click", intercept, true);
      document.removeEventListener("auxclick", intercept, true);
      document.removeEventListener("keydown", keydownHandler, true);
    };
  }, []);

  // Keep the section list in sync (community removed)
  useMemo<string[]>(() => ["hero", "automation-desktop", "automation", "playbooks", "process", "contact"], []);

  return (
    <>
      <ScrollProgressBar />
      <IntroOverlay show={introRunning} />
      <MotionLogo theme={theme} onDone={() => setIntroRunning(false)} />

      {/* Main content */}
      <main className="h-[100dvh] overflow-y-auto snap-y snap-mandatory scroll-smooth overscroll-y-contain">
        <Hero />
        <AutomationWithPlaybooksDesktop />
        <AutomationMobile />
        <PlaybooksMobile />
        <ProcessPage />
        {/* CommunityPage removed */}
        <ContactPage
          onInViewChange={(vis) => setShowFooter(vis)}
          visibilityAmount={0.55}
          bottomPadPx={Math.ceil(footerH)}
        />
      </main>

      {/* Footer: slides in only on last page */}
      <div
        ref={footerRef}
        className={`fixed inset-x-0 bottom-0 z-[60] transition-transform duration-300 ${
          showFooter ? "translate-y-0" : "translate-y-full"
        } w-full`}
      >
        <Footer />
      </div>

      {/* Policy / Terms modal */}
      <PolicyModal type={policyType} onClose={() => setPolicyType(null)} />
    </>
  );
}