"use client";

import { useEffect, useState } from "react";

type Props = {
  words?: string[];
  typingMs?: number;   // per char
  eraseMs?: number;    // per char
  holdMs?: number;     // pause after type
  className?: string;
  highlightClassName?: string; // style for the word (e.g., white highlight)
};

export default function TypeCycle({
  words = ["Automate", "Educate", "Elevate"],
  typingMs = 70,
  eraseMs = 45,
  holdMs = 800,
  className,
  highlightClassName = "bg-white text-black px-1 rounded",
}: Props) {
  const [idx, setIdx] = useState(0);
  const [out, setOut] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timer: any;
    const word = words[idx % words.length];

    if (typing) {
      if (out.length < word.length) {
        timer = setTimeout(() => setOut(word.slice(0, out.length + 1)), typingMs);
      } else {
        timer = setTimeout(() => setTyping(false), holdMs);
      }
    } else {
      if (out.length > 0) {
        timer = setTimeout(() => setOut(word.slice(0, out.length - 1)), eraseMs);
      } else {
        setIdx((i) => (i + 1) % words.length);
        setTyping(true);
      }
    }

    return () => clearTimeout(timer);
  }, [typing, out, idx, words, typingMs, eraseMs, holdMs]);

  return (
    <span className={className}>
      <span className={highlightClassName}>{out || "\u00A0"}</span>
      <span className="ml-0.5 inline-block h-6 w-[2px] animate-caret bg-white/80 align-[-2px]" />
    </span>
  );
}
