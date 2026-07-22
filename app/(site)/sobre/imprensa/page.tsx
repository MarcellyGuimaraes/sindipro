import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PillLink } from "@/components/Pill";

/** Glifo oficial do WhatsApp (Lucide não tem ícone de marca). Monocromático. */
function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.738-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Assessoria de imprensa",
  description:
    "Contato da assessoria de imprensa do Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.",
};

const imprensa = {
  email: "contato@sindiprose.com.br",
  whatsapp: "(79) 98857-6962",
  whatsappHref: "https://wa.me/5579988576962",
  // WhatsApp: número internacional (55 + DDD + número) para o link wa.me.
  contatos: [
    { nome: "Maurício Meneses", whatsapp: "(79) 99151-0291", href: "https://wa.me/5579991510291" },
    { nome: "Karla Vieira", whatsapp: "(79) 98106-0143", href: "https://wa.me/5579981060143" },
  ],
};

export default function ImprensaPage() {
  return (
    <main className="min-h-screen animate-fade-in bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-6xl px-2 pb-16 md:pb-24">
        <PageHeader
          title="Assessoria de imprensa"
          lead="Canal para jornalistas e veículos de comunicação que buscam informações, entrevistas e posicionamentos do SindiproSE sobre o setor de provedores de internet em Sergipe."
        />

        {/* Contato — card empilhado: faixa brand em cima, informações em branco embaixo */}
        <div className="mt-14 overflow-hidden rounded-[28px]">
          <div className="bg-brand p-8 font-inter text-white md:p-12">
            <h2 className="font-inter text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
              Quer falar com a gente?
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/75 md:text-base">
              Atendemos jornalistas e veículos de comunicação que buscam dados do
              setor de provedores de Sergipe, entrevistas com a diretoria ou o
              posicionamento oficial do sindicato sobre uma pauta. Escreva por
              e-mail ou chame no WhatsApp — retornamos o quanto antes.
            </p>
            <p className="mt-5 text-sm text-white/60">
              Atendimento de segunda a sexta, em horário comercial.
              {/* TODO: confirmar horário de atendimento com a assessoria. */}
            </p>
          </div>

          <div className="bg-white p-8 font-inter md:p-12">
            <div className="grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-black/10">
              {/* E-mail */}
              <div className="md:pr-10">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-black/40">
                Contato SindiproSE
                </p>
                <a
                  href={`mailto:${imprensa.email}`}
                  className="mt-4 inline-flex items-center gap-3 text-sm font-medium text-black/70 transition hover:text-brand"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="break-all">{imprensa.email}</span>
                </a>
                <a
                  href={imprensa.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-3 text-sm font-medium text-black/70 transition hover:text-brand"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                    <WhatsappIcon className="h-4 w-4" />
                  </span>
                  {imprensa.whatsapp}
                </a>
              </div>

              {/* WhatsApp — um por contato */}
              {imprensa.contatos.map((c, i) => (
                <div key={c.nome} className={i === 0 ? "md:px-10" : "md:pl-10"}>
                  <p className="mt-4 text-lg font-bold leading-tight text-black">
                    {c.nome}
                  </p>
                  <p className="text-sm text-black/45">Assessoria de imprensa</p>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-3 text-sm font-medium text-black/70 transition hover:text-brand"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                      <WhatsappIcon className="h-4 w-4" />
                    </span>
                    {c.whatsapp}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Continue conhecendo */}
        <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <PillLink href="/sobre/missao-visao-valores" tone="brand">
            Sobre nós
          </PillLink>
          <PillLink href="/sobre/diretoria" tone="white">
            Quadro de diretoria
          </PillLink>
        </div>
      </div>
    </main>
  );
}
