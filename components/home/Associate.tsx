import { Mail } from "lucide-react";

/**
 * "Associe-se" — convite para associação. Layout em seção escura (navy-900):
 * cartões de contato (e-mail em destaque azul `brand`, WhatsApp em cartão escuro
 * sutil). Documentação e requisitos são tratados no atendimento — sem checklist
 * público no site.
 */

const contato = {
  email: "contato@sindiprose.com.br",
  whatsapp: "(79) 98857-6962",
  whatsappHref: "https://wa.me/5579988576962",
};

/** Ícone de marca do WhatsApp (Lucide não fornece um). Herda a cor via currentColor. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.748-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export function Associate() {
  return (
    <section id="associe-se" className="mx-auto max-w-6xl px-2 pb-20 md:pb-28">
      <div className="rounded-[28px] bg-navy-900 p-6 font-inter sm:p-8 md:p-14">
        <p className="text-sm font-medium text-white/60">Associe-se</p>
        <h2 className="mt-3 max-w-2xl font-inter text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
          Faça parte do SindiproSE
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
          Entre em contato com nossa equipe para saber como se associar. Documentação
          e requisitos são orientados no atendimento.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
          {/* E-mail — cartão de destaque */}
          <a
            href={`mailto:${contato.email}`}
            className="group block rounded-[20px] bg-brand p-5 transition hover:bg-brand/90 focus-visible:outline-bg sm:p-6"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-inter text-base font-semibold text-white">
              E-mail institucional
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-white/75">
              Escreva para o endereço oficial e nossa equipe orientará o processo
              de filiação e a documentação necessária.
            </p>
            <span className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-brand">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="break-all">{contato.email}</span>
            </span>
          </a>

          {/* WhatsApp — cartão escuro sutil */}
          <a
            href={contato.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-[20px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10 focus-visible:outline-bg sm:p-6"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white">
              <WhatsAppIcon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-inter text-base font-semibold text-white">
              Suporte via WhatsApp
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-white/70">
              Dúvidas sobre associação, documentos ou prazos? Fale diretamente com
              nossa equipe de atendimento.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
              <WhatsAppIcon className="h-4 w-4" />
              {contato.whatsapp}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
