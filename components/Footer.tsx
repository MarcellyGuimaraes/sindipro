import Link from "next/link";
import { Mail, Phone, MessageCircle, Instagram } from "lucide-react";
import { FeatherMark } from "./Feather";

/**
 * Footer único, reutilizado em todo o site (CLAUDE.md §6).
 * Fundo navy-900. e-mail, telefone, WhatsApp, Instagram (@sindiprose).
 * Pena dourada como acento de canto (marca-d'água discreta).
 *
 * TODO: confirmar e-mail/telefone reais com a diretoria.
 */

const contato = {
  email: "contato@sindiprose.org.br", // TODO: confirmar
  telefone: "(79) 0000-0000", // TODO: confirmar
  telefoneHref: "+5579000000000", // TODO: confirmar
  whatsapp: "(79) 90000-0000", // TODO: confirmar
  whatsappHref: "https://wa.me/5579900000000", // TODO: confirmar
  instagram: "@sindiprose",
  instagramHref: "https://www.instagram.com/sindiprose/",
};

export function Footer() {
  return (
    <footer
      id="contato"
      className="relative overflow-hidden bg-navy-900 text-bg scroll-mt-20"
    >
      <FeatherMark
        className="pointer-events-none absolute -right-6 -top-6 opacity-[0.12]"
        size={220}
        stroke="var(--gold-600)"
      />

      <div className="relative mx-auto w-full max-w-container px-6 py-section-sm sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-h3 font-medium text-bg">Sindipro SE</p>
            <p className="mt-2 text-small text-blue-200">
              Sindicato dos Provedores de Internet e Serviço de Comunicação
              Multimídia do Estado de Sergipe.
            </p>
          </div>

          <nav aria-label="Contato" className="flex flex-col gap-3 text-small">
            <a
              href={`mailto:${contato.email}`}
              className="inline-flex items-center gap-2.5 text-blue-200 transition-colors hover:text-bg focus-visible:outline-bg"
            >
              <Mail className="h-4 w-4 text-blue-400" aria-hidden="true" />
              {contato.email}
            </a>
            <a
              href={`tel:${contato.telefoneHref}`}
              className="inline-flex items-center gap-2.5 text-blue-200 transition-colors hover:text-bg focus-visible:outline-bg"
            >
              <Phone className="h-4 w-4 text-blue-400" aria-hidden="true" />
              {contato.telefone}
            </a>
            <a
              href={contato.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-blue-200 transition-colors hover:text-bg focus-visible:outline-bg"
            >
              <MessageCircle className="h-4 w-4 text-blue-400" aria-hidden="true" />
              WhatsApp {contato.whatsapp}
            </a>
            <a
              href={contato.instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-blue-200 transition-colors hover:text-bg focus-visible:outline-bg"
            >
              <Instagram className="h-4 w-4 text-blue-400" aria-hidden="true" />
              {contato.instagram}
            </a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-blue-400/30 pt-6 text-small text-blue-200 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sindipro SE. Todos os direitos reservados.</p>
          <Link href="/" className="transition-colors hover:text-bg focus-visible:outline-bg">
            sindiprose.org.br
          </Link>
        </div>
      </div>
    </footer>
  );
}
