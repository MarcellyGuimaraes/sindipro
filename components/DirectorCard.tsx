import Image from "next/image";

/**
 * Card de diretor (CLAUDE.md §8): foto, nome, cargo. Layout sóbrio.
 * Borda 1px blue-200, raio discreto, sem sombra. Retrato 4/5.
 */

export type DirectorCardProps = {
  name: string;
  role: string;
  image: string;
  imageAlt: string;
};

export function DirectorCard({ name, role, image, imageAlt }: DirectorCardProps) {
  return (
    <article className="overflow-hidden rounded-card border border-blue-200 bg-surface">
      <div className="relative aspect-[4/5] w-full bg-navy-900">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover object-top"
          unoptimized={image.endsWith(".svg")}
        />
      </div>
      <div className="p-4">
        <h3 className="font-display text-h3 font-medium leading-tight text-navy-900">
          {name}
        </h3>
        <p className="mt-1 text-small text-navy-900/80">{role}</p>
      </div>
    </article>
  );
}
