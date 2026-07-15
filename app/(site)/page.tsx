import { Hero } from "@/components/home/Hero";
import { LatestNews } from "@/components/home/LatestNews";
import { About } from "@/components/home/About";
import { Associate } from "@/components/home/Associate";

/**
 * Home — visual Lovable "Pixel Perfect Page":
 * Hero, Conheça o SindiproSE e Últimas notícias.
 * (Localização e carrossel de parceiros removidos a pedido do cliente; os
 * parceiros têm página própria em /parceiros.) Footer global no layout.
 */
export default function Home() {
  return (
    <main className="min-h-screen animate-fade-in bg-cream px-4 pt-4 md:px-8 md:pt-6">
      <Hero />
      <LatestNews />
      <About />
      <Associate />
    </main>
  );
}
