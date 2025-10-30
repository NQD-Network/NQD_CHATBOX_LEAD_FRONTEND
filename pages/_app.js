// pages/_app.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Script from "next/script";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  // Track page view on route change (important for Next.js)
  useEffect(() => {
    if (!GA_ID) return;

    const handleRouteChange = (url) => {
      window.gtag("config", GA_ID, {
        page_path: url,
      });
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events, GA_ID]);

  return (
    <>
      <Head>
        {/* Load Gilroy Font */}
        <link
          rel="stylesheet"
          href="https://gistcdn.githack.com/mfd/09b70eb47474836f25a21660282ce0fd/raw/e06a670afcb2b861ed2ac4a1ef752d062ef6b46b/Gilroy.css"
        />
      </Head>

      {/* Load Google Analytics script asynchronously if GA_ID is configured */}
      {GA_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />

          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {/* Global styles */}
      <style jsx global>{`
        * {
          font-family: 'Gilroy', -apple-system, BlinkMacSystemFont, 'Segoe UI',
                       'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
                       'Droid Sans', 'Helvetica Neue', sans-serif;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: 'Gilroy', sans-serif;
        }
      `}</style>

      {/* Render your actual pages */}
      <Component {...pageProps} />
    </>
  );
}
