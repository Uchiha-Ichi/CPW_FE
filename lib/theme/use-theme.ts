import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "./init-script";

export type Theme = "light" | "dark";

const DEFAULT_THEME: Theme = "dark";
const CHANGE_EVENT = "vcb-theme-change";

// Giữ giá trị trong bộ nhớ để đổi theme vẫn chạy khi localStorage bị chặn (chế độ riêng tư).
let memoryTheme: Theme | null = null;

function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : DEFAULT_THEME;
  } catch {
    return memoryTheme ?? DEFAULT_THEME;
  }
}

function applyTheme(theme: Theme) {
  // Tắt transition trong lúc đổi để các phần tử không chạy hiệu ứng màu lệch nhau (giống disableTransitionOnChange).
  const style = document.createElement("style");
  style.appendChild(document.createTextNode("*,*::before,*::after{transition:none!important}"));
  document.head.appendChild(style);
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  window.getComputedStyle(document.body); // ép tính lại style trước khi gỡ thẻ tắt transition
  setTimeout(() => style.remove(), 1);
}

function subscribe(onChange: () => void) {
  // Đổi theme ở tab khác: cập nhật cả html của tab này.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== THEME_STORAGE_KEY) return;
    applyTheme(readTheme());
    onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

// Server và lần render hydrate đầu luôn là "dark" rồi React tự chuyển sang giá trị thật ở client, nên HTML không lệch.
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME);

  // Trang 404/500 thật được Next dựng lại hoàn toàn ở client (HTML server chỉ là khung rỗng), nên script trong
  // <head> của layout không chạy và <html> thiếu data-theme. Áp lại theme đã lưu trước khi trình duyệt vẽ.
  // Đọc readTheme() chứ không dùng `theme`: lúc hydrate `theme` tạm là "dark" và sẽ ghi đè nhầm theme sáng.
  useLayoutEffect(() => {
    const stored = readTheme();
    if ((document.documentElement.getAttribute("data-theme") ?? DEFAULT_THEME) !== stored) applyTheme(stored);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    memoryTheme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage bị chặn: chỉ giữ trong bộ nhớ.
    }
    applyTheme(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { theme, setTheme };
}
