import Link from "next/link";
import { Newspaper, FolderClosed, Users, ChevronRight } from "lucide-react";
import { PanelHeading } from "@/components/painel/PanelHeading";

/**
 * Início do painel (rota protegida) — visual Lovable, utilitário.
 * Atalhos como LISTA de linhas (não o grid de cards de marketing): cada área
 * de gestão numa linha clicável.
 */

const atalhos = [
  {
    href: "/painel-diretoria/noticias",
    label: "Notícias",
    desc: "Criar, editar e publicar notícias do site.",
    icon: Newspaper,
  },
  {
    href: "/painel-diretoria/arquivos",
    label: "Arquivos",
    desc: "Enviar e gerenciar CCT/ACT para download.",
    icon: FolderClosed,
  },
  {
    href: "/painel-diretoria/diretoria",
    label: "Diretoria",
    desc: "Gerenciar o quadro de diretoria e conselho fiscal.",
    icon: Users,
  },
];

export default function PainelHomePage() {
  return (
    <div className="mx-auto w-full max-w-4xl pt-2">
      <PanelHeading
        title="Início"
        subtitle="Gerencie o conteúdo publicado no site institucional."
      />

      <ul className="mt-8 overflow-hidden rounded-2xl bg-white">
        {atalhos.map(({ href, label, desc, icon: Icon }) => (
          <li key={href} className="border-b border-black/5 last:border-0">
            <Link
              href={href}
              className="group flex items-center gap-4 px-5 py-4 transition hover:bg-black/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-black">{label}</span>
                <span className="block text-sm text-black/60">{desc}</span>
              </span>
              <ChevronRight
                className="h-5 w-5 shrink-0 text-black/30 transition group-hover:translate-x-0.5 group-hover:text-brand"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
