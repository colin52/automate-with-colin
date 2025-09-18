"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";

import TypeCycle from "@/components/TypeCycle";
import Footer from "@/components/Footer";
import brandPng from "./logo.png";

/* ---------------------- TWEAKABLE OFFSETS ---------------------- */
/** Process spacing (desktop) */
const PROCESS_STEPS_OFFSET_DESKTOP = 0;
/** Adds space above Process cards on mobile */
const PROCESS_STEPS_OFFSET_MOBILE = 0;
/* --------------------------------------------------------------- */

type ThemeMode = "dark" | "light";

/* ---------------------- Utils ---------------------- */
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

/* ---------------------- Progress bar ---------------------- */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[80] h-[2px] w-full origin-left bg-white/70"
    />
  );
}

/* ---------------------- Intro overlay & docking logo ---------------------- */
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
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (r >= hardCut && g >= hardCut && b >= hardCut) { data[i + 3] = 0; continue; }
        if (r >= softCut && g >= softCut && b >= softCut) {
          const avg = (r + g + b) / 3;
          const t = Math.min(1, Math.max(0, (hardCut - avg) / (hardCut - softCut)));
          data[i + 3] = Math.round(a * t);
        }
        data[i] = mono; data[i + 1] = mono; data[i + 2] = mono;
      }
      ctx.putImageData(id, 0, 0);
      setDims({ w, h });
      setDataUrl(canvas.toDataURL("image/png"));
      onReady?.();
    };
    return () => { cancelled = true; };
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

function MotionLogo({
  theme,
  startDelayMs = 600,
  moveMs = 850,
  startWidthMobile = 300,   // smaller on phones
  startWidthDesktop = 600,
  dockWidthMobile = 120,
  dockWidthDesktop = 240,
  dockTopMobile = 12,
  dockTopDesktop = 16,
  onDone,
}: {
  theme: ThemeMode;
  startDelayMs?: number;
  moveMs?: number;
  startWidthMobile?: number;
  startWidthDesktop?: number;
  dockWidthMobile?: number;
  dockWidthDesktop?: number;
  dockTopMobile?: number;
  dockTopDesktop?: number;
  onDone?: () => void;
}) {
  const [logoReady, setLogoReady] = useState(false);
  const [dock, setDock] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!logoReady) return;
    const t = window.setTimeout(() => setDock(true), startDelayMs);
    const d = window.setTimeout(() => onDone?.(), startDelayMs + moveMs);
    return () => { window.clearTimeout(t); window.clearTimeout(d); };
  }, [logoReady, startDelayMs, moveMs, onDone]);

  const dockWidth = isMobile ? dockWidthMobile : dockWidthDesktop;
  const dockTop = isMobile ? dockTopMobile : dockTopDesktop;
  const startWidth = isMobile ? startWidthMobile : startWidthDesktop;

  return (
    <motion.div
      aria-label="Brand mark"
      className={`${dock ? "pointer-events-auto" : "pointer-events-none"} fixed z-[70] select-none`}
      initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%", width: startWidth, opacity: 1 }}
      animate={dock ? { top: dockTop, left: 16, x: 0, y: 0, width: dockWidth } : undefined}
      transition={{ duration: moveMs / 1000, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      <Link href="/" aria-label="Go to home">
        <KeyedLogo theme={theme} source={brandPng} onReady={() => setLogoReady(true)} />
      </Link>
    </motion.div>
  );
}

/* ---------------------- Theme from visible section ---------------------- */
function useSectionTheme() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>("[data-theme]"));
    if (!secs.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries.filter(e => e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
        if (best) {
          const t = (best.target as HTMLElement).dataset.theme as ThemeMode;
          if (t && t !== theme) setTheme(t);
        }
      },
      { threshold: [0.25, 0.5, 0.75, 0.9] }
    );
    secs.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, [theme]);
  return theme;
}

