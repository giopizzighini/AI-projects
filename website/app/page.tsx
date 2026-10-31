import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Journey } from "@/components/Journey";
import { Marquee } from "@/components/Marquee";
import { PortfolioPreview } from "@/components/PortfolioPreview";
import { Practice } from "@/components/Practice";
import { TwinChat } from "@/components/TwinChat";

export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <Marquee />
      <About />
      <Journey />
      <Practice />
      <PortfolioPreview />
      <TwinChat />
      <Contact />
    </main>
  );
}
