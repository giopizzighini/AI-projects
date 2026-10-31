import type { Metadata } from "next";
import Link from "next/link";
import { CaseIndex } from "@/components/CaseIndex";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Forthcoming case studies from Giovanni Pizzighini’s work in payments data, bank platforms, and governance.",
};

export default function PortfolioPage() {
  return (
    <main id="main" className="subpage">
      <section className="section archive">
        <div className="wrap">
          <p className="kicker">Archive</p>
          <h1>Portfolio</h1>
          <p className="archive-lead">
            Case studies are in preparation. Each entry is a live slot for production work in
            payments and banking. New studies will be published on this page.
          </p>
          <CaseIndex />
          <Link href="/#contact" className="text-link">
            Discuss a role
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 8h12M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
