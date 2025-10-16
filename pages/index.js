"use client";

import Head from "next/head";
import dynamic from "next/dynamic";
import React from "react";

// Lazy load ChatBox to avoid SSR issues
const ChatBox = dynamic(() => import("../src/components/ChatBox"), {
  ssr: false,
});

export default function Home() {
  const siteUrl = "https://www.nqd.ai/"; // ✅ replace with your real site URL
  const title = "NQD.ai – Smart Chat Lead Assistant";
  const description =
    "Chat instantly with NQD.ai — your intelligent assistant for web development, automation, and AI-driven solutions. Schedule a meeting instantly!";
  const imageUrl = `${siteUrl}/NQD_logo.png`; // ✅ must be absolute URL for social media preview

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* ✅ Canonical URL */}
        <link rel="canonical" href={siteUrl} />

        {/* ✅ Favicon */}
        <link rel="icon" type="image/png" href="/NQD_logo.png" />

        {/* ✅ Open Graph (for Facebook, LinkedIn, WhatsApp) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* ✅ Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />

        {/* ✅ Additional SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="chatbot, ai assistant, automation, website development, digital marketing, CRM, ERP, SEO" />
        <meta name="author" content="NQD.ai Team" />
        <meta name="theme-color" content="#0e8695" />
      </Head>

      <main
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          backgroundColor: "#f9fafb",
        }}
      >
        <ChatBox />
      </main>
    </>
  );
}
