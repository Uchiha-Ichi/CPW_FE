import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Dấu hiệu tạm "V": thay bằng tệp icon thật khi có.
export default function Icon() {
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
          fontSize: 22,
          fontWeight: 700,
          borderRadius: 6,
        }}
      >
        V
      </div>
    ),
    size,
  );
}
