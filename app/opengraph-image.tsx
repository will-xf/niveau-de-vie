import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#15161b",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
        }}
      >
        <div style={{ fontSize: 64, color: "#f5f6f8", display: "flex" }}>
          Niveau de vie
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#9096a6",
            marginTop: 24,
            maxWidth: 900,
            display: "flex",
          }}
        >
          Comparez votre niveau de vie aux repères nationaux : seuil de
          pauvreté, médiane, seuil de richesse.
        </div>
        <div
          style={{
            position: "absolute",
            left: 80,
            bottom: 70,
            width: 220,
            height: 6,
            background: "#4c7cf3",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
