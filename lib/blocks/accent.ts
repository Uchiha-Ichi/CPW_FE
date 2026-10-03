export type AccentPart = { text: string; accent: boolean };

// Tách "chữ thường *chữ nhấn* chữ thường". Dấu * không khép cặp giữ nguyên là chữ.
// Không sinh HTML: kết quả được render bằng React nên mọi ký tự đều được escape.
export function splitAccent(input: string): AccentPart[] {
  const parts: AccentPart[] = [];
  const pattern = /\*([^*\n]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input)) !== null) {
    if (match.index > last) parts.push({ text: input.slice(last, match.index), accent: false });
    parts.push({ text: match[1], accent: true });
    last = match.index + match[0].length;
  }
  if (last < input.length) parts.push({ text: input.slice(last), accent: false });
  return parts;
}

export function stripAccent(input: string): string {
  return splitAccent(input)
    .map((part) => part.text)
    .join("");
}
