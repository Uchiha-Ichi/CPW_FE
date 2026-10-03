"use server";

import { createContact } from "@/lib/api/contacts";
import { buildContactMessage } from "@/lib/contact/message";
import { contactSchema } from "@/lib/contact/schema";

export type SubmitContactResult = { ok: true } | { ok: false; reason: "invalid" | "failed" };

// Kiểm lại bằng cùng schema ở server (không tin dữ liệu từ client), rồi gọi POST /contacts từ server.
export async function submitContact(input: unknown): Promise<SubmitContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const { name, email, phone, company, topic, job, message } = parsed.data;
  const result = await createContact({
    name,
    email,
    phone: phone || undefined,
    message: buildContactMessage({
      topic,
      company: company || undefined,
      job: job || undefined,
      message,
    }),
  });
  return result.ok ? { ok: true } : { ok: false, reason: "failed" };
}
