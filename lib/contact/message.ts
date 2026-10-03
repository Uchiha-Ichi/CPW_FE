import { TOPIC_LABELS_VI, type ContactTopic } from "./schema";

// Backend chỉ nhận name, email, phone, message (CreateContactDto): gộp chủ đề, công ty, vị trí vào đầu message.
export function buildContactMessage(values: {
  topic: ContactTopic;
  company?: string;
  job?: string;
  message: string;
}): string {
  const lines = [`Chủ đề: ${TOPIC_LABELS_VI[values.topic]}`];
  if (values.company) lines.push(`Công ty: ${values.company}`);
  if (values.job) lines.push(`Vị trí ứng tuyển: ${values.job}`);
  return `${lines.join("\n")}\n\n${values.message}`;
}
