import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  company: z.string().optional(),
  topic: z.enum([
    "Hợp tác kinh doanh",
    "Sản phẩm và showroom",
    "Truyền thông",
    "Tuyển dụng",
    "Khác",
  ]),
  message: z.string().min(1, "Vui lòng nhập nội dung"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
