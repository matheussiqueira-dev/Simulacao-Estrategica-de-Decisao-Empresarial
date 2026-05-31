import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://simulacao-estrategica-decisao.vercel.app",
);

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "Business Decision Simulator",
  title: {
    default: "Business Decision Simulator",
    template: "%s | Business Decision Simulator",
  },
  description:
    "Painel interativo para testar variaveis de negocio e visualizar impacto financeiro em tempo real.",
  authors: [{ name: "Matheus Siqueira", url: "https://www.matheussiqueira.dev" }],
  creator: "Matheus Siqueira",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/app-icon.svg",
    apple: "/app-icon.svg",
  },
  openGraph: {
    title: "Business Decision Simulator",
    description:
      "Simule preco, custos, marketing, demanda e risco em um cockpit financeiro responsivo.",
    url: "/",
    siteName: "Business Decision Simulator",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Decision Simulator",
    description:
      "Cockpit financeiro para simulacao estrategica de decisoes empresariais.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${sans.variable} ${display.variable} bg-slate-950 text-slate-100 antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
