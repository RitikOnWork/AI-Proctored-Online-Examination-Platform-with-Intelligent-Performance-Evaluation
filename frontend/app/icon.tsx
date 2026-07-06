import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#6366f1",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "8px",
          fontWeight: "extrabold",
          fontFamily: "sans-serif",
          boxShadow: "0 0 10px rgba(99, 102, 241, 0.5)",
        }}
      >
        P
      </div>
    ),
    {
      ...size,
    }
  );
}
