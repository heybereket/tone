"use client";

import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import { useEffect } from "react";
import { hop } from "@onehop/client";
import { HOP_PROJECT_ID } from "@/lib/constants";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    hop.init({
      projectId: HOP_PROJECT_ID,
    });
  }, []);

  return (
    <>
      <SessionProvider>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}
