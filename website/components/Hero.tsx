import Link from "next/link";
import { dossier, metrics } from "@/data/profile";

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <p className="kicker">Data engineer · São Paulo</p>
        <h1>
          <span>Giovanni</span>
          <span>
            Pizzighini
            <i className="caret" aria-hidden="true" />
          </span>
        </h1>
        <div className="hero-copy">
          <p className="hero-tagline">
            Systems that stay true when the questions change.
          </p>
          <p className="hero-lead">
            Cloud pipelines, data governance, and model evaluation. AWS, Azure, and GCP. Open to
            relocation, with the right to work in the EU.
          </p>
          <div className="hero-actions">
            <Link href="/#journey" className="btn btn-acid">
              Career journey
              <Arrow />
            </Link>
            <Link href="/portfolio" className="btn btn-ghost">
              Portfolio
              <Arrow />
            </Link>
          </div>
        </div>

        <aside className="dossier" aria-label="Profile brief">
          <header>
            <span>Dossier</span>
            <span>GP / 01</span>
          </header>
          <dl>
            {dossier.map((row) => (
              <div className="row" key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <footer>
            <span className="live-dot" />
            Open to relocation
          </footer>
        </aside>
      </div>

      <div className="wrap">
        <dl className="metrics">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.value}</dt>
              <dd>
                <strong>{metric.label}</strong>
                <span>{metric.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
