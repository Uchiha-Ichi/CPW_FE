"use client";

import { Link2, Share2 } from "lucide-react";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ShareBarLabels = {
  heading: string;
  copy: string;
  copied: string;
  copyFailed: string;
  share: string;
  shareFailed: string;
};

// Khả năng chia sẻ của trình duyệt không đổi khi trang đang mở: không có gì để đăng ký theo dõi.
const subscribeNever = () => () => {};
const readCanShare = () => typeof navigator.share === "function";
// Server không biết trình duyệt có navigator.share: coi như không để HTML server và lần hydrate đầu giống nhau.
const readOnServer = () => false;

export function ShareBar({
  url,
  title,
  labels,
}: {
  url: string;
  title: string;
  labels: ShareBarLabels;
}) {
  // Lần hydrate đầu luôn false (readOnServer); sau đó React đọc lại bằng readCanShare nên nút "Chia sẻ" mới hiện.
  const canShare = useSyncExternalStore(subscribeNever, readCanShare, readOnServer);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(labels.copied);
    } catch {
      // Clipboard bị chặn hoặc trang không ở ngữ cảnh an toàn.
      toast.error(labels.copyFailed);
    }
  }

  async function shareNative() {
    try {
      await navigator.share({ title, url });
    } catch (error) {
      // Người dùng đóng hộp chia sẻ: không phải lỗi, im lặng.
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(labels.shareFailed);
    }
  }

  return (
    <div
      role="group"
      aria-label={labels.heading}
      className="flex flex-wrap items-center gap-x-4 gap-y-3"
    >
      <p className="text-sm font-semibold text-muted-foreground">{labels.heading}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="lg" onClick={copyLink}>
          <Link2 aria-hidden="true" />
          {labels.copy}
        </Button>
        {canShare && (
          <Button type="button" variant="outline" size="lg" onClick={shareNative}>
            <Share2 aria-hidden="true" />
            {labels.share}
          </Button>
        )}
      </div>
    </div>
  );
}
