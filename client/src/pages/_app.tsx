"use client";

import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
        <ChakraProvider>
          <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}
