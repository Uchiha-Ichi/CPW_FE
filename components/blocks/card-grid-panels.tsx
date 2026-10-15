"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { ImageSlot } from "./shared/image-slot";
import { AUTO_ENTRY_MS, AUTO_STEP_MS } from "./shared/use-auto-scroll";
import { cn } from "@/lib/utils";
import styles from "./card-grid-block.module.css";

// Kiểu khớp đúng kết quả str() của card-grid-block.tsx (undefined khi trống), chỉ t đã được lọc là có.
export interface CardGridItem {
  t: string;
  d: string | undefined;
  image: string | undefined;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
// Cùng ngưỡng với card-grid-block.module.css: từ đây panel nở theo chiều ngang, dưới đây xếp dọc.
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

const readReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const readHidden = () => document.visibilityState === "hidden";
// Server không biết hai giá trị này: coi như "không" để HTML server và lần hydrate đầu giống nhau.
const readOnServer = () => false;

// Các thẻ của khối "card-grid" (1 đến 4 thẻ). Đúng một thẻ "đang mở" (data-active): CSS nở thẻ đó ra (máy tính) hoặc
// phóng nó ra còn các thẻ kia thu bé lại (điện thoại). Cứ AUTO_STEP_MS thì sang thẻ kế tiếp, vòng về thẻ đầu sau thẻ cuối.
// Rê chuột / focus bàn phím / bấm vào thẻ nào thì thẻ đó thành thẻ đang mở. Lần render đầu (server) mở thẻ đầu.
export function CardGridPanels({ items }: { items: CardGridItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [inView, setInView] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, readOnServer);
  const hidden = useSyncExternalStore(subscribeVisibility, readHidden, readOnServer);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Dừng khi: chuột đang trên khối, focus bàn phím nằm trong khối, tab ẩn, khối ra khỏi màn hình, reduced-motion.
  const running = items.length > 1 && !pointerInside && !focusInside && inView && !hidden && !reducedMotion;

  // Lần chạy đầu tiên, và lần chạy lại sau khi rời màn hình (ra khỏi khung hoặc tab ẩn), mở đầu bằng độ trễ ngắn
  // AUTO_ENTRY_MS (xem use-auto-scroll.ts). Rê chuột hay focus chỉ tạm dừng, không tính. Cờ chỉ hạ xuống khi lần đổi đầu
  // thật sự xảy ra, nên StrictMode (effect chạy hai lần lúc mount ở dev) không làm mất nó.
  const entryPending = useRef(true);
  const offScreen = !inView || hidden;
  useEffect(() => {
    if (offScreen) entryPending.current = true;
  }, [offScreen]);

  // Mỗi lần đổi thẻ đang mở (tự đổi, rê chuột, bấm, phím) timer chạy lại từ đầu: không đổi thẻ ngay sau thao tác.
  useEffect(() => {
    if (!running) return;
    const delay = entryPending.current ? AUTO_ENTRY_MS : AUTO_STEP_MS;
    const timer = window.setTimeout(() => {
      entryPending.current = false;
      setActive((current) => (current + 1) % items.length);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [running, active, items.length]);

  return (
    <div
      ref={rootRef}
      className={styles.panels}
      // Chỉ chuột thật mới dừng vòng: chạm trên cảm ứng không để lại "hover" dính.
      onPointerEnter={(e) => e.pointerType === "mouse" && setPointerInside(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPointerInside(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocusInside(false);
      }}
    >
      {items.map((item, i) => (
        <article
          key={i}
          tabIndex={0}
          data-active={i === active ? "" : undefined}
          className={cn(styles.card, item.image && styles.hasImage)}
          // Rê chuột mở thẻ ngay chỉ ở bố cục nở ngang (từ 1024px). Dưới đó thẻ co giãn theo chiều dọc: mở thẻ khi chuột
          // vừa lướt qua làm các thẻ phía dưới xô lệch, chuột rơi sang thẻ khác rồi mở tiếp, nên chỉ mở khi bấm.
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse" && window.matchMedia(DESKTOP_QUERY).matches) setActive(i);
          }}
          onClick={() => setActive(i)}
          // Chỉ focus bàn phím (:focus-visible) mới dừng vòng: bấm chuột vào thẻ (focus không hiện vòng) thì vòng vẫn
          // chạy tiếp sau khi rời chuột.
          onFocus={(e) => {
            setActive(i);
            if (e.target.matches(":focus-visible")) setFocusInside(true);
          }}
        >
          {item.image && (
            <>
              <CloudinaryMedia
                src={item.image}
                alt=""
                sizes="(min-width: 1024px) 40vw, 100vw"
                variant="loop"
                className={styles.photo}
              />
              <span aria-hidden className={styles.scrim} />
            </>
          )}
          <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
          {!item.image && (
            <ImageSlot variant="chip" slot="card-grid.items.image" className="absolute right-4 top-4" />
          )}
          <div className={styles.body}>
            <h3 className={styles.title}>{item.t}</h3>
            <span aria-hidden className={styles.rule} />
            {item.d && <p className={styles.desc}>{item.d}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}