/* ---------------------- Icons ---------------------- */
function IconWorkflow(p: React.SVGProps<SVGSVGElement>) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path d="M4 4h6v6H4zM14 14h6v6h-6z" strokeWidth="1.5"/><path d="M10 7h4a3 3 0 013 3v1M14 17h-4a3 3 0 01-3-3v-1" strokeWidth="1.5"/></svg>);
}
function IconBot(p: React.SVGProps<SVGSVGElement>) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><rect x="4" y="7" width="16" height="10" rx="2" strokeWidth="1.5"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M12 4v3M8 19v1a2 2 0 002 2h4a2 2 0 002-2v-1" strokeWidth="1.5"/></svg>);
}
function IconCable(p: React.SVGProps<SVGSVGElement>) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path d="M4 12h6M14 12h6" strokeWidth="1.5"/><rect x="2" y="10" width="4" height="4" rx="1"/><rect x="18" y="10" width="4" height="4" rx="1"/><path d="M10 12c0-4 4-4 4 0" strokeWidth="1.5"/></svg>);
}
function IconCode(p: React.SVGProps<SVGSVGElement>) {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path d="M8 16l-4-4 4-4M16 8l4 4-4 4" strokeWidth="1.5"/></svg>);
}

/* ---------------------- Shared bits ---------------------- */
const sectionReveal: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

type StatVariant = "dark" | "light";
const STATS = [
  { k: "Hours Saved", v: "12,000+" },
  { k: "Systems Shipped", v: "120+" },
  { k: "Template Library", v: "40+" },
  { k: "Avg ROI (12 mo)", v: "3.7×" },
];

