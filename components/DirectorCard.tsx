import Image from "next/image";

/**
 * Card de diretor — visual Lovable: retrato em card rounded-[28px] com
 * gradiente de leitura e nome/cargo sobrepostos na base, em Inter.
 */

export type DirectorCardProps = {
  name: string;
  role: string;
  image: string;
  imageAlt: string;
};

export function DirectorCard({ name, role, image, imageAlt }: DirectorCardProps) {
  return (
    <article className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[28px] bg-neutral-900 p-5 font-inter text-white">
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover object-top transition duration-500 group-hover:scale-105"
        unoptimized={image.endsWith(".svg")}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      <div className="relative">
        <h3 className="font-inter text-lg font-bold leading-tight text-white">
          {name}
        </h3>
        <p className="mt-1 text-sm text-white/75">{role}</p>
      </div>
    </article>
  );
}
