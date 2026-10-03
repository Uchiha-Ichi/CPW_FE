import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Dấu hiệu tạm "V": thay bằng tệp icon thật khi có.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050A14",
          color: "#58B7FF",
          fontSize: 120,
          fontWeight: 700,
          borderRadius: 32,
        }}
      >
        V
      </div>
    ),
    size,
  );
}
