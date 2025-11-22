// pages/_app.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import "../public/fonts/gilroy.css";
import Layout from "../src/components/Layout";
import { ThemeProvider } from "../src/contexts/ThemeContext";
import SessionWatcher from "../src/components/SessionWatcher";
import "../src/styles/SessionWatcher.css";

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
    <ThemeProvider>
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

        /* Smooth transitions for all theme changes */
        * {
          transition-property: background-color, color, border-color;
          transition-duration: 0.3s;
          transition-timing-function: ease;
        }
      `}</style>

      {/* Render your actual pages */}
      <Layout>
        <SessionWatcher />
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
