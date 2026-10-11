import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import packageJson from "../../package.json";
import { PRODUCT_NAME, REPO_URL, SITE_URL, author } from "./site";
import "./globals.css";

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

const description =
  "Painel interativo para testar variáveis de negócio e visualizar impacto financeiro em tempo real.";

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} | ${author.name}`,
  description,
  authors: [{ name: author.name, url: author.url }],
  creator: author.name,
  alternates: { canonical: SITE_URL },
  openGraph: { url: SITE_URL },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: PRODUCT_NAME,
  description,
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
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
    <html lang="pt-BR">
      <body
        className={`${sans.variable} ${display.variable} bg-slate-950 text-slate-100 antialiased font-sans`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
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
