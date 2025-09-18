"use client";

import { useEffect, useState } from "react";

export default function NavDots({ ids }: { ids: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    ids.forEach((id, idx) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(idx);
          });
        },
        { threshold: 0.6 }
      );
      io.observe(el);
      observers.push(io);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="fixed right-5 top-1/2 z-10 -translate-y-1/2">
      <ul className="flex flex-col gap-3">
        {ids.map((id, i) => (
          <li key={id}>
            <button
              aria-label={`Go to ${id}`}
              onClick={() => scrollTo(id)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                active === i ? "bg-white" : "bg-white/40 hover:bg-white/70"
              }`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
