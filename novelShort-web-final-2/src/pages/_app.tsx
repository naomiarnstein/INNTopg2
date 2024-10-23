import "@/styles/globals.css";
import type { AppProps } from "next/app";

// Definerer App-komponenten, som er den overordnede komponent for hele applikationen
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
