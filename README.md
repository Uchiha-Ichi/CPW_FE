# Viễn Chí Bảo — website (cpw_fe)

Next.js 16 (App Router), React 19, Tailwind 4, shadcn/ui. Đa ngôn ngữ `vi` và `en` bằng `next-intl` (đường dẫn `/vi/...`, `/en/...`).

## Chạy

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # biên dịch và kiểm kiểu
pnpm lint       # eslint (không tự sửa)
```

Không có test tự động: xác nhận thay đổi bằng `pnpm build` và kiểm tay trên trình duyệt.

## Biến môi trường

- `API_URL` (chỉ phía server): địa chỉ API backend, ví dụ `http://localhost:8000/api`. Bắt buộc, thiếu thì dừng. Không có tiền tố `NEXT_PUBLIC_` nên không lộ ra trình duyệt: trình duyệt không gọi thẳng backend.
- `NEXT_PUBLIC_SITE_URL`: địa chỉ gốc của site, dùng cho canonical, hreflang, sitemap, ví dụ `http://localhost:3000`. Bắt buộc, thiếu thì dừng.
- `FORWARDED_IP_SECRET` (tùy chọn, chỉ phía server): khoá chung với `cpw_be` (cùng tên biến) để backend đếm giới hạn tần suất theo IP thật của người dùng khi login, gửi form liên hệ và nộp hồ sơ.

## Cấu trúc

- `app/(site)/[lang]/`: các trang public. `app/admin/`: trang quản trị. `app/api/admin/`: đăng nhập và proxy tới backend.
- `components/ui/`: chỉ file shadcn tạo bằng CLI. `components/blocks/`: các loại block của trang chủ và Về chúng tôi.
- `lib/api/`: mọi lời gọi tới backend. `lib/seo/`: metadata, JSON-LD, sitemap. `messages/`: chữ cố định theo ngôn ngữ.
- Quy tắc làm việc chi tiết: `CLAUDE.md` và `AGENTS.md`.
