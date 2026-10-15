"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { APPLY_ANCHOR_ID } from "@/lib/jobs/constants";

// Mỗi lần bấm "Ứng tuyển" tạo object mới (không lưu chuỗi trần) để bấm lại đúng vị trí cũ
// vẫn kích hoạt form, kể cả khi người dùng đã tự đổi dropdown sang vị trí khác.
type ApplyRequest = { title: string };

type ApplyContextValue = {
  request: ApplyRequest | null;
  requestApply: (title: string) => void;
};

const ApplyContext = createContext<ApplyContextValue | null>(null);

// Cầu nối giữa danh sách vị trí và form ứng tuyển (2 nhánh client tách nhau bởi server component).
export function ApplyProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<ApplyRequest | null>(null);

  const requestApply = useCallback((title: string) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(APPLY_ANCHOR_ID)
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    setRequest({ title });
  }, []);

  const value = useMemo(() => ({ request, requestApply }), [request, requestApply]);
  return <ApplyContext value={value}>{children}</ApplyContext>;
}

export function useApply(): ApplyContextValue {
  const value = useContext(ApplyContext);
  if (!value) throw new Error("useApply phải nằm trong ApplyProvider");
  return value;
}
