// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-sm uppercase tracking-[0.2em] text-white/70">Contact</h3>
            <div className="mt-3 text-lg">
              <a href="mailto:colin@automatewithcolin.com" className="underline decoration-white/30 underline-offset-4">
                colin@automatewithcolin.com
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium hover:bg-white/20 transition"
              >
                Get In Touch
              </a>
              <a
                href="#community"
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium hover:bg-white/20 transition"
              >
                Learn to Automate
              </a>
            </div>
          </div>

          <div className="md:text-right">
            <div className="mt-8 md:mt-0 inline-flex gap-6 text-sm text-white/80">
              <Link href="/terms" className="hover:underline underline-offset-4">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="hover:underline underline-offset-4">
                Privacy Policy
              </Link>
            </div>
            <div className="mt-6 text-xs text-white/40">© {new Date().getFullYear()} Automate with Colin</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
