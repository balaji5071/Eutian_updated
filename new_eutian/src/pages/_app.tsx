import '@/index.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { RegionProvider } from "@/lib/region-context";
import Navbar from "@/components/Navbar";
import AdminNavbar from "@/components/AdminNavbar";
import { useRouter } from 'next/router';
import Footer from "@/components/Footer";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdmin = router.pathname === '/eutianadmin';
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Eutian — Modern Web, SaaS, AI Chatbots</title>
        <meta name="description" content="Eutian builds high‑quality websites, SaaS dashboards, and AI chatbots. Fast delivery, clean code, and great UX. Get a quote today." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Eutian — Modern Web, SaaS, AI Chatbots" />
        <meta property="og:description" content="Eutian builds high‑quality websites, SaaS dashboards, and AI chatbots. Fast delivery, clean code, and great UX." />
        <meta property="og:url" content="/" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Eutian — Modern Web, SaaS, AI Chatbots" />
        <meta name="twitter:description" content="Eutian builds high‑quality websites, SaaS dashboards, and AI chatbots." />
        <meta name="twitter:image" content="/og-image.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TooltipProvider>
        <AuthProvider>
          <RegionProvider>
            <div className="flex flex-col min-h-screen">
              {isAdmin ? <AdminNavbar /> : <Navbar />}
              <main className="flex-1">
                <Component {...pageProps} />
              </main>
              <Footer />
            </div>
            <Toaster />
          </RegionProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
