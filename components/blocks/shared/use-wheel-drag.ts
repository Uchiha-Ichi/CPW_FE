import { useEffect } from "react";
import type { UseEmblaCarouselType } from "embla-carousel-react";

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;

// Trackpad không có sự kiện "nhấc ngón tay": im lặng chừng này ms thì coi như cử chỉ đã xong và thả chuột giả lập.
const IDLE_MS = 120;
// Một số chuột báo deltaX theo dòng (deltaMode 1) thay vì pixel; đổi ra pixel theo cỡ một dòng.
const LINE_HEIGHT_PX = 16;

// Embla chỉ hỗ trợ kéo chuột và vuốt cảm ứng. Cử chỉ cuộn ngang bằng trackpad hoặc chuột (deltaX) được đổi thành một
// lần kéo giả lập, để dải chạy theo ngón tay (có quán tính) mà không cần bấm nút hay nhấn giữ chuột.
export function useWheelDrag(api: EmblaApi | undefined): void {
  useEffect(() => {
    const root = api?.rootNode();
    if (!api || !root) return;
    const doc = root.ownerDocument;
    let dragging = false;
    let x = 0;
    let y = 0;
    let idleTimer: number | undefined;

    const dispatchMouse = (type: "mousedown" | "mousemove" | "mouseup", target: EventTarget) =>
      target.dispatchEvent(
        new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window,
          button: 0,
          buttons: type === "mouseup" ? 0 : 1,
          clientX: x,
          clientY: y,
        }),
      );

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      dispatchMouse("mouseup", doc);
    };

    const onWheel = (e: WheelEvent) => {
      // Cuộn dọc: để trang tự cuộn.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      // Chặn cả thao tác "vuốt để quay lại trang trước" của trình duyệt và cuộn mượt của trang.
      e.preventDefault();
      e.stopPropagation();
      if (!dragging) {
        dragging = true;
        x = e.clientX;
        y = e.clientY;
        dispatchMouse("mousedown", root);
      }
      // deltaX dương = cuộn sang phải: con trỏ giả lập đi sang trái, kéo dải sang trái để lộ phần bên phải.
      x -= e.deltaMode === 1 ? e.deltaX * LINE_HEIGHT_PX : e.deltaX;
      dispatchMouse("mousemove", doc);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(endDrag, IDLE_MS);
    };

    // passive: false: preventDefault ở trên chỉ có tác dụng với listener không passive.
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      root.removeEventListener("wheel", onWheel);
      window.clearTimeout(idleTimer);
      endDrag();
    };
  }, [api]);
}
