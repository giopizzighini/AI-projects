import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cases, getCase } from "@/data/profile";

type Params = { slug: string };

export function generateStaticParams() {
  return cases.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) return { title: "Case study" };
  return {
    title: item.title,
    description: item.lede,
  };
}

export default async function CasePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) notFound();

  const others = cases.filter((entry) => entry.slug !== item.slug);

  return (
    <main id="main" className="subpage">
      <article className="section case">
        <div className="wrap case-layout">
          <p className="kicker">Case {item.code}</p>
          <h1>{item.title}</h1>
          <p className="case-lede">{item.lede}</p>
          <p className="banner">In preparation. The notes below are the scope, not the finished study.</p>
          <p className="case-summary">{item.summary}</p>
          <h2>What it will cover</h2>
          <ul className="covers">
            {item.covers.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <ul className="tags">
            {item.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <div className="case-nav">
            <Link href="/portfolio">All studies</Link>
            <Link href="/#contact">Contact</Link>
          </div>
        </div>

        <div className="wrap related">
          <p className="kicker">Also slotted</p>
          <div className="related-grid">
            {others.map((entry) => (
              <Link key={entry.slug} href={`/portfolio/${entry.slug}`}>
                <span>{entry.code}</span>
                <strong>{entry.title}</strong>
                <em>In preparation</em>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
