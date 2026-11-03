"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminLogo } from "@/components/admin/ui/admin-logo";
import { AdminNotice } from "@/components/admin/ui/admin-notice";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/admin/auth/api";

const ERROR_ID = "login-error";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const message = await login(email, password);
    setLoading(false);
    if (message) {
      setError(message);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="grid min-h-dvh grid-cols-[minmax(0,1fr)] min-[761px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Panel thương hiệu: chỉ trang trí (logo đã có ở thanh trên điện thoại), nên ẩn khỏi trình đọc màn hình. */}
      <div
        aria-hidden="true"
        className="admin-brand-panel relative hidden items-center justify-center overflow-hidden p-12 min-[761px]:flex"
      >
        <AdminLogo
          variant="mark"
          className="pointer-events-none absolute -bottom-24 -right-24 w-[520px] opacity-[0.09]"
        />
        <AdminLogo variant="full" className="relative w-[min(340px,70%)]" />
      </div>

      <main className="flex flex-col items-center justify-center bg-background px-6 py-10">
        <AdminLogo variant="full" className="mb-8 w-40 min-[761px]:hidden" />
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <h1 className="text-[clamp(1.7rem,3vw,2.1rem)]">Đăng nhập quản trị</h1>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <AdminInput
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? ERROR_ID : undefined}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <AdminInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? ERROR_ID : undefined}
                className="pr-12"
                required
              />
              {/* Nhãn mô tả hành động sắp làm nên không dùng thêm aria-pressed (tránh đọc lặp). */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-controls="password"
                className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none"
              >
                {showPassword ? (
                  <EyeOff className="size-[18px]" aria-hidden />
                ) : (
                  <Eye className="size-[18px]" aria-hidden />
                )}
              </button>
            </div>
          </div>
          {error && (
            <AdminNotice tone="danger" id={ERROR_ID}>
              {error}
            </AdminNotice>
          )}
          <AdminButton
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full"
          >
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </AdminButton>
        </form>
      </main>
    </div>
  );
}
