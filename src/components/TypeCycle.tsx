"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  words: string[];
  typingMs?: number;
  eraseMs?: number;
  holdMs?: number;
  className?: string;
  highlightClassName?: string;
};

export default function TypeCycle({
  words,
  typingMs = 80,
  eraseMs = 50,
  holdMs = 1000,
  className = "",
  highlightClassName = "",
}: Props) {
  const [index, setIndex] = useState<number>(0);
  const [text, setText] = useState<string>("");
  const [erasing, setErasing] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const word = words[index % words.length];

    function schedule(fn: () => void, ms: number) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(fn, ms);
    }

    if (!erasing) {
      if (text.length < word.length) {
        schedule(() => setText(word.slice(0, text.length + 1)), typingMs);
      } else {
        schedule(() => setErasing(true), holdMs);
      }
    } else {
      if (text.length > 0) {
        schedule(() => setText(word.slice(0, text.length - 1)), eraseMs);
      } else {
        setErasing(false);
        setIndex((i) => (i + 1) % words.length);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, erasing, index, words, typingMs, eraseMs, holdMs]);

  return (
    <span className={className}>
      <span className={highlightClassName}>{text}</span>
      <span className="inline-block w-[1ch] animate-pulse select-none">|</span>
    </span>
  );
}
