"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { Mark } from "./Mark";

const links = [
  { href: "/#about", id: "about", label: "About" },
  { href: "/#journey", id: "journey", label: "Journey" },
  { href: "/#practice", id: "practice", label: "Capabilities" },
  { href: "/portfolio", id: "portfolio", label: "Portfolio" },
  { href: "/#twin", id: "twin", label: "Twin" },
  { href: "/#contact", id: "contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("locked", open);
    return () => document.body.classList.remove("locked");
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActive("");
      return;
    }

    const nodes = ["about", "journey", "practice", "portfolio", "twin", "contact"]
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: [0.05, 0.2, 0.45] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);

  const isCurrent = (id: string) => {
    if (id === "portfolio") return pathname.startsWith("/portfolio");
    return pathname === "/" && active === id;
  };

  const openTwin = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    event.preventDefault();
    setOpen(false);
    window.setTimeout(() => {
      document.getElementById("twin")?.scrollIntoView({ behavior: "smooth" });
      window.dispatchEvent(new Event("twin:open"));
    }, 50);
  };

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <Link href="/" className="brand" onClick={() => setOpen(false)}>
        <Mark />
        <span>Pizzighini</span>
      </Link>

      <nav className="nav-links" aria-label="Primary">
        {links.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            aria-current={isCurrent(link.id) ? "page" : undefined}
            onClick={link.id === "twin" ? openTwin : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Link href="/#twin" className="nav-cta" onClick={openTwin}>
        Ask the twin
      </Link>

      <button
        type="button"
        className="menu-btn"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <i className={open ? "is-open" : ""} />
      </button>

      <div id="mobile-menu" className={`menu${open ? " open" : ""}`} hidden={!open}>
        <nav aria-label="Mobile">
          {links.map((link, index) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={link.id === "twin" ? openTwin : () => setOpen(false)}
            >
              <span>0{index + 1}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
