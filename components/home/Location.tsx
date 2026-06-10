import { MapPin, Route, Map as MapIcon } from "lucide-react";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/SectionHeading";

/**
 * Seção "Localização" da Home (CLAUDE.md §9): endereço, mapa (embed) e
 * como chegar.
 *
 * TODO: endereço real da sede. Enquanto não houver, NÃO embutimos um mapa
 * apontando para o lugar errado — o mapa fica como slot com o iframe pronto
 * para colar (ver comentário abaixo).
 */

export function Location() {
  return (
    <Section tone="tint" id="localizacao">
      <SectionHeading eyebrow="Localização" title="Onde nos encontrar" />

      <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Endereço + como chegar */}
        <div className="lg:col-span-5">
          <div className="flex gap-3">
            <MapPin
              className="mt-0.5 h-5 w-5 shrink-0 text-navy-700"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-display text-h3 font-medium text-navy-900">
                Sede do Sindipro SE
              </h3>
              {/* TODO: endereço real — logradouro, número, bairro, cidade/UF, CEP. */}
              <address className="mt-1 not-italic text-body text-navy-900/85">
                Rua [TODO], nº [TODO]
                <br />
                Bairro [TODO]
                <br />
                Aracaju — SE, CEP [TODO]
              </address>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Route
              className="mt-0.5 h-5 w-5 shrink-0 text-navy-700"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-display text-h3 font-medium text-navy-900">
                Como chegar
              </h3>
              {/* TODO: pontos de referência e orientações reais. */}
              <p className="mt-1 max-w-sm text-small text-navy-900/80">
                Pontos de referência e orientações de acesso a confirmar com a
                diretoria. (TODO)
              </p>
            </div>
          </div>
        </div>

        {/* Mapa (embed) */}
        <div className="lg:col-span-7">
          {/*
            TODO: substituir o slot abaixo pelo embed real do Google Maps.
            Quando houver o endereço, cole o iframe — algo como:

            <iframe
              title="Localização do Sindipro SE"
              src="https://www.google.com/maps/embed?pb=..."
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          */}
          <div className="flex aspect-[16/10] w-full items-center justify-center rounded-card border border-blue-200 bg-surface">
            <div className="flex flex-col items-center gap-2 text-center">
              <MapIcon className="h-7 w-7 text-blue-350" aria-hidden="true" />
              <p className="text-small text-navy-900/80">
                Mapa — inserir embed do Google Maps
                <br />
                após confirmar o endereço (TODO)
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
