import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PillLink } from "@/components/Pill";

export const metadata: Metadata = {
  title: "Assessoria de imprensa",
  description:
    "Contato da assessoria de imprensa do Sindicato dos Provedores de Internet e Serviço de Comunicação Multimídia do Estado de Sergipe.",
};

const imprensa = {
  email: "adm.novi.se@gmail.com",
  // WhatsApp: número internacional (55 + DDD + número) para o link wa.me.
  contatos: [
    { nome: "Maurício", whatsapp: "(79) 99151-0291", href: "https://wa.me/5579991510291" },
    { nome: "Karla", whatsapp: "(79) 98106-0143", href: "https://wa.me/5579981060143" },
  ],
};

export default function ImprensaPage() {
  return (
    <main className="min-h-screen bg-cream px-4 md:px-8">
      <div className="mx-auto max-w-6xl px-2 py-16 md:py-24">
        <PageHeader
          eyebrow="Sobre o sindicato"
          title="Assessoria de imprensa"
          lead="Canal para jornalistas e veículos de comunicação que buscam informações, entrevistas e posicionamentos do Sindipro SE sobre o setor de provedores de internet em Sergipe."
        />

        {/* Contato — card dividido brand/branco */}
        <div className="mt-14 grid overflow-hidden rounded-[28px] md:grid-cols-2">
          <div className="bg-brand p-8 font-inter text-white md:p-12">
            <p className="text-sm font-medium text-white/70">Falar com a imprensa</p>
            <h2 className="mt-3 font-inter text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
              Contato
            </h2>
          </div>

          <div className="bg-white p-8 font-inter md:p-12">
            <a
              href={`mailto:${imprensa.email}`}
              className="inline-flex items-center gap-3 text-sm font-medium text-black/70 transition hover:text-brand"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              {imprensa.email}
            </a>

            <div className="mt-8 space-y-6 border-t border-black/10 pt-8">
              {imprensa.contatos.map((c) => (
                <div key={c.nome}>
                  <p className="text-lg font-bold text-black">{c.nome}</p>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-3 text-sm font-medium text-black/70 transition hover:text-brand"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    </span>
                    WhatsApp {c.whatsapp}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Continue conhecendo */}
        <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <PillLink href="/sobre/quem-somos" tone="brand">
            Quem somos
          </PillLink>
          <PillLink href="/sobre/diretoria" tone="white">
            Quadro de diretoria
          </PillLink>
        </div>
      </div>
    </main>
  );
}
