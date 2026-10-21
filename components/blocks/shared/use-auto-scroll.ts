import { useEffect, useRef, useState, useSyncExternalStore, type FocusEvent } from "react";
import type { UseEmblaCarouselType } from "embla-carousel-react";

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;

// Mỗi lần tự đổi cách nhau chừng này. Dùng chung cho mọi khối tự chạy.
export const AUTO_STEP_MS = 3000;
// Lần đổi đầu tiên sau khi khối vừa vào màn hình (hoặc tab vừa hiện lại) đến sớm hơn: đợi trọn AUTO_STEP_MS thì người xem
// tưởng khối đứng yên (đo được ~3,1 giây từ lúc vào màn hình đến lúc chuyển động).
export const AUTO_ENTRY_MS = 1000;
// `duration` mặc định của embla-carousel 8.6.0 (defaultOptions trong embla-carousel.esm.js): trả lại hoạt ảnh khi
// người dùng tắt reduced-motion lúc trang đang mở.
const EMBLA_DEFAULT_DURATION = 25;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

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

// Tự lướt mỗi 3 giây. Dừng khi: rê chuột trên vùng carousel, focus bàn phím nằm trong vùng, tab ẩn, vùng ra khỏi
// màn hình, hoặc prefers-reduced-motion. canMove = Embla đang thật sự lặp vòng; không lặp được thì không tự lướt.
export function useAutoScroll(api: EmblaApi | undefined, canMove: boolean) {
  const [hovered, setHovered] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [inView, setInView] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, readOnServer);
  const hidden = useSyncExternalStore(subscribeVisibility, readHidden, readOnServer);

  // reduced-motion: chuyển thẻ tức thì như product-showcase-block.tsx; đổi cài đặt lúc trang đang mở cũng theo.
  useEffect(() => {
    if (!api) return;
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    if (media.matches) api.reInit({ duration: 0 });
    const onChange = () => api.reInit({ duration: media.matches ? 0 : EMBLA_DEFAULT_DURATION });
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(api.rootNode());
    return () => observer.disconnect();
  }, [api]);

  const paused = hovered || focusInside || hidden || !inView || reducedMotion;
  const running = canMove && !paused;

  // Lần chạy đầu tiên, và lần chạy lại sau khi rời màn hình (ra khỏi khung hoặc tab ẩn), mở đầu bằng độ trễ ngắn
  // AUTO_ENTRY_MS. Rê chuột hay focus chỉ tạm dừng, không tính: rời chuột xong vẫn đếm đủ AUTO_STEP_MS để không lướt
  // ngay sau thao tác. Cờ chỉ hạ xuống khi lần đổi đầu thật sự xảy ra (không phải lúc đặt hẹn giờ).
  const entryPending = useRef(true);
  const offScreen = !inView || hidden;
  useEffect(() => {
    if (offScreen) entryPending.current = true;
  }, [offScreen]);

  useEffect(() => {
    if (!api || !running) return;
    const firstDelay = entryPending.current ? AUTO_ENTRY_MS : AUTO_STEP_MS;
    // Chỉ chạy khi Embla đang lặp vòng thật, nên scrollNext ở thẻ cuối tự sang thẻ đầu.
    let timer: number | undefined;
    const schedule = (delay: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(step, delay);
    };
    const step = () => {
      entryPending.current = false;
      api.scrollNext();
      schedule(AUTO_STEP_MS);
    };
    // Mỗi lần đổi thẻ (kéo, vuốt, bấm thẻ phụ, phím, hoặc chính lần tự lướt) và mỗi lần chạm/nhấn chuột vào dải:
    // đếm lại 3 giây từ đầu, để không lướt ngay sau thao tác của người dùng.
    const restart = () => schedule(AUTO_STEP_MS);
    schedule(firstDelay);
    api.on("select", restart).on("pointerDown", restart);
    return () => {
      window.clearTimeout(timer);
      api.off("select", restart).off("pointerDown", restart);
    };
  }, [api, running]);

  return {
    regionProps: {
      onPointerEnter: () => setHovered(true),
      onPointerLeave: () => setHovered(false),
      // onFocus/onBlur của React là focusin/focusout. Chỉ tính focus bàn phím (:focus-visible): bấm chuột vào một
      // thẻ (Chrome giữ focus trên liên kết) thì vẫn tự lướt tiếp sau khi rời chuột, khớp việc đếm lại 3 giây ở trên.
      onFocus: (e: FocusEvent<HTMLElement>) => {
        if (e.target instanceof Element && e.target.matches(":focus-visible")) setFocusInside(true);
      },
      onBlur: (e: FocusEvent<HTMLElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocusInside(false);
      },
    },
  };
}
