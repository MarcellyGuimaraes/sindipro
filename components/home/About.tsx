import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * "Conheça o SindiproSE" — novo visual (referência Lovable "Pixel Perfect
 * Page"): card dividido, texto à esquerda e foto da sede à direita.
 *
 * Nota: o botão no mock dizia "Learn more" (resquício do template em inglês);
 * mantido o visual, texto em pt-BR.
 */
export function About() {
  return (
    <section id="sobre" className="mx-auto max-w-6xl px-2 pt-10 pb-20 md:pt-14 md:pb-28">
      <div className="grid overflow-hidden rounded-[28px] md:grid-cols-2">
        <div className="bg-cream p-8 font-inter md:p-12">
          <p className="text-sm font-medium text-black/60">Conheça o SindiproSE</p>
          <h2 className="mt-3 font-inter text-4xl font-bold leading-[1.05] tracking-tight text-brand md:text-5xl">
            Sindicato dos Provedores
            <br /> de Internet de
            <br /> Sergipe.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-black/60">
            Somos a entidade sindical patronal legítima que representa, defende
            e impulsiona as empresas provedoras de internet e serviços de
            comunicação multimídia em todo o território sergipano.
          </p>
          {/* <div className="mt-8">
            <Link
              href="/sobre/quem-somos"
              className="group inline-flex items-center gap-3 rounded-full bg-black py-1.5 pl-5 pr-1.5 text-sm font-medium text-white transition hover:bg-black/85"
            >
              Saiba mais
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-black transition group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </div> */}
        </div>
        <div className="relative min-h-[320px]">
          <Image
            src="/img/sobre-aracaju.jpg"
            alt="Vista aérea de Aracaju"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
