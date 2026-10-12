import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { MONOGRAM_PATH } from "./brand-mark";
import { PRODUCT_NAME } from "./site";

// Share card (Open Graph and Twitter), rendered at build time following the portfolio card
// in Appendix A.9. Literal colours are allowed here: this generates an image asset.
const shareImageSize = { width: 1200, height: 630 };

const STACK = ["Next.js", "TypeScript", "Recharts", "FastAPI", "Vitest"];
const fontDir = join(process.cwd(), "node_modules/@fontsource/ibm-plex-sans/files");

export async function renderShareImage() {
  const [regular, bold] = await Promise.all([
    readFile(join(fontDir, "ibm-plex-sans-latin-400-normal.woff")),
    readFile(join(fontDir, "ibm-plex-sans-latin-700-normal.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: 80,
          background: "#0b0d10",
          fontFamily: "IBM Plex Sans",
          color: "#e4e7ec",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <rect x="0.5" y="0.5" width="31" height="31" rx="7" fill="#13161c" stroke="rgba(228,231,236,0.18)" />
            <path d={MONOGRAM_PATH} fill="#e4e7ec" />
            <rect x="11" y="21" width="10" height="2" fill="#00f2fe" />
          </svg>
          <div style={{ display: "flex", fontSize: 26, color: "#8a93a3" }}>Projeto · Matheus Siqueira</div>
        </div>
        <div style={{ display: "flex", width: 72, height: 4, marginTop: 64, background: "#00f2fe" }} />
        <div style={{ display: "flex", marginTop: 28, fontSize: 76, fontWeight: 700, letterSpacing: -3 }}>
          {PRODUCT_NAME}
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 32, color: "#a3abb8" }}>
          Ajuste preço, custos e demanda e veja lucro, caixa e risco.
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: "auto" }}>
          {STACK.map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                padding: "8px 16px",
                border: "1px solid rgba(228,231,236,0.18)",
                borderRadius: 6,
                fontSize: 22,
                color: "#a3abb8",
              }}
            >
              {item}
            </div>
          ))}
          <div style={{ display: "flex", marginLeft: "auto", alignSelf: "center", fontSize: 24, color: "#8a93a3" }}>
            www.matheussiqueira.dev
          </div>
        </div>
      </div>
    ),
    {
      ...shareImageSize,
      fonts: [
        { name: "IBM Plex Sans", data: regular, weight: 400, style: "normal" },
        { name: "IBM Plex Sans", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
