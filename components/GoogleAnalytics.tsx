import Script from "next/script";

/**
 * Google Analytics 4 (gtag.js).
 *
 * Só renderiza se NEXT_PUBLIC_GA_ID estiver definido — assim o dev local e os
 * previews ficam limpos enquanto a variável não for configurada no ambiente.
 */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
