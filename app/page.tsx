import { Hero } from "@/components/home/Hero";
import { LatestNews } from "@/components/home/LatestNews";
import { About } from "@/components/home/About";
import { Partners } from "@/components/home/Partners";

/**
 * Home — visual Lovable "Pixel Perfect Page":
 * Hero, Últimas notícias, Conheça o SindiproSE e Parceiros.
 * (Localização removida a pedido do cliente.) Footer global no layout.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-cream px-4 pt-4 md:px-8 md:pt-6">
      <Hero />
      <LatestNews />
      <About />
      <Partners />
    </main>
  );
}
