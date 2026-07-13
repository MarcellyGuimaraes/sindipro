import Image from "next/image";

/**
 * Card de diretor — visual Lovable: card rounded-[28px] com gradiente de
 * leitura e nome/cargo sobrepostos na base, em Inter.
 * - retrato (padrão): Presidente / Vice-presidente.
 * - `wide`: foto horizontal de largura total (foto do grupo).
 */

export type DirectorCardProps = {
  name: string;
  role: string;
  image: string;
  imageAlt: string;
  /** Variante horizontal de largura total (foto do grupo). */
  wide?: boolean;
  /** Esconde a sobreposição de texto (quando o título já vem na seção). */
  hideCaption?: boolean;
};

export function DirectorCard({
  name,
  role,
  image,
  imageAlt,
  wide = false,
  hideCaption = false,
}: DirectorCardProps) {
  return (
    <article
      className={`group relative flex flex-col justify-end overflow-hidden rounded-[28px] bg-neutral-900 font-inter text-white ${
        wide
          ? "aspect-[16/10] p-6 sm:aspect-[2/1] md:p-8"
          : "aspect-[4/5] p-5"
      }`}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes={wide ? "(min-width: 1024px) 1024px, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
        className="object-cover object-top transition duration-500 group-hover:scale-105"
        unoptimized={image.endsWith(".svg")}
      />
      {/* Overlay só o necessário p/ legenda — fotos menores ficavam muito escuras */}
      <div
        className={`absolute inset-0 bg-gradient-to-t to-transparent ${
          wide
            ? "from-black/70 via-black/20"
            : "from-black/50 via-black/10"
        }`}
      />

      {!hideCaption && (
        <div className="relative">
          <h3
            className={`font-inter font-bold leading-tight text-white ${
              wide ? "text-xl md:text-2xl" : "text-lg"
            }`}
          >
            {name}
          </h3>
          {role && <p className="mt-1 text-sm text-white/75">{role}</p>}
        </div>
      )}
    </article>
  );
}
