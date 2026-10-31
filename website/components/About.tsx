import { certifications, languages } from "@/data/profile";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section className="section about" id="about">
      <div className="wrap">
        <Reveal>
          <header className="about-head">
            <p className="kicker">01 — About</p>
            <h2>International by background. Precise by practice.</h2>
          </header>
        </Reveal>

        <Reveal delay={60}>
          <p className="pull about-pull">
            The job is not more dashboards. The job is a system that stays true when the business
            changes its mind.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="prose about-prose">
            <p>
              I came up through international relations, tax, pharma, and banking operations,
              including two years in Edinburgh on Morgan Stanley’s UK operation. The interesting
              part was never the slide. It was the system underneath the decision.
            </p>
            <p>
              In 2022 I joined Itaú in insurance analytics and moved into data engineering within
              six months. The years after that were cloud modernization: cost platforms, analytics
              products, release pipelines, and governance that could survive an audit.
            </p>
            <p>
              Today I work on event-driven data for global payments at Ria, and in parallel I
              review frontier models for technical accuracy. Same instinct in both rooms. Find the
              gap, name it, and leave a system someone else can trust.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <ul className="facts">
            <li>
              <span>Languages</span>
              <strong>Four</strong>
              <em>English and Portuguese native</em>
            </li>
            <li>
              <span>Formation</span>
              <strong>FATEC + UNESP</strong>
              <em>Systems and international relations</em>
            </li>
            <li>
              <span>Industries</span>
              <strong>Finance, pharma, payments</strong>
              <em>Plus public-sector early career</em>
            </li>
            <li>
              <span>Relocation</span>
              <strong>EU citizen</strong>
              <em>No visa required for the EU</em>
            </li>
          </ul>
        </Reveal>

        <div className="about-split">
          <Reveal>
            <h3>Languages</h3>
            <ul className="lang-list">
              {languages.map((language) => (
                <li key={language.name}>
                  <strong>{language.name}</strong>
                  <span>{language.level}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80}>
            <h3>Certifications</h3>
            <ul className="cert-list">
              {certifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
