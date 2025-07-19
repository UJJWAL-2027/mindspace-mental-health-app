// pages/_app.tsx

import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import '@/styles/globals.css'; // adjust the path if needed

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  // Initialize React Query client once per app
  const [queryClient] = useState(() => new QueryClient());

  console.log("🛡️ _app.tsx loaded, wrapping with SessionProvider & QueryClientProvider");

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
