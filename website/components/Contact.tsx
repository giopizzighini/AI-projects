import { profile } from "@/data/profile";

export function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="wrap">
        <p className="kicker">06 — Contact</p>
        <h2>Tell me about the system.</h2>
        <p className="contact-lead">
          International roles, relocations, and platforms that need someone who can hold the
          pipeline and the governance in the same head.
        </p>
        <div className="contact-links">
          <a className="mail" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 12 12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </a>
        </div>
        <ul className="contact-meta">
          <li>São Paulo, Brazil</li>
          <li>EU citizen</li>
          <li>No visa required for the EU</li>
          <li>Open to relocation</li>
        </ul>
      </div>
    </section>
  );
}
