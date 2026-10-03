@AGENTS.md

# cpw_fe — quy tắc riêng cho frontend

Đọc `../CLAUDE.md` trước (bản đồ dự án, quy tắc chung). Dưới đây chỉ là phần riêng của `cpw_fe`.

## Cấu trúc và luồng dữ liệu

- `app/layout.tsx` là root (font Inter + Fraunces, subsets `vietnamese` + `latin`). `app/(site)/layout.tsx` bọc mọi trang public bằng header, footer, Lenis, theme, lang. `app/admin/(protected)/layout.tsx` chặn truy cập nếu không có cookie `admin_token`.
- Admin: đăng nhập qua `app/api/admin/login/route.ts`; mọi gọi API admin từ trình duyệt đi qua `/api/admin/proxy/*` (`app/api/admin/proxy/[...path]/route.ts`), route này đọc cookie rồi chuyển thành header `Authorization: Bearer`. Proxy chuyển body bằng `arrayBuffer()` để upload ảnh không bị hỏng: đừng đổi lại thành `.text()`.
- Trang public đọc API qua `lib/api/client.ts` (`fetchPublicList`: lỗi thì trả `[]`, cache 60 giây), không được làm sập trang khi API tắt. Mỗi collection một file nhỏ trong `lib/api/`.
- `lib/api/schema.d.ts` do `pnpm gen:api-types` sinh từ Swagger của backend đang chạy (`http://localhost:8000/api/docs-json`). Không sửa tay. Sau khi backend đổi API thì sinh lại.
- Upload ảnh admin dùng `lib/admin/upload-image.ts` (`POST /uploads` qua proxy).

## Quy tắc code

1. **Không dùng `dangerouslySetInnerHTML` cho nội dung đến từ API.** Code cũ (`components/content-block/content-block.tsx`) còn dùng cho tiêu đề; phần FE của hướng block sẽ thay nó. Code mới render chữ nhấn `*...*` bằng React (không qua HTML).
2. Thêm loại block mới = một component FE tương ứng với một mục trong registry của backend (`cpw_be/src/pages/blocks/registry.ts`). Không thêm field mà backend chưa có.
3. Tiếng Việt có dấu: `line-height` tiêu đề ≥ 1.1, `letter-spacing` không âm mạnh hơn khoảng -0.015em. Marquee, Lenis và mọi animation phải tôn trọng `prefers-reduced-motion`. Ảnh chưa có thì dùng khung nét đứt có chú thích (`ImagePlaceholder`), không dùng ảnh stock.
4. **Ảnh Cloudinary dùng `next/image` với một loader Cloudinary dùng chung** (một hàm trong `lib/` nhận `src`, `width`, `quality` và trả URL có `f_auto,q_auto,w_<width>`; trả nguyên `src` nếu không phải URL Cloudinary). Lý do: ảnh admin upload là bản gốc tới 10MB và block lưu nguyên URL gốc, nên không dán link thô vào `<img>`; và loader cho trình duyệt tải thẳng từ Cloudinary nên không cần khai báo host. **Không** thêm `res.cloudinary.com` vào `remotePatterns`. (`next.config.ts` hiện chỉ cho `next/image` mặc định các host `images.unsplash.com`, `placehold.co`, `vienchibao.com`, `flagcdn.com`: chỉ áp dụng cho `next/image` không dùng loader.) Nếu chưa thấy file loader trong `lib/` thì đó là việc của phần FE của hướng block: đừng tự đổi sang cách khai báo host.
5. Component UI dùng shadcn trong `components/ui/`; thêm bằng CLI shadcn, không viết tay lại component đã có.
6. Không đọc hay in nội dung `.env`, `.env.local`.

## Lệnh

- `pnpm dev`, `pnpm build` (kiểm tra biên dịch và kiểu), `pnpm test` (vitest), `pnpm lint` (eslint, không có `--fix` nên chạy được).
- Chạy `pnpm build` sau khi sửa để xác nhận; chỉ nói "xong" khi có output.
