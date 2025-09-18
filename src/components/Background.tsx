"use client";

import { useEffect, useRef } from "react";

/**
 * Animated gradient + grid + noise.
 * GPU-friendly (pure CSS transforms + opacity).
 */
export default function Background() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Nothing needed; CSS handles animation.
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* soft moving radial gradient */}
      <div className="absolute -inset-[20%] animate-[float_28s_linear_infinite] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(59,130,246,0.35)_0%,rgba(59,130,246,0.15)_30%,transparent_70%)] blur-3xl" />
      <div className="absolute -inset-[25%] animate-[float2_35s_linear_infinite] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(99,102,241,0.25)_0%,rgba(99,102,241,0.1)_35%,transparent_75%)] blur-3xl" />

      {/* subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* soft film grain */}
      <div className="absolute inset-0 opacity-[0.06] mix-blend-soft-light [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><filter id=%22n%22 x=%220%22 y=%220%22 width=%22100%25%22 height=%22100%25%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%2240%22 height=%2240%22 filter=%22url(%23n)%22 /></svg>')]" />
    </div>
  );
}
