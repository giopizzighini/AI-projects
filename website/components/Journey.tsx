"use client";

import { useMemo, useState } from "react";
import { education, roles, type Role } from "@/data/profile";

const filters = [
  { id: "all", label: "All" },
  { id: "engineering", label: "Engineering" },
  { id: "foundation", label: "Earlier career" },
] as const;

type FilterId = (typeof filters)[number]["id"];

const chapters = [
  { id: "now", kicker: "Current", title: "Now" },
  { id: "itau", kicker: "São Paulo · 2022 — 2026", title: "Banco Itaú" },
  { id: "earlier", kicker: "Before data", title: "Earlier career" },
] as const;

export function Journey() {
  const [filter, setFilter] = useState<FilterId>("all");

  const visible = useMemo(
    () => roles.filter((role) => filter === "all" || role.era === filter),
    [filter],
  );

  return (
    <section className="section paper" id="journey">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="kicker">02 — Journey</p>
            <h2>A path into the systems.</h2>
          </div>
          <p>
            From international business into cloud data. The engineering years carry the weight.
            The earlier chapter is why the business context sticks.
          </p>
        </div>

        <div className="filters" role="tablist" aria-label="Filter career">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={filter === item.id ? "is-on" : ""}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              <span>
                {item.id === "all"
                  ? roles.length
                  : roles.filter((role) => role.era === item.id).length}
              </span>
            </button>
          ))}
        </div>

        <div className="chapters">
          {chapters.map((chapter) => {
            const items = visible.filter((role) => role.chapter === chapter.id);
            if (!items.length) return null;
            return (
              <div className="chapter" key={chapter.id}>
                <header>
                  <p className="kicker">{chapter.kicker}</p>
                  <h3>{chapter.title}</h3>
                </header>
                <ol>
                  {items.map((role) => (
                    <RoleRow key={role.id} role={role} />
                  ))}
                </ol>
              </div>
            );
          })}
        </div>

        <div className="formation">
          <div>
            <p className="kicker">Formation</p>
            <h3>Education</h3>
          </div>
          <ul>
            {education.map((item) => (
              <li key={item.school}>
                <div>
                  <strong>{item.school}</strong>
                  <span>{item.program}</span>
                  <em>{item.original}</em>
                </div>
                <time>{item.years}</time>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function RoleRow({ role }: { role: Role }) {
  return (
    <li className={`role${role.current ? " is-current" : ""}`}>
      <div className="role-when">
        <span>{role.start}</span>
        <span>{role.end}</span>
      </div>
      <div className="role-body">
        <div className="role-top">
          <div>
            <h4>{role.company}</h4>
            <p>{role.role}</p>
          </div>
          <div className="role-meta">
            {role.current ? <span className="badge">Current</span> : null}
            <span>{role.location}</span>
          </div>
        </div>
        <p className="role-summary">{role.summary}</p>
        {role.impacts ? (
          <ul className="impacts">
            {role.impacts.map((impact) => (
              <li key={impact}>{impact}</li>
            ))}
          </ul>
        ) : null}
        {role.tags ? (
          <ul className="tags">
            {role.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}
