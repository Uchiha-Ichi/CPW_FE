// Sinh CSS keyframes và transform ban đầu cho hiệu ứng lật thẻ ảnh dạng vòng lặp (mockup dòng 733–765).
// n: số lá ảnh (2–4). prefix: tiền tố tên keyframes (ví dụ "hc2-", "t").
export function flipKeyframes(
  n: number,
  prefix: string,
  hold = 0.76
): { start: string[]; css: string } {
  const off = (j: number) => (j === 0 ? 0 : 1);
  const tf = (j: number, ang: number) => {
    const z = j === 0 ? 40 : j === 1 ? 0 : -(j - 1) * 6;
    return `translate3d(calc(var(--ox) * ${off(j)}), calc(var(--oy) * ${off(j)}), ${z}px) rotateY(${ang}deg)`;
  };

  const start: string[] = [];
  let css = '';

  for (let i = 0; i < n; i++) {
    let slot = i;
    let ang = i === 0 ? 0 : 180;
    start.push(tf(slot, ang));
    let frames = '';

    for (let st = 0; st < n; st++) {
      const t0 = ((st * 100) / n).toFixed(3);
      const t1 = (((st + hold) * 100) / n).toFixed(3);
      frames += `${t0}%, ${t1}% { transform: ${tf(slot, ang)}; }\n`;
      const next = (slot - 1 + n) % n;
      if (slot === 0 || slot === 1) ang += 180;
      slot = next;
    }

    frames += `100% { transform: ${tf(slot, ang)}; }`;
    css += `@keyframes ${prefix}${i} {\n${frames}\n}\n`;
  }

  return { start, css };
}
