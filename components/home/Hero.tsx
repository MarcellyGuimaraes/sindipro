import Image from "next/image";
import { Instagram } from "lucide-react";

/**
 * Hero — novo visual (referência Lovable "Pixel Perfect Page").
 * Imagem full-bleed em card arredondado (28px), gradiente de leitura,
 * headline Inter bold gigante no canto inferior-esquerdo e CTA em pílula.
 * A navegação flutua por cima via Navbar global (variante "floating" na home).
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[28px]">
      <Image
        src="/img/hero-antena.jpg"
        alt="Vista aérea de Aracaju ao pôr do sol, com áreas de mangue e o casario ao fundo"
        width={2560}
        height={1440}
        priority
        quality={85}
        sizes="100vw"
        className="h-[64vh] min-h-[460px] w-full object-cover object-[74%_50%] sm:h-[88vh] sm:min-h-[640px] sm:object-center"
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* Copy do hero */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-12">
        <h1 className="max-w-4xl font-inter text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl">
          Sergipe
          <br /> Conectado e Desenvolvido
        </h1>

        <div className="mt-8 flex items-end justify-between gap-6">
          <a
            href="https://www.instagram.com/sindiprose/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 font-inter text-sm font-medium text-black shadow-sm transition hover:bg-white/90"
          >
            <span>Siga-nos</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white transition group-hover:translate-x-0.5">
              <Instagram className="h-4 w-4" aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
