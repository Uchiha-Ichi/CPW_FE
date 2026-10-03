// Mô tả việc làm là chữ thuần; tách đoạn theo dòng trống để render từng <p>.
export function splitParagraphs(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}
