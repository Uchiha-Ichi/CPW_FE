export interface NewsArticle {
  _id: string;
  title: string;
  category: "Tin công ty" | "Thị trường" | "Sự kiện";
  date: string;
  status: "Đã đăng" | "Bản nháp";
  summary?: string;
  body?: string;
  cover?: string;
}
