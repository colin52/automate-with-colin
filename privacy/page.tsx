// app/privacy/page.tsx
export const metadata = { title: "Privacy Policy — Automate with Colin" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-4 text-black/80">
          We respect your privacy. This Policy explains what information we collect, how we use it,
          and your choices.
        </p>

        <h2 className="mt-8 text-xl font-medium">Information We Collect</h2>
        <ul className="mt-2 list-disc pl-6 text-black/80">
          <li>Contact details you submit (e.g., name, email).</li>
          <li>Usage data (pages visited, basic analytics).</li>
          <li>Files you voluntarily share for scoping or delivery.</li>
        </ul>

        <h2 className="mt-8 text-xl font-medium">How We Use Information</h2>
        <ul className="mt-2 list-disc pl-6 text-black/80">
          <li>To respond to inquiries and deliver services.</li>
          <li>To improve site experience and offerings.</li>
          <li>To communicate updates, with an unsubscribe option.</li>
        </ul>

        <h2 className="mt-8 text-xl font-medium">Sharing</h2>
        <p className="mt-2 text-black/80">
          We do not sell personal data. We may share with trusted vendors under confidentiality
          to operate our site or deliver services, or as required by law.
        </p>

        <h2 className="mt-8 text-xl font-medium">Data Retention & Security</h2>
        <p className="mt-2 text-black/80">
          We retain data only as long as needed for the purposes above and use reasonable safeguards
          to protect it.
        </p>

        <h2 className="mt-8 text-xl font-medium">Your Rights</h2>
        <p className="mt-2 text-black/80">
          You may request access, correction, or deletion of your data by emailing{" "}
          <a href="mailto:colin@automatewithcolin.com" className="underline">
            colin@automatewithcolin.com
          </a>.
        </p>

        <h2 className="mt-8 text-xl font-medium">Updates</h2>
        <p className="mt-2 text-black/80">
          We may update this Policy periodically. Continued use of the site constitutes acceptance
          of the updated Policy.
        </p>
      </div>
    </main>
  );
}
