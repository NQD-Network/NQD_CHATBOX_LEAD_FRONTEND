"use client";
import Head from "next/head";
import dynamic from "next/dynamic";
import React from "react";
import { useTheme } from "../src/contexts/ThemeContext";

const ChatBox = dynamic(() => import("../src/components/ChatBox"), { ssr: false });

export default function Home() {
  const { colors } = useTheme();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nqd.ai/";
  const title = "NQD.ai – Smart Chat Lead Assistant";
  const description =
    "Chat instantly with NQD.ai — your intelligent assistant for web development, automation, and AI-driven solutions.";
  const imageUrl = `${siteUrl}NQD_logo.png`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={siteUrl} />
        <link rel="icon" type="image/png" href="/NQD_logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100%",
          backgroundColor: colors.background,
          transition: "background-color 0.3s ease",
        }}
      >
        <ChatBox />
      </main>
    </>
  );
}
