"use client";

import { Children, isValidElement, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AUTO_ENTRY_MS, AUTO_STEP_MS } from "./shared/use-auto-scroll";
import styles from "./product-list-block.module.css";

// Từ cỡ này các thẻ nằm một hàng và thẻ đang chọn mở rộng (khớp @media trong product-list-block.module.css).
// Nhỏ hơn: xếp dọc, không mở rộng nên không cần tự đổi.
const WIDE_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function mediaStore(query: string) {
  return {
    subscribe(onChange: () => void) {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    get: () => window.matchMedia(query).matches,
  };
}

const wideStore = mediaStore(WIDE_QUERY);
const reducedMotionStore = mediaStore(REDUCED_MOTION_QUERY);

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
const readHidden = () => document.visibilityState === "hidden";
// Server không biết các giá trị này: coi như "không" để HTML server và lần hydrate đầu giống nhau.
const readOnServer = () => false;

// Hàng thẻ sản phẩm: một thẻ "đang chọn" (mở rộng bằng CSS qua data-active), tự chuyển sang thẻ kế mỗi AUTO_STEP_MS.
// Dừng khi: rê chuột trên hàng, hàng ra khỏi màn hình, tab ẩn, prefers-reduced-motion, hoặc màn hình hẹp (xếp dọc).
// Rê chuột vào thẻ (hoặc chạm trên màn hình cảm ứng) thì chọn thẻ đó. Thẻ không bấm được nên không có điểm dừng bàn phím:
// mở rộng chỉ là hiệu ứng, nội dung các thẻ luôn đầy đủ trong trang.
export function ProductListRow({ children }: { children: ReactNode }) {
  const cards = Children.toArray(children);
  const count = cards.length;

  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(true);
  const rootRef = useRef<HTMLUListElement>(null);
  const wide = useSyncExternalStore(wideStore.subscribe, wideStore.get, readOnServer);
  const reducedMotion = useSyncExternalStore(reducedMotionStore.subscribe, reducedMotionStore.get, readOnServer);
  const hidden = useSyncExternalStore(subscribeVisibility, readHidden, readOnServer);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const running = wide && count > 1 && !reducedMotion && !hovered && !hidden && inView;

  // Lần đổi đầu tiên sau khi hàng vào màn hình (hoặc tab hiện lại) đến sớm hơn (AUTO_ENTRY_MS), cùng quy ước với
  // use-auto-scroll.ts. Rê chuột chỉ tạm dừng, không tính: rời chuột xong vẫn đếm đủ AUTO_STEP_MS.
  const entryPending = useRef(true);
  const offScreen = !inView || hidden;
  useEffect(() => {
    if (offScreen) entryPending.current = true;
  }, [offScreen]);

  // Hẹn giờ một lần cho mỗi lần đổi thẻ (đổi tay cũng đếm lại từ đầu vì `active` nằm trong deps).
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => {
        entryPending.current = false;
        setActive((a) => (a + 1) % count);
      },
      entryPending.current ? AUTO_ENTRY_MS : AUTO_STEP_MS,
    );
    return () => window.clearTimeout(timer);
  }, [running, active, count]);

  const current = Math.min(active, count - 1);

  return (
    <ul
      ref={rootRef}
      className={styles.row}
      role="list"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {cards.map((card, i) => (
        <li
          key={isValidElement(card) && card.key != null ? card.key : i}
          className={styles.cell}
          data-active={i === current ? "true" : undefined}
          onPointerEnter={() => setActive(i)}
        >
          {card}
        </li>
      ))}
    </ul>
  );
}
