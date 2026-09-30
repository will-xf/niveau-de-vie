import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#15161b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <line x1="10" y1="1" x2="10" y2="19" stroke="#9096a6" strokeWidth="2" />
          <line x1="4" y1="7" x2="16" y2="7" stroke="#9096a6" strokeWidth="2" />
          <circle cx="10" cy="7" r="2.6" fill="#4c7cf3" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
