// Lặp danh sách cho tới khi có ít nhất `min` phần tử, để dải chạy không bị hở khi ít mục.
export function repeatToMin<T>(items: T[], min: number): T[] {
  if (items.length === 0) return [];
  const times = Math.max(1, Math.ceil(min / items.length));
  return Array.from({ length: items.length * times }, (_, i) => items[i % items.length]);
}
