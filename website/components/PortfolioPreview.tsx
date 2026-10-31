import Link from "next/link";
import { CaseIndex } from "./CaseIndex";
import { Reveal } from "./Reveal";

export function PortfolioPreview() {
  return (
    <section className="section portfolio-preview" id="portfolio">
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <div>
              <p className="kicker">04 — Portfolio</p>
              <h2>Work, written properly.</h2>
            </div>
            <p>
              Three studies are slotted. They will be written from production work in payments and
              banking. The archive is live. The writing comes next.
            </p>
          </div>
        </Reveal>
        <CaseIndex />
        <Link href="/portfolio" className="text-link">
          Open the archive
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 8h12M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
