import { faq } from "@/lib/content";

/** Plain, server-rendered Q&A. Static on purpose: it is read by people, search snippets and AI assistants. */
export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-t border-line bg-bg px-4 py-16 md:px-12 md:py-20"
    >
      <h2 id="faq-title" className="display mb-10 text-3xl [--wght:700]">
        Questions
      </h2>
      <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
        {faq.map((item) => (
          <div key={item.q}>
            <h3 className="display mb-3 text-xl [--wght:650]">{item.q}</h3>
            <p className="max-w-prose text-lg leading-snug text-muted">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
