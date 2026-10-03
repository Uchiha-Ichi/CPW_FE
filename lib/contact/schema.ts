import { z } from "zod";

export const CONTACT_TOPICS = ["business", "products", "media", "careers", "other"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

// Nhãn tiếng Việt dùng khi gộp chủ đề vào nội dung gửi cho admin (người nhận đọc tiếng Việt).
export const TOPIC_LABELS_VI: Record<ContactTopic, string> = {
  business: "Hợp tác kinh doanh",
  products: "Sản phẩm và showroom",
  media: "Truyền thông",
  careers: "Tuyển dụng",
  other: "Khác",
};

// Giới hạn độ dài do FE đặt để chặn gửi bừa (backend CreateContactDto chưa đặt giới hạn).
export const MAX_MESSAGE_LENGTH = 5000;
const MAX_JOB_LENGTH = 200;

// Thông báo lỗi là MÃ ("required" | "email" | "tooLong"); form dịch mã thành chữ theo ngôn ngữ.
export const contactSchema = z.object({
  name: z.string().trim().min(1, "required").max(100, "tooLong"),
  email: z.string().trim().min(1, "required").max(200, "tooLong").email("email"),
  phone: z.string().trim().max(30, "tooLong").optional(),
  company: z.string().trim().max(150, "tooLong").optional(),
  topic: z.enum(CONTACT_TOPICS),
  job: z.string().trim().max(MAX_JOB_LENGTH, "tooLong").optional(),
  message: z.string().trim().min(1, "required").max(MAX_MESSAGE_LENGTH, "tooLong"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

const first = (raw: string | string[] | undefined): string | undefined =>
  Array.isArray(raw) ? raw[0] : raw;

export function parseTopicParam(raw: string | string[] | undefined): ContactTopic | undefined {
  const value = first(raw);
  return CONTACT_TOPICS.find((t) => t === value);
}

export function parseJobParam(raw: string | string[] | undefined): string | undefined {
  const value = first(raw)?.trim();
  return value ? value.slice(0, MAX_JOB_LENGTH) : undefined;
}
