import { describe, expect, it } from "vitest";
import { cloudinaryLoader } from "./cloudinary-loader";

const base = "https://res.cloudinary.com/demo/image/upload";

describe("cloudinaryLoader", () => {
  it("chèn biến đổi trước phần version", () => {
    expect(cloudinaryLoader({ src: `${base}/v1/vcb/pages/a.jpg`, width: 640 })).toBe(
      `${base}/f_auto,q_auto,w_640/v1/vcb/pages/a.jpg`,
    );
  });

  it("chèn ngay sau /upload/ khi không có version", () => {
    expect(cloudinaryLoader({ src: `${base}/vcb/pages/a.jpg`, width: 640 })).toBe(
      `${base}/f_auto,q_auto,w_640/vcb/pages/a.jpg`,
    );
  });

  it("đặt biến đổi của mình sau biến đổi có sẵn để width cuối cùng thắng", () => {
    expect(
      cloudinaryLoader({ src: `${base}/c_fill,w_800/v1/vcb/pages/a.jpg`, width: 640 }),
    ).toBe(`${base}/c_fill,w_800/f_auto,q_auto,w_640/v1/vcb/pages/a.jpg`);
  });

  it("dùng quality khi được truyền", () => {
    expect(cloudinaryLoader({ src: `${base}/v1/a.jpg`, width: 320, quality: 60 })).toBe(
      `${base}/f_auto,q_60,w_320/v1/a.jpg`,
    );
  });

  it("trả nguyên src khi không phải Cloudinary, không phải https, hoặc không phải URL", () => {
    expect(cloudinaryLoader({ src: "https://images.unsplash.com/a.jpg", width: 640 })).toBe(
      "https://images.unsplash.com/a.jpg",
    );
    expect(
      cloudinaryLoader({ src: "http://res.cloudinary.com/demo/image/upload/v1/a.jpg", width: 640 }),
    ).toBe("http://res.cloudinary.com/demo/image/upload/v1/a.jpg");
    expect(cloudinaryLoader({ src: "not a url", width: 640 })).toBe("not a url");
    expect(cloudinaryLoader({ src: "/local.png", width: 640 })).toBe("/local.png");
    expect(cloudinaryLoader({ src: "", width: 640 })).toBe("");
  });

  it("trả nguyên src khi là Cloudinary nhưng không phải /image/upload/", () => {
    const src = "https://res.cloudinary.com/demo/video/upload/v1/a.mp4";
    expect(cloudinaryLoader({ src, width: 640 })).toBe(src);
  });
});
