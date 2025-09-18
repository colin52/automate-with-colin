"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/components/logo.png";

const DURATION_MS = 1600; // total animation time

export default function IntroOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black">
      <div className="intro-zoom will-change-transform">
        <Image
          src={logo}
          alt="Automate with Colin"
          priority
          className="h-16 w-auto filter invert"
        />
      </div>
    </div>
  );
}
