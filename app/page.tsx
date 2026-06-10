import { Hero } from "@/components/home/Hero";
import { LatestNews } from "@/components/home/LatestNews";
import { About } from "@/components/home/About";
import { Partners } from "@/components/home/Partners";
import { Location } from "@/components/home/Location";

/**
 * Home (CLAUDE.md §9). Em construção — Hero + Últimas notícias + Sobre +
 * Parceiros + Localização. Falta o Footer, próximo passo.
 */
export default function Home() {
  return (
    <main>
      <Hero />
      <LatestNews />
      <About />
      <Partners />
      <Location />
    </main>
  );
}
