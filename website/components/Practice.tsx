import { capabilities } from "@/data/profile";
import { Reveal } from "./Reveal";

export function Practice() {
  return (
    <section className="section" id="practice">
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <div>
              <p className="kicker">03 — Capabilities</p>
              <h2>The stack I trust with production.</h2>
            </div>
            <p>
              Tools only matter if the platform stays fast, governed, and cheap enough to keep.
              This is the set I use to get there.
            </p>
          </div>
        </Reveal>

        <div className="bento">
          {capabilities.map((item, index) => (
            <Reveal key={item.index} delay={index * 70} className="bento-reveal">
              <article>
                <span>{item.index}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ul>
                  {item.tools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
