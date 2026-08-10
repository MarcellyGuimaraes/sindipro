import styles from "./conecte.module.css";

/**
 * Faixa de chamada em loop no topo da página.
 *
 * O loop é só CSS: a trilha tem dois grupos idênticos e desliza -50%, ou seja,
 * exatamente a largura de um grupo — quando a animação reinicia, o segundo
 * grupo está no lugar do primeiro e não aparece emenda. Por isso não há JS
 * aqui e o componente continua sendo Server Component.
 *
 * A faixa é decorativa: repete uma chamada que já existe na barra logo abaixo.
 * Fica fora da ordem de leitura e de tabulação para não render oito paradas de
 * teclado e oito repetições no leitor de tela; o clique com o mouse continua
 * funcionando.
 */

const TEXTO_ANTES = "Garanta seu lugar no ";
const TEXTO_DESTAQUE = "principal encontro do setor de ISPs";
const TEXTO_DEPOIS = " de Sergipe";

/** Repetições por grupo — o bastante para preencher telas largas. */
const REPETICOES = 4;

function Grupo({ href }: { href: string }) {
  return (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: REPETICOES }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5">
          <p className="whitespace-nowrap text-[0.8125rem] leading-none">
            {TEXTO_ANTES}
            <strong className="font-semibold">{TEXTO_DESTAQUE}</strong>
            {TEXTO_DEPOIS}
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            className={`${styles.bgPrimary} ${styles.textPrimaryFg} inline-flex shrink-0 items-center rounded-full px-4 py-1.5 text-[0.8125rem] font-semibold leading-none`}
          >
            Clique aqui!
          </a>
        </div>
      ))}
    </div>
  );
}

export function TopMarquee({ href }: { href: string }) {
  return (
    <div className={`${styles.marqueeBar} w-full overflow-hidden`} aria-hidden="true">
      <div className={`${styles.marqueeTrack} py-2.5`}>
        <Grupo href={href} />
        <Grupo href={href} />
      </div>
    </div>
  );
}
