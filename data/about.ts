import type { ContentBlockData } from "@/components/content-block/types";
import type { MarqueeItem } from "@/components/marquee/marquee";

export const ABOUT_BLOCKS: ContentBlockData[] = [
  {
    layout: "hero",
    title: "Kết nối tinh hoa thủ công Việt với thị trường toàn cầu.",
    text: "Viễn Chí Bảo là công ty công nghệ và truyền thông số, phát triển thương hiệu sản phẩm thủ công cao cấp bằng AI, dữ liệu thị trường và thương mại điện tử xuyên biên giới.",
  },
  {
    layout: "text",
    title: "Giữ giá trị gốc, mở rộng cơ hội.",
    text: "Công nghệ là phương tiện để câu chuyện, tay nghề và bản sắc của người làm thủ công được nhìn thấy rộng rãi hơn.",
  },
  {
    layout: "cta",
    title: "Cùng đưa giá trị thủ công Việt đi xa hơn.",
    btnLabel: "Trao đổi về hợp tác →",
    btnLink: "/contact",
  },
];

export const ABOUT_GALLERY: MarqueeItem[] = [
  { alt: "Anh HuyK" },
  { alt: "Chị Nhạn" },
  { alt: "Ảnh xưởng" },
  { alt: "Ảnh văn phòng" },
  { alt: "Ảnh cửa hàng" },
];
