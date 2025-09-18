// app/terms/page.tsx
export const metadata = { title: "Terms & Conditions — Automate with Colin" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Terms &amp; Conditions</h1>
        <p className="mt-4 text-black/80">
          These Terms govern your use of our website, templates, and any services we provide.
          By accessing this site you agree to these Terms.
        </p>

        <h2 className="mt-8 text-xl font-medium">Use of Materials</h2>
        <p className="mt-2 text-black/80">
          Content is provided for informational purposes only. You may not copy, resell, or
          redistribute materials without written permission.
        </p>

        <h2 className="mt-8 text-xl font-medium">No Warranties</h2>
        <p className="mt-2 text-black/80">
          Services and content are provided &quot;as is&quot; without warranties of any kind.
          We do not guarantee outcomes or fitness for a particular purpose.
        </p>

        <h2 className="mt-8 text-xl font-medium">Limitation of Liability</h2>
        <p className="mt-2 text-black/80">
          To the fullest extent permitted by law, we are not liable for any indirect, incidental,
          or consequential damages arising from your use of this site or our services.
        </p>

        <h2 className="mt-8 text-xl font-medium">Changes</h2>
        <p className="mt-2 text-black/80">
          We may update these Terms from time to time. Continued use of the site constitutes
          acceptance of the revised Terms.
        </p>

        <h2 className="mt-8 text-xl font-medium">Contact</h2>
        <p className="mt-2 text-black/80">
          Questions? Email{" "}
          <a href="mailto:colin@automatewithcolin.com" className="underline">
            colin@automatewithcolin.com
          </a>.
        </p>
      </div>
    </main>
  );
}