function StatsRow({
  variant,
  mobileCarousel,
  className = "",
}: {
  variant: StatVariant;
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
        {STATS.map((s) => (
          <div key={s.k} className={`min-w-[240px] rounded-2xl border p-5 text-center ${base}`}>
            <div className="text-2xl font-semibold">{s.v}</div>
            <div className={variant === "dark" ? "text-white/70 text-sm" : "text-black/60 text-sm"}>{s.k}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 justify-center ${className}`}>
      {STATS.map((s) => (
        <div key={s.k} className={`rounded-2xl border p-5 text-center ${base}`}>
          <div className="text-2xl font-semibold">{s.v}</div>
          <div className={variant === "dark" ? "text-white/70 text-sm" : "text-black/60 text-sm"}>{s.k}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------- Sections ---------------------- */
function Hero() {
  return (
    <section id="hero" data-theme="dark" className="snap-start min-h-screen bg-black text-white flex items-center">
      <motion.div
        variants={sectionReveal}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.6 }}
        className="mx-auto max-w-6xl px-6 w-full text-center"
      >
        <h1 className="font-bold leading-tight text-[clamp(1.85rem,7vw,3.5rem)] md:text-6xl">
          Smarter Systems. Stronger Businesses.
        </h1>
        <h2 className="mt-4 text-2xl md:text-3xl">
          We Help You
          <br className="md:hidden" />
          <span className="hidden md:inline">&nbsp;</span>
          <TypeCycle
            words={["Automate", "Augment with AI", "Elevate", "Educate"]}
            typingMs={110}
            eraseMs={80}
            holdMs={1200}
            className="inline-flex"
            highlightClassName="rounded bg-white px-2 text-black"
          />
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg opacity-85">
          Automate the grind, and add AI where it actually pays.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a href="#automation" className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white hover:bg-white/20">
            Work With Us
          </a>
          <a href="#contact" className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white hover:bg-white/20">
            Talk to Colin
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/** Page 2: Automation (white) — full page on mobile, safe top padding for the logo */
function AutomationPage() {
  const items = [
    { icon: IconWorkflow, title: "Automation Systems", blurb: "Replace manual steps with reliable flows that scale.", pill: "AI inside" },
    { icon: IconBot, title: "AI Sidekicks", blurb: "Practical copilots for ops, support, and decisions.", pill: "Your data, securely" },
    { icon: IconCable, title: "Integrations", blurb: "Apps working together—APIs, webhooks, and clean handoffs.", pill: "API-first" },
    { icon: IconCode, title: "Custom Development", blurb: "When templates aren’t enough, we engineer it.", pill: "Full-stack" },
  ];
  return (
    <section
      id="automation"
      data-theme="light"
      className="snap-start min-h-screen bg-white text-black flex items-center pt-24 md:pt-0" /* pt-24 clears docked logo on phones */
    >
      <motion.div
        variants={sectionReveal}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.55 }}
        className="mx-auto max-w-6xl px-6 w-full"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-black/80">What We Build</p>
        <h2 className="text-3xl font-semibold">Automation with AI at the core</h2>

        <div className="mt-6 grid gap-5 md:gap-6 sm:grid-cols-2">
          {items.map(({ icon: Icon, title, blurb, pill }, i) => (
            <motion.div
              key={title}
              initial={{ y: 12, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="rounded-2xl border border-black/12 p-5 md:p-6 shadow-[0_2px_24px_rgba(0,0,0,0.05)] bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-xl border border-black/15 p-3 text-black"><Icon className="h-6 w-6" /></div>
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

        {/* Bottom breathing room so no card touches the fold on phones */}
        <div className="h-8 md:h-2" />
      </motion.div>
    </section>
  );
}

/** Page 3: Playbooks (black) — its own page */
function PlaybooksPage() {
  const plays = [
    { name: "Missed-Call SMS Bot", time: "Deploy in a week", result: "Captures 20–40% lost leads" },
    { name: "Invoice → Journal Entry", time: "Deploy in days", result: "Touchless accounting handoffs" },
    { name: "Contract Generator", time: "Deploy in a week", result: "One-click Word→PDF→Sign" },
    { name: "Field Tech Scheduler", time: "Deploy in 2 weeks", result: "Balanced load, fewer no-shows" },
    { name: "Lead Router", time: "Deploy in days", result: "Speed-to-lead done right" },
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const scrollByCards = (dir: 1 | -1) => {
    const el = trackRef.current; if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    let t: number | null = null;
    const start = () => { stop(); t = window.setInterval(() => {
      if (isUserInteracting) return;
      el.scrollBy({ left: el.clientWidth * 0.9, behavior: "smooth" });
      if (Math.abs(el.scrollLeft + el.clientWidth - el.scrollWidth) < 16) el.scrollTo({ left: 0, behavior: "smooth" });
    }, 3500); };
    const stop = () => { if (t) window.clearInterval(t); t = null; };
    start(); return stop;
  }, [isUserInteracting]);

  return (
    <section id="playbooks" data-theme="dark" className="snap-start min-h-screen bg-black text-white flex items-center pt-24 md:pt-0">
      <motion.div
        variants={sectionReveal}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.55 }}
        className="mx-auto max-w-6xl px-6 w-full"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/70">Templates & Playbooks</p>
        <h2 className="text-3xl font-semibold">Grab a proven starter and go</h2>

        <div className="relative mt-6">
          <button aria-label="Previous" onClick={() => scrollByCards(-1)}
            className="hidden md:flex absolute left-0 top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 w-9 h-9 hover:bg-white/20 transition">‹</button>
          <button aria-label="Next" onClick={() => scrollByCards(1)}
            className="hidden md:flex absolute right-0 top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 w-9 h-9 hover:bg-white/20 transition">›</button>

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
                  <a href="#contact" className="mt-4 inline-block text-sm underline decoration-white/40 underline-offset-4">
                    See how it works →
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </motion.div>
    </section>
  );
}

/** Page 4: Process (white) — NO stat bubbles now */
function ProcessPage() {
  const isMobile = useIsMobile();
  const stepsOffset = isMobile ? PROCESS_STEPS_OFFSET_MOBILE : PROCESS_STEPS_OFFSET_DESKTOP;

  const steps = [
    { k: "Discover", d: "Map goals & bottlenecks." },
    { k: "Design", d: "Blueprint the future workflow." },
    { k: "Deliver", d: "Ship MVP, iterate with data." },
    { k: "Uplift", d: "Measure, train, hand off." },
  ];

  return (
    <section id="process" data-theme="light" className="snap-start min-h-screen bg-white text-black flex items-center pt-24 md:pt-0">
      <div className="mx-auto max-w-6xl px-6 w-full text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-black/80">Process</p>

        <motion.div
          variants={sectionReveal}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.5 }}
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-center"
          style={{ marginTop: stepsOffset }}
        >
          {steps.map((s, i) => (
            <motion.div key={s.k} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-black/12 p-5 bg-white">
              <div className="text-sm text-black/55">Step {i + 1}</div>
              <div className="mt-1 text-lg font-medium">{s.k}</div>
              <div className="mt-1 text-black/75">{s.d}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/** Page 5: Community (black) — stat bubbles moved here, white variant */
function CommunityPage() {
  const isMobile = useIsMobile();
  return (
    <section id="community" data-theme="dark" className="snap-start min-h-screen bg-black text-white flex items-center pt-24 md:pt-0">
      <motion.div
        variants={sectionReveal}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.6 }}
        className="mx-auto max-w-6xl px-6 w-full text-center"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/70">Community</p>
        <h2 className="text-3xl font-semibold">Build with us, not alone</h2>
        <p className="mt-3 max-w-2xl mx-auto text-white/85">
          Workshops, templates, office hours, and a community of builders swapping real-world playbooks.
          Learn what actually works, ship faster, and get unstuck with feedback.
        </p>
        <div className="mt-6">
          <a href="https://skool.link/your-group" className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium hover:bg-white/20 transition">
            Join the Community
          </a>
        </div>

        {/* White stat bubbles under Community */}
        <div className="mt-10">
          <StatsRow variant="light" mobileCarousel={isMobile} />
        </div>
      </motion.div>
    </section>
  );
}

/** Page 6: Contact — locks on snap, footer won’t cover CTA */
function ContactPage({
  onInViewChange,
  visibilityAmount = 0.6,
}: {
  onInViewChange?: (visible: boolean) => void;
  visibilityAmount?: number;
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
      className="snap-start min-h-screen bg-white text-black flex items-center pb-[calc(env(safe-area-inset-bottom)+7rem)] md:pb-28 [scroll-snap-stop:always] pt-24 md:pt-0"
    >
      <motion.div
        variants={sectionReveal}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.6 }}
        className="mx-auto max-w-6xl px-6 w-full text-center"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-black/70">Contact</p>
        <h2 className="text-3xl font-semibold">Talk to Colin</h2>
        <p className="mt-3 max-w-2xl mx-auto text-black/80">
          Bring us your bottleneck. We’ll map it, automate the grind, and add AI where it actually pays.
        </p>
        <div className="mt-6">
          <a
            href="https://calendly.com/your-link"
            className="inline-flex items-center justify-center rounded-full border border-black/15 bg-black px-5 py-2 text-sm font-medium text-white hover:bg-black/90"
          >
            Let’s Automate
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------------- Page ---------------------- */
export default function HomeClient() {
  const theme = useSectionTheme();
  const isMobile = useIsMobile();
  const [introRunning, setIntroRunning] = useState(true);
  const [showFooter, setShowFooter] = useState(false);

  useMemo<string[]>(() => ["hero", "automation", "playbooks", "process", "community", "contact"], []);

  return (
    <>
      <ScrollProgressBar />

      {/* Intro overlay + animated docking logo */}
      <IntroOverlay show={introRunning} />
      <MotionLogo
        theme={theme}
        startDelayMs={600}
        moveMs={850}
        startWidthMobile={300}
        startWidthDesktop={600}
        dockWidthMobile={120}
        dockWidthDesktop={240}
        dockTopMobile={12}
        dockTopDesktop={16}
        onDone={() => setIntroRunning(false)}
      />

      <main className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
        <Hero />
        <AutomationPage />
        <PlaybooksPage />
        <ProcessPage />
        <CommunityPage />
        <ContactPage
          onInViewChange={(vis) => setShowFooter(vis)}
          visibilityAmount={isMobile ? 0.95 : 0.55}
        />
      </main>

      {/* Footer shows on last page; hides when scrolling up */}
      <div className={`fixed inset-x-0 bottom-0 z-[60] transition-transform duration-300 ${showFooter ? "translate-y-0" : "translate-y-full"}`}>
        <Footer />
      </div>
    </>
  );
}
