import { z } from "zod";

// Hiển thị trong dropdown "Vị trí ứng tuyển" khi ứng viên không chọn job nào đang tuyển.
export const POSITION_OTHER = "Khác";

export const MAX_NOTE_LENGTH = 3000;
// Hồ sơ đi qua server Next (app/api/applications/route.ts) mà Vercel chặn body trên 4.5 MB, nên CV tối đa 4 MB.
// Loại file khớp ALLOWED_DOCUMENT_MIME_TYPES ở backend (cpw_be).
const MAX_CV_SIZE = 4 * 1024 * 1024;
const ACCEPTED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Thông báo lỗi là MÃ; form dịch mã thành chữ theo ngôn ngữ (giống lib/contact/schema.ts).
export const applicationSchema = z.object({
  name: z.string().trim().min(1, "required").max(100, "tooLong"),
  email: z.string().trim().min(1, "required").max(200, "tooLong").email("email"),
  phone: z.string().trim().max(30, "tooLong").optional(),
  position: z.string().trim().min(1, "required").max(200, "tooLong"),
  portfolio: z
    .string()
    .trim()
    .max(300, "tooLong")
    .optional()
    .refine((value) => !value || /^https?:\/\//.test(value), "url"),
  cv: z
    .instanceof(File, { error: "fileRequired" })
    .refine((file) => file.size > 0, "fileRequired")
    .refine((file) => file.size <= MAX_CV_SIZE, "fileTooLarge")
    .refine((file) => ACCEPTED_CV_TYPES.includes(file.type), "fileType"),
  note: z.string().trim().max(MAX_NOTE_LENGTH, "tooLong").optional(),
  consent: z.boolean().refine((value) => value === true, "consent"),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
