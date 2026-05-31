import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Business Decision Simulator";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b1220",
          color: "#f8fafc",
          padding: 72,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 18,
              background: "#22c55e",
            }}
          />
          <div style={{ fontSize: 30, color: "#94a3b8" }}>
            Business Decision Simulator
          </div>
        </div>
        <div>
          <div style={{ fontSize: 70, lineHeight: 1.05, fontWeight: 700, width: 980 }}>
            Simule decisoes estrategicas com impacto financeiro em tempo real.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#cbd5e1", width: 900 }}>
            Preco, custos, marketing, demanda e risco em um cockpit pronto para
            portfolio.
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#86efac" }}>
          Desenvolvido por Matheus Siqueira
        </div>
      </div>
    ),
    size,
  );
}
