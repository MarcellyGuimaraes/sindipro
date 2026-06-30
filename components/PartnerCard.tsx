import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { PartnerPublic } from "@/lib/partners";

/**
 * Card de parceiro — superfície branca discreta sobre o cream, borda azul suave
 * (blue-200) e raio contido, na identidade do site. O logo é exibido sempre
 * colorido. Quando há site do parceiro, o card inteiro vira link externo.
 */
export function PartnerCard({ partner }: { partner: PartnerPublic }) {
  const conteudo = (
    <>
      <div className="flex h-20 items-center justify-center">
        {partner.logoUrl ? (
          <Image
            src={partner.logoUrl}
            alt={partner.name}
            width={220}
            height={80}
            className="h-14 w-auto max-w-full object-contain"
            unoptimized
          />
        ) : (
          <span className="select-none text-center font-inter text-xl font-bold tracking-tight text-black/30">
            {partner.name}
          </span>
        )}
      </div>

      {(partner.logoUrl || partner.linkUrl) && (
        <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-blue-200 pt-4">
          {partner.logoUrl ? (
            <h3 className="font-inter text-sm font-semibold text-navy-900">
              {partner.name}
            </h3>
          ) : (
            partner.linkUrl && (
              <span className="font-inter text-sm font-medium text-black/60 transition group-hover:text-brand">
                Visitar site
              </span>
            )
          )}
          {partner.linkUrl && (
            <ArrowUpRight
              className="h-3.5 w-3.5 text-black/30 transition group-hover:text-brand"
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </>
  );

  const base =
    "group block rounded-[20px] border border-blue-200 bg-white p-7 font-inter";

  if (partner.linkUrl) {
    return (
      <a
        href={partner.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={partner.name}
        className={`${base} transition hover:border-blue-400 focus-visible:outline-brand`}
      >
        {conteudo}
      </a>
    );
  }

  return <div className={base}>{conteudo}</div>;
}
