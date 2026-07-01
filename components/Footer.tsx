import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Instagram } from "lucide-react";

/**
 * Footer único, reutilizado em todo o site — novo visual (referência Lovable
 * "Pixel Perfect Page"): card arredondado com imagem de fundo escurecida,
 * bloco de newsletter, colunas de links e redes sociais.
 *
 * Mantidos do requisito original (§6): e-mail, telefone e Instagram
 * @sindiprose (na coluna da marca).
 *
 * TODO: confirmar e-mail/telefone reais com a diretoria.
 * TODO: newsletter sem backend ainda — botão desabilitado ("em breve").
 * TODO: URLs de Facebook/LinkedIn, se existirem.
 */

const contato = {
  email: "contato@sindiprose.com.br",
  telefone: "(79) 9 8857-6962", // TODO: confirmar
  telefoneHref: "+5579988576962", // TODO: confirmar
  instagramHref: "https://www.instagram.com/sindiprose/",
};

// Colunas do mock, mapeadas para as rotas existentes; sem rota = "#" + TODO.
const colunas: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Acesso rápido",
    links: [
      { label: "Início", href: "/" },
      { label: "Sobre nós", href: "/sobre/missao-visao-valores" },
      { label: "Notícias", href: "/noticias" },
      // { label: "Arquivos", href: "/arquivos" },
      { label: "Parceiros", href: "/parceiros" },
      // { label: "Contato", href: `mailto:${contato.email}` },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Diretoria", href: "/sobre/diretoria" },
      { label: "Assessoria de imprensa", href: "/sobre/imprensa" },
      { label: "Arquivos", href: "/arquivos" },
      // { label: "Estatuto", href: "#" }, // TODO: página/PDF do estatuto
      // { label: "Política de Privacidade", href: "#" }, // TODO
    ],
  },
  // {
  //   title: "Para provedores",
  //   links: [
  //     { label: "Associe-se", href: `mailto:${contato.email}` }, // TODO: fluxo real
  //     // { label: "Capacitação", href: "/noticias" }, // TODO: página própria
  //     // { label: "Suporte jurídico", href: `mailto:${contato.email}` }, // TODO
  //   ],
  // },
];

export function Footer() {
  return (
    <div className="px-4 pb-4 md:px-8 md:pb-6">
      <footer
        id="contato"
        className="relative mt-8 overflow-hidden rounded-[28px] scroll-mt-20"
      >
        <Image
          src="/img/footer-antena.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[68%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative px-6 py-10 font-inter text-white md:px-14 md:py-16">
          {/* Topo: Newsletter */}
          {/* <div className="grid gap-10 md:grid-cols-2 md:gap-8">
            <h2 className="font-inter text-6xl font-bold leading-[0.9] tracking-tight text-white md:text-8xl">
              Newsletter
            </h2>
            <div className="md:pt-4">
              <p className="text-sm font-medium text-white/80">
                Inscreva-se na newsletter
              </p>
              // TODO: ligar a um backend de inscrição; por ora desabilitado.
              <form className="mt-4 flex items-center gap-2 rounded-full bg-white p-1.5 pl-5">
                <Mail className="h-4 w-4 text-black/50" aria-hidden="true" />
                <input
                  type="email"
                  placeholder="Seu e-mail aqui"
                  aria-label="Seu e-mail para a newsletter"
                  className="flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/40"
                />
                <button
                  type="submit"
                  disabled
                  aria-label="Inscrever — em breve"
                  title="Em breve"
                  className="grid h-9 w-9 place-items-center rounded-full bg-brand text-white opacity-80"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
          */}
          {/* Divisor <div className="my-12 h-px w-full bg-white/15" /> */}
          

          {/* Colunas */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-10">
            {/* Marca + contatos obrigatórios */}
            <div className="col-span-2 md:col-span-1">
              <Image
                src="/img/sindipro-logo.png"
                alt="Sindipro SE"
                width={955}
                height={309}
                className="h-12 w-auto"
              />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
                Entidade sindical patronal que representa as empresas provedoras
                de internet e comunicação multimídia em Sergipe.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-white/70">
                <li>
                  <a
                    href={`mailto:${contato.email}`}
                    className="inline-flex items-center gap-2 transition hover:text-white focus-visible:outline-bg"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    {contato.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${contato.telefoneHref}`}
                    className="inline-flex items-center gap-2 transition hover:text-white focus-visible:outline-bg"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    {contato.telefone}
                  </a>
                </li>
                <li>
                  <a
                    href={contato.instagramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition hover:text-white focus-visible:outline-bg"
                  >
                    <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
                    @sindiprose
                  </a>
                </li>
              </ul>
            </div>

            {colunas.map((col) => (
              <div key={col.title}>
                <h3 className="font-inter text-sm font-semibold text-white">{col.title}</h3>
                <ul className="mt-5 space-y-3 text-sm text-white/70">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("/") ? (
                        <Link
                          href={l.href}
                          className="transition hover:text-white focus-visible:outline-bg"
                        >
                          {l.label}
                        </Link>
                      ) : (
                        <a
                          href={l.href}
                          className="transition hover:text-white focus-visible:outline-bg"
                        >
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Base */}
          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/15 pt-6 text-xs text-white/60 md:mt-14 md:flex-row md:items-center">
            <p>
              Copyright © {new Date().getFullYear()} Sindipro SE - Todos os
              direitos reservados.
            </p>
            <p>Sindicato dos Provedores de Internet de Sergipe</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
