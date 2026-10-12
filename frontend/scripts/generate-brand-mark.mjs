// Generates the "SD" monogram used by the favicon and the share images (Appendix A.9).
// Fonts do not load inside favicons, so the letters are converted to vector outlines
// from IBM Plex Sans 700. Run after changing the monogram:
//
//   node scripts/generate-brand-mark.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";

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

writeFileSync(new URL("../src/app/icon.svg", import.meta.url), iconSvg);
writeFileSync(new URL("../src/app/brand-mark.ts", import.meta.url), brandModule);
console.log(`Wrote src/app/icon.svg and src/app/brand-mark.ts (${monogramPath.length} chars of path data)`);
