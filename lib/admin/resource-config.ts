// "country": chọn quốc gia, tự điền name + code (cờ) + pos. "hidden": giữ giá trị trong form, không hiện ô nhập.
export type FieldType = "text" | "select" | "textarea" | "mappos" | "country" | "hidden";

export interface ResourceField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
}

export interface ResourceColumn {
  key: string;
  label: string;
}

export interface ResourceConfig {
  path: string;
  label: string;
  singular: string;
  fields: ResourceField[];
  columns: ResourceColumn[];
}

export const NETWORK_CONFIG: ResourceConfig = {
  path: "network",
  label: "Bản đồ quốc gia",
  singular: "quốc gia",
  fields: [
    { key: "name", label: "Quốc gia", type: "country", required: true },
    { key: "code", label: "Mã cờ", type: "hidden" },
    { key: "city", label: "Thành phố", type: "text" },
    { key: "note", label: "Vai trò", type: "text" },
    {
      key: "status",
      label: "Trạng thái",
      type: "select",
      required: true,
      options: ["Hiển thị", "Ẩn"],
    },
    { key: "pos", label: "Vị trí trên bản đồ", type: "mappos" },
  ],
  columns: [
    { key: "name", label: "Quốc gia" },
    { key: "city", label: "Thành phố" },
    { key: "status", label: "Trạng thái" },
  ],
};

export const PRODUCTS_CONFIG: ResourceConfig = {
  path: "products",
  label: "Sản phẩm",
  singular: "sản phẩm",
  fields: [
    { key: "name", label: "Tên sản phẩm", type: "text", required: true },
    {
      key: "category",
      label: "Danh mục",
      type: "select",
      required: true,
      options: ["Trang sức", "Đồ da", "Pháp lam", "Đậu bạc", "Đá quý"],
    },
    {
      key: "status",
      label: "Trạng thái",
      type: "select",
      required: true,
      options: ["Hiển thị", "Ẩn"],
    },
    { key: "description", label: "Mô tả ngắn", type: "text" },
  ],
  columns: [
    { key: "name", label: "Sản phẩm" },
    { key: "category", label: "Danh mục" },
    { key: "status", label: "Trạng thái" },
  ],
};

export const JOBS_CONFIG: ResourceConfig = {
  path: "jobs",
  label: "Tuyển dụng",
  singular: "vị trí",
  fields: [
    { key: "title", label: "Tên vị trí", type: "text", required: true },
    {
      key: "department",
      label: "Nhóm",
      type: "select",
      required: true,
      options: ["Kinh doanh", "Sáng tạo", "Vận hành", "Công nghệ"],
    },
    {
      key: "location",
      label: "Địa điểm",
      type: "select",
      required: true,
      options: ["Hà Nội", "Remote / Quốc tế"],
    },
    {
      key: "type",
      label: "Hình thức",
      type: "select",
      required: true,
      options: ["Toàn thời gian", "Bán thời gian", "Thực tập"],
    },
    {
      key: "status",
      label: "Trạng thái",
      type: "select",
      required: true,
      options: ["Đang tuyển", "Đã đóng"],
    },
    { key: "description", label: "Mô tả công việc", type: "text" },
  ],
  columns: [
    { key: "title", label: "Vị trí" },
    { key: "department", label: "Nhóm" },
    { key: "status", label: "Trạng thái" },
  ],
};
