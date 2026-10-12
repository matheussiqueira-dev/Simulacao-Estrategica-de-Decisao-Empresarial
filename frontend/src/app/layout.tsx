import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";

import packageJson from "../../package.json";
import { HeaderNav } from "./components/HeaderNav";
import { PRODUCT_NAME, REPO_URL, SITE_URL, author } from "./site";
import "./globals.css";

// Downloaded at build time and served from this site: no runtime request to Google.
const plex = IBM_Plex_Sans({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
  preload: true,
});

const title = `${PRODUCT_NAME} | ${author.name}`;
const description =
  "Simulador de decisões de negócio: ajuste preço, custos, equipe, juros e demanda e veja lucro, caixa, risco e a projeção mensal. Feito com Next.js e TypeScript.";

export const viewport: Viewport = { colorScheme: "dark", themeColor: "#0b0d10" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: PRODUCT_NAME,
  authors: [{ name: author.name, url: author.url }],
  creator: author.name,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: author.name,
    locale: "pt_BR",
    url: "/",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: PRODUCT_NAME,
  description,
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "pt-BR",
  author: {
    "@type": "Person",
    name: author.name,
    url: author.url,
    sameAs: [author.linkedin, author.github],
  },
  codeRepository: REPO_URL,
};

// VERCEL_GIT_COMMIT_SHA only exists in Vercel builds; local builds omit the commit.
const footerMeta = [
  PRODUCT_NAME,
  `v${packageJson.version}`,
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
]
  .filter(Boolean)
  .join(" · ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      className={plex.variable}
      style={{ backgroundColor: "#0b0d10", colorScheme: "dark" }}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <a className="ms-skip-link" href="#main-content">
          Pular para o conteúdo
        </a>
        <header className="ms-header">
          <div className="ms-container ms-header__inner">
            <Link href="/" className="ms-header__brand">
              <span className="ms-header__mark" aria-hidden="true">
                SD
              </span>
              <span className="max-[480px]:sr-only">{PRODUCT_NAME}</span>
            </Link>
            <HeaderNav />
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="ms-footer">
          <div className="ms-container ms-footer__inner">
            <p className="ms-footer__signature">
              <a href={author.url}>Desenvolvido por Matheus Siqueira</a>{" "}
              <span aria-hidden="true">|</span>{" "}
              <a href={author.url}>www.matheussiqueira.dev</a>
            </p>
            <nav className="ms-footer__links" aria-label="Links do autor">
              <a href={author.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn<span className="ms-sr-only"> (abre em nova aba)</span>
              </a>
              <a href={author.github} target="_blank" rel="noopener noreferrer">
                GitHub<span className="ms-sr-only"> (abre em nova aba)</span>
              </a>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                Código deste projeto<span className="ms-sr-only"> (abre em nova aba)</span>
              </a>
            </nav>
            <p className="ms-footer__meta">{footerMeta}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
