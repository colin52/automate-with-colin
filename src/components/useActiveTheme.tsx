"use client";

import { useEffect, useState } from "react";

export function useActiveTheme(sectionIds: string[]) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const t = (e.target as HTMLElement).dataset.theme as
                | "dark"
                | "light"
                | undefined;
              if (t) setTheme(t);
            }
          });
        },
        { threshold: 0.6 }
      );
      io.observe(el);
      observers.push(io);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sectionIds]);

  return theme;
}
