import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/**
 * Layout do site institucional público.
 * Envolve todas as rotas públicas (route group "(site)" — não altera as URLs)
 * com a Navbar e o Footer. O /painel-diretoria fica FORA deste grupo e não
 * recebe essa moldura.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
