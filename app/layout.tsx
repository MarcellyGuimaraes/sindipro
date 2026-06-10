import type { Metadata } from "next";
import { fontDisplay, fontSans } from "@/lib/fonts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const SITE_NAME = "Sindipro SE";
const SITE_DESCRIPTION =
  "Representação dos provedores de internet e de serviço de comunicação multimídia do Estado de Sergipe.";

export const metadata: Metadata = {
  // TODO: confirmar o domínio final de produção.
  metadataBase: new URL("https://www.sindiprose.org.br"),
  title: {
    default: "Sindipro SE — Sindicato dos Provedores de Internet de Sergipe",
    template: "%s — Sindipro SE",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    title: "Sindipro SE — Sindicato dos Provedores de Internet de Sergipe",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${fontDisplay.variable} ${fontSans.variable}`}>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
