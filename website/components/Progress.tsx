"use client";

import { useEffect, useState } from "react";

export function Progress() {
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScale(height > 0 ? Math.min(1, window.scrollY / height) : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${scale})` }} />
    </div>
  );
}
