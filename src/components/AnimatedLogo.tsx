"use client";

import { useEffect, useState } from "react";

type Props = {
  color: "white" | "black";
  cornerDesktopPx?: number; // final width at corner (desktop)
  cornerMobilePx?: number;  // final width at corner (mobile)
  startDelayMs?: number;    // delay before moving from center
  transitionMs?: number;    // move/scale duration
  startScale?: number;      // how big while centered
  aspect?: number;          // height = width * aspect (logo’s ratio)
};

export default function AnimatedLogo({
  color,
  cornerDesktopPx = 520,
  cornerMobilePx = 320,
  startDelayMs = 900,
  transitionMs = 900,
  startScale = 3.0,
  aspect = 0.32, // adjust if your logo is taller/shorter
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    setMounted(true);
    // ensure first paint is centered, then animate to corner
    const raf = requestAnimationFrame(() => {
      const t = setTimeout(() => setDocked(true), startDelayMs);
      return () => clearTimeout(t);
    });
    return () => cancelAnimationFrame(raf);
  }, [startDelayMs]);

  if (!mounted) return null;

  const wMobile = cornerMobilePx;
  const hMobile = Math.round(wMobile * aspect);
  const wDesktop = cornerDesktopPx;
  const hDesktop = Math.round(wDesktop * aspect);

  return (
    <div
      className={[
        "fixed z-[60] pointer-events-none",
        docked
          ? // docked: top-right
            "top-[max(1rem,env(safe-area-inset-top))] right-[max(1.1rem,env(safe-area-inset-right))] translate-x-0 translate-y-0"
          : // start: centered
            "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "transition-transform ease-[cubic-bezier(.22,.61,.36,1)]",
      ].join(" ")}
      style={{ transitionDuration: `${transitionMs}ms` }}
    >
      <div
        className="origin-center will-change-transform"
        style={{
          transform: `scale(${docked ? 1 : startScale})`,
          transition: `transform ${transitionMs}ms cubic-bezier(.22,.61,.36,1)`,
        }}
      >
        {/* MASKED LOGO: paints only the glyphs with currentColor */}
        <div
          className={color === "white" ? "text-white" : "text-black"}
          style={{
            backgroundColor: "currentColor",
            WebkitMaskImage: "url('/logo.png')", // <-- must live in /public/logo.png
            maskImage: "url('/logo.png')",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            width: wMobile,
            height: hMobile,
          }}
        />
      </div>

      <style jsx>{`
        @media (min-width: 1024px) {
          div > div > div {
            width: ${wDesktop}px !important;
            height: ${hDesktop}px !important;
          }
        }
      `}</style>
    </div>
  );
}
