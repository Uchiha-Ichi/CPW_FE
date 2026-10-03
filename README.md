# Viễn Chí Bảo — website (cpw_fe)

Next.js 16 (App Router), React 19, Tailwind 4, shadcn/ui. Đa ngôn ngữ `vi` và `en` bằng `next-intl` (đường dẫn `/vi/...`, `/en/...`).

## Chạy

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # biên dịch và kiểm kiểu
pnpm test       # vitest
pnpm lint       # eslint (không tự sửa)
pnpm gen:api-types   # sinh lib/api/schema.d.ts từ Swagger của backend đang chạy
```

## Biến môi trường

- `NEXT_PUBLIC_API_URL`: địa chỉ API backend (mặc định `http://localhost:8000/api`).
- `NEXT_PUBLIC_SITE_URL`: địa chỉ gốc của site, dùng cho canonical, hreflang, sitemap (mặc định `http://localhost:3000`).

## Cấu trúc

- `app/(site)/[lang]/`: các trang public. `app/admin/`: trang quản trị. `app/api/admin/`: đăng nhập và proxy tới backend.
- `components/ui/`: chỉ file shadcn tạo bằng CLI. `components/blocks/`: các loại block của trang chủ và Về chúng tôi.
- `lib/api/`: mọi lời gọi tới backend. `lib/seo/`: metadata, JSON-LD, sitemap. `messages/`: chữ cố định theo ngôn ngữ.
- Quy tắc làm việc chi tiết: `CLAUDE.md` và `AGENTS.md`.
