import { ImageResponse } from "next/og";

import { MONOGRAM_PATH } from "./brand-mark";

// Rendered at build time. Opaque (iOS rounds the corners itself); colours are the
// favicon recipe from Appendix A.9, the allowlisted place for literal hex values.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#13161c" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path d={MONOGRAM_PATH} fill="#e4e7ec" />
          <rect x="11" y="21" width="10" height="2" fill="#00f2fe" />
        </svg>
      </div>
    ),
    size,
  );
}
