import "@aws-amplify/ui-react/styles.css";
import "@/styles/globals.css";
import { Amplify } from "aws-amplify";
import awsconfig from "../aws-exports";
import type { AppProps } from "next/app";
import { Authenticator } from "@aws-amplify/ui-react";

Amplify.configure({
  ...awsconfig,
  // this lets you run Amplify code on the server-side in Next.js
  ssr: true,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Authenticator>
      <Component {...pageProps} />
    </Authenticator>
  );
}
