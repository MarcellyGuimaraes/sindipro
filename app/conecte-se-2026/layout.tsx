import { GoogleAnalytics } from "@/components/GoogleAnalytics";

/**
 * Layout da landing do CONECTE-SE 2026.
 *
 * Existe só para carregar o Google Analytics nesta rota: a medição interessa
 * ao evento, e o site institucional segue sem script de terceiro.
 */
export default function ConecteSe2026Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <GoogleAnalytics />
    </>
  );
}
