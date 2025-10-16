"use client";

import Head from "next/head";
import dynamic from "next/dynamic";
import React from "react";

// Lazy load ChatBox to avoid SSR issues
const ChatBox = dynamic(() => import("../src/components/ChatBox"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Simple Chat Lead</title>
        <meta name="description" content="Simple chatbot lead form" />
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
