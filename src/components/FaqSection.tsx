import type { Faq } from "@/lib/faq";

export function FaqSection({ items }: { items: Faq[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <section className="wrap wrap--narrow section" id="caste-otazky" aria-labelledby="faq-nadpis" style={{ paddingTop: 0 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <h2 id="faq-nadpis" className="section-title">Časté otázky</h2>
      <div className="faq">
        {items.map((f, i) => (
          <details key={i} className="faq__item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
