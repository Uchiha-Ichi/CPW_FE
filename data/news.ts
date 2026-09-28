export interface NewsArticle {
  title: string;
  category: string;
  date: string;
  status: "Đã đăng" | "Bản nháp";
  summary: string;
  cover?: string;
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    title: "Hiểu hơn về vẻ đẹp của bạc trong trang sức",
    category: "Kiến thức chất liệu",
    date: "2026-09-28",
    status: "Đã đăng",
    summary: "Chủ đề khám phá",
  },
  {
    title: "Chọn món trang sức mang dấu ấn của riêng bạn",
    category: "Phong thủy",
    date: "2026-09-27",
    status: "Đã đăng",
    summary: "Chủ đề khám phá",
  },
  {
    title: "Từ ý tưởng đến từng đường nét hoàn thiện",
    category: "Quy trình",
    date: "2026-09-26",
    status: "Đã đăng",
    summary: "Chủ đề khám phá",
  },
];
