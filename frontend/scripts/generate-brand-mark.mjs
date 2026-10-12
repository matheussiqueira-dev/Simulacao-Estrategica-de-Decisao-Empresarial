// Generates the "SD" monogram used by the favicon and the share images (Appendix A.9).
// Fonts do not load inside favicons, so the letters are converted to vector outlines
// from IBM Plex Sans 700. The PNG and ICO files are rasterized from the same SVG with
// next/og, the renderer that already draws the Apple icon at build time. Run after
// changing the monogram:
//
//   node scripts/generate-brand-mark.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";
import og from "next/og.js";
import { createElement } from "react";

const MONOGRAM = "SD";
const VIEWBOX = 32;
const CAP_HEIGHT_PX = 12;
const BASELINE_Y = 17.5;

const fontFile = fileURLToPath(
  new URL(
    "../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff",
    import.meta.url,
  ),
);
const font = fontkit.openSync(fontFile);
if (!("layout" in font)) throw new Error("Expected a single font, got a font collection");

const scale = CAP_HEIGHT_PX / font.capHeight;
const run = font.layout(MONOGRAM);
const advance = run.positions.reduce((total, position) => total + position.xAdvance, 0) * scale;
let cursor = (VIEWBOX - advance) / 2;

const round = (svgPath) => svgPath.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 100) / 100));
const parts = run.glyphs.map((glyph, index) => {
  const d = glyph.path.scale(scale, -scale).translate(cursor, BASELINE_Y).toSVG();
  cursor += run.positions[index].xAdvance * scale;
  return round(d);
});
const monogramPath = parts.join(" ");

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" width="${VIEWBOX}" height="${VIEWBOX}">
  <rect x="0.5" y="0.5" width="31" height="31" rx="7" fill="#13161c" stroke="rgba(228,231,236,0.18)"/>
  <path d="${monogramPath}" fill="#e4e7ec"/>
  <rect x="11" y="21" width="10" height="2" fill="#00f2fe"/>
</svg>
`;

const brandModule = `// Written by scripts/generate-brand-mark.mjs. Do not edit by hand.
/** "${MONOGRAM}" in IBM Plex Sans 700, outlined, on a ${VIEWBOX}x${VIEWBOX} grid. */
export const MONOGRAM_PATH =
  "${monogramPath}";
`;

async function renderPng(size) {
  const source = `data:image/svg+xml;base64,${Buffer.from(iconSvg).toString("base64")}`;
  const image = createElement("img", { src: source, width: size, height: size, alt: "" });
  const response = new og.ImageResponse(image, { width: size, height: size });
  return Buffer.from(await response.arrayBuffer());
}

/** One PNG-compressed entry, which browsers and Windows read in .ico files. */
function icoFromPng(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2); // image type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(header.length, 18);
  return Buffer.concat([header, png]);
}

writeFileSync(new URL("../src/app/icon.svg", import.meta.url), iconSvg);
writeFileSync(new URL("../src/app/brand-mark.ts", import.meta.url), brandModule);
writeFileSync(new URL("../src/app/favicon.ico", import.meta.url), icoFromPng(await renderPng(32), 32));
mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/icon-512.png", import.meta.url), await renderPng(512));
console.log(
  `Wrote src/app/icon.svg, src/app/brand-mark.ts, src/app/favicon.ico and public/icon-512.png ` +
    `(${monogramPath.length} chars of path data)`,
);
