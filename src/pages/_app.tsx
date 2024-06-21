import { AuthenWrapper } from "@/components/custom";
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Money Lover</title>
        <meta name="description" content="Money Lover" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/salary.png" />
      </Head>
      <AuthenWrapper>
        <Component {...pageProps} />
      </AuthenWrapper>
    </SessionProvider>
  );
}
