// pages/_app.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Track page view on route change (important for Next.js)
  useEffect(() => {
    const handleRouteChange = (url) => {
      window.gtag("config", "G-5W1QMEV79W", {
        page_path: url,
      });
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  return (
    <>
      {/* ✅ Load Google Analytics script asynchronously */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-5W1QMEV79W"
      />

      {/* ✅ Initialize Google Analytics */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-5W1QMEV79W');
        `}
      </Script>

      {/* Render your actual pages */}
      <Component {...pageProps} />
    </>
  );
}
