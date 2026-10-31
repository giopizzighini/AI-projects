import { marquee } from "@/data/profile";

export function Marquee() {
  const items = [...marquee, ...marquee];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((item, index) => (
          <span key={`${item}-${index}`}>
            {item}
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}
