type Props = {
  id: string;
  eyebrow?: string;
  title: string;
  body?: string;
  cta?: { label: string; href: string }[];
  invert?: boolean; // true = light background, false = dark background
};

export default function Section({
  id,
  eyebrow,
  title,
  body,
  cta = [],
  invert = false,
}: Props) {
  const theme = invert ? "light" : "dark";

  return (
    <section
      id={id}
      data-theme={theme}
      className={`h-screen snap-start grid place-items-center px-6 ${
        invert ? "bg-white text-neutral-900" : "bg-black text-white"
      }`}
    >
      <div className="max-w-3xl text-center">
        {eyebrow && (
          <div className="mb-2 text-xs uppercase tracking-[0.2em] opacity-70">
            {eyebrow}
          </div>
        )}

        <h2 className="text-4xl md:text-6xl font-bold leading-tight">
          {title}
        </h2>

        {body && <p className="mt-4 text-lg opacity-80">{body}</p>}

        {cta?.length ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {cta.map((b, i) => (
              <a
                key={i}
                href={b.href}
                className={`rounded-full border px-5 py-2 text-sm font-medium backdrop-blur active:scale-[.98] transition
                  ${
                    invert
                      ? "border-black/20 bg-black/5 text-black hover:bg-black/10"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
              >
                {b.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
