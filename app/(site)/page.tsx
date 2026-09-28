import { ContentBlock } from "@/components/content-block/content-block";
import type { ContentBlockData } from "@/components/content-block/types";

const mockHero: ContentBlockData = {
  layout: "hero",
  title: "Di sản chế tác",
  text: "Mang tinh hoa văn hoá Việt vào từng tuyệt tác trang sức.",
  btnLabel: "Khám phá",
  btnLink: "/about"
};

const mockCards: ContentBlockData = {
  layout: "cards",
  title: "Giá trị cốt lõi",
  items: [
    { t: "Văn hoá", d: "Lan toả bản sắc Việt" },
    { t: "Chất lượng", d: "Chế tác thủ công tinh xảo" }
  ]
};

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-24">
      <ContentBlock data={mockHero} />
      <ContentBlock data={mockCards} />
    </div>
  );
}
