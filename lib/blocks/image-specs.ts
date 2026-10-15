// Quy cách ảnh/video của từng chỗ gắn ảnh trong các khối. Một nguồn dùng chung cho khung giữ chỗ trên website
// (components/blocks/shared/image-slot.tsx) và gợi ý ở ô chọn ảnh trong admin, để người soạn biết đường chọn ảnh.
// Tỷ lệ lấy từ khung hiển thị thật trong từng component khối; ảnh bị cắt (object-cover) theo khung nên chủ thể
// nên ở giữa. "Rộng tối thiểu" là gợi ý để ảnh không vỡ trên màn hình lớn, không phải giới hạn của hệ thống.
export interface ImageSpec {
  ratio: string;
  orientation: "ngang" | "dọc" | "vuông";
  minWidth: number;
  hint: string;
}

// Khóa: `<loại khối>.<field>` (field ảnh nằm trực tiếp trong khối) hoặc `<loại khối>.<list>.<field>` (nằm trong thẻ).
export const IMAGE_SPECS = {
  "hero.slides.image": {
    ratio: "16:9",
    orientation: "ngang",
    minWidth: 1920,
    hint: "Ảnh phủ kín đầu trang, chữ trắng nằm bên trái nên đặt chủ thể về bên phải và chọn ảnh không quá sáng. Thêm từ 2 ảnh thì đầu trang tự xoay. Dùng được video lặp ngắn, không tiếng.",
  },
  "text-image.image": {
    ratio: "4:3",
    orientation: "ngang",
    minWidth: 1400,
    hint: "Cảnh làm việc hoặc không gian thật, không chèn chữ vào ảnh. Dùng được video.",
  },
  "banner.image": {
    ratio: "16:9",
    orientation: "ngang",
    minWidth: 1920,
    hint: "Ảnh hoặc video nền rộng; chữ trắng đè lên nên chọn ảnh không quá sáng.",
  },
  "card-grid.items.image": {
    ratio: "4:3",
    orientation: "ngang",
    minWidth: 1200,
    hint: "Chủ thể ở giữa vì ảnh bị cắt theo khung. Dùng được video.",
  },
  "product-showcase.items.image": {
    ratio: "3:5",
    orientation: "dọc",
    minWidth: 900,
    hint: "Ảnh phủ kín cả thẻ, chữ trắng đè lên phần trên: sản phẩm đặt ở giữa hoặc nửa dưới, nền gọn. Dùng được video.",
  },
  "carousel.items.image": {
    ratio: "3:2",
    orientation: "ngang",
    minWidth: 1600,
    hint: "Chủ thể ở giữa vì ô bị cắt (ô to gần 2:1, ô nhỏ gần 3:2). Dùng được video.",
  },
  "people.items.image": {
    ratio: "4:5",
    orientation: "dọc",
    minWidth: 1000,
    hint: "Chân dung nửa người, nhìn thẳng, nền gọn; khuôn mặt ở nửa trên khung vì ảnh bị cắt theo khung.",
  },
  "photo-columns.items.image": {
    ratio: "3:4",
    orientation: "dọc",
    minWidth: 900,
    hint: "Ảnh dọc phủ kín cột, chủ thể ở giữa vì ảnh bị cắt theo khung. Dùng được video.",
  },
  "photo-columns.items.image2": {
    ratio: "3:2",
    orientation: "ngang",
    minWidth: 900,
    hint: "Chỉ dùng khi muốn hai ảnh trong một cột: ảnh này xếp dưới ảnh đầu, mỗi ảnh chiếm nửa khung (tỷ lệ mỗi nửa khoảng 3:2).",
  },
  "photo-circles.items.image": {
    ratio: "1:1",
    orientation: "vuông",
    minWidth: 900,
    hint: "Tải ảnh vuông, website tự cắt thành hình tròn: chủ thể ở giữa, chừa viền xung quanh. Nhãn đè lên nửa dưới nên chọn ảnh nửa dưới không quá sáng.",
  },
  "photo-gallery.featured": {
    ratio: "16:9",
    orientation: "ngang",
    minWidth: 2000,
    hint: "Ảnh tập thể hoặc không gian, ngang rộng; cả đoàn người nên nằm ở vùng giữa vì hai mép có thể bị cắt khi màn hình thấp hoặc là điện thoại.",
  },
  "photo-gallery.items.image": {
    ratio: "4:3",
    orientation: "ngang",
    minWidth: 1000,
    hint: "Ảnh nhỏ trong dải trượt, một chủ thể rõ.",
  },
} as const satisfies Record<string, ImageSpec>;

export type ImageSlotKey = keyof typeof IMAGE_SPECS;

// Tra theo vị trí field trong khối. Trả undefined nếu chỗ đó chưa có quy cách (ví dụ khối mới thêm sau).
export function imageSpecFor(
  blockType: string,
  listKey: string | null,
  fieldKey: string,
): ImageSpec | undefined {
  const key = `${blockType}.${listKey ? `${listKey}.` : ""}${fieldKey}`;
  return (IMAGE_SPECS as Record<string, ImageSpec>)[key];
}

// Câu gợi ý ngắn đặt cạnh ô chọn ảnh trong admin.
export function imageSpecText(spec: ImageSpec): string {
  return `Gợi ý: ảnh ${spec.orientation} ${spec.ratio}, rộng từ ${spec.minWidth}px. ${spec.hint}`;
}

export function imageHintFor(blockType: string, listKey: string | null, fieldKey: string): string | undefined {
  const spec = imageSpecFor(blockType, listKey, fieldKey);
  return spec ? imageSpecText(spec) : undefined;
}
