import Link from "next/link";
import { cases } from "@/data/profile";

export function CaseIndex() {
  return (
    <div className="case-index">
      {cases.map((item) => (
        <Link key={item.slug} href={`/portfolio/${item.slug}`} className="case-row">
          <span className="case-code">{item.code}</span>
          <span className="case-copy">
            <strong>{item.title}</strong>
            <em>{item.lede}</em>
          </span>
          <span className="case-status">In preparation</span>
          <span className="case-arrow" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M3 9h12M10 4l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
        </Link>
      ))}
    </div>
  );
}
