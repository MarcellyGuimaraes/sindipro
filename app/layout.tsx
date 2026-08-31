import type { Metadata } from "next";
import { fontDisplay, fontSans, fontInter } from "@/lib/fonts";
import { ChunkErrorReload } from "@/components/ChunkErrorReload";
import "./globals.css";

const SITE_NAME = "SindiproSE";
const SITE_DESCRIPTION =
  "Representação dos provedores de internet e de serviço de comunicação multimídia do Estado de Sergipe.";

export const metadata: Metadata = {
  // TODO: confirmar o domínio final de produção.
  metadataBase: new URL("https://www.sindiprose.org.br"),
  title: {
    default: "SindiproSE - Sindicato dos Provedores de Internet de Sergipe",
    template: "%s - SindiproSE",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    title: "SindiproSE - Sindicato dos Provedores de Internet de Sergipe",
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
    <html
      lang="pt-BR"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontInter.variable}`}
    >
      <body>
        <ChunkErrorReload />
        {children}
      </body>
    </html>
  );
}
