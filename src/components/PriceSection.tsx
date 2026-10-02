import type { Service } from "@/db/schema";
import { formatPrice, parseDescription } from "@/lib/format";

function Description({ text }: { text: string }) {
  const blocks = parseDescription(text);
  if (!blocks.length) return null;
  return (
    <div className="price-item__desc">
      {blocks.map((b, i) => b.type === "p"
        ? <p key={i}>{b.text}</p>
        : <ul key={i} className="price-item__points">{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>)}
    </div>
  );
}

function Meta({ s }: { s: Service }) {
  const vs = s.variants.filter((v) => v.price != null || v.minutes != null);
  if (!vs.length) return null;
  if (vs.length === 1) {
    const v = vs[0];
    return (
      <div className="price-item__meta">
        {v.price != null && <span className="price-item__price">{formatPrice(v.price)}&nbsp;Kč</span>}
        {v.minutes != null && <span className="price-item__time">{v.minutes} min</span>}
      </div>
    );
  }
  return (
    <div className="price-item__meta">
      {vs.map((v, i) => (
        <span key={i} className="price-item__variant">
          {v.minutes != null && <span className="price-item__time">{v.minutes} min</span>}{" "}
          {v.price != null && <span className="price-item__price">{formatPrice(v.price)}&nbsp;Kč</span>}
        </span>
      ))}
    </div>
  );
}

export function PriceSection({ id, title, lead, items, children }: { id: string; title: string; lead?: React.ReactNode; items: Service[]; children?: React.ReactNode }) {
  return (
    <section className="panel price-section" id={id} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}>{title}</h2>
      {lead && <div className="price-section__lead">{lead}</div>}
      {items.length ? (
        <ul className="price-list">
          {items.map((s) => (
            <li key={s.id} className="price-item">
              <div><p className="price-item__name">{s.name}</p><Description text={s.description} /></div>
              <Meta s={s} />
            </li>
          ))}
        </ul>
      ) : <p className="price-section__lead">Připravujeme.</p>}
      {children}
    </section>
  );
}
