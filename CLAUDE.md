@AGENTS.md

# cpw_fe — quy tắc dự án (frontend)

Next.js 16 (App Router), React 19, Tailwind 4, shadcn. Đây là repo git riêng — phần frontend của website Viễn Chí Bảo. Phần backend là repo riêng `cpw_be` (NestJS 11, Mongoose 9, JWT, Cloudinary), nằm cạnh repo này. Tài liệu/spec/plan/mockup nằm ở `../DOCS/` (thư mục `VCB_WEB` chứa cả 3, **không phải repo git** — các đường dẫn `../DOCS/...` chỉ dùng được khi 3 thư mục còn nằm cạnh nhau trên cùng máy).

Next 16 khác bản bạn biết: đọc `AGENTS.md` và `node_modules/next/dist/docs/` trước khi viết code Next.

## Tài liệu liên quan

- `../DOCS/reference/MAP.md`: chỉ mục 2 mockup (`admin.slim.html`, `website.slim.html`), **đọc trước khi chỉnh giao diện**. Mục 4 là "Quy tắc giao diện đã chốt". Đọc theo số dòng MAP.md chỉ tới; đọc rộng hơn khi cần để khỏi đoán.
- `../DOCS/superpowers/specs/` + `../DOCS/superpowers/plans/`: mỗi việc có 1 cặp spec+plan cùng tên ngày, viết cho người chưa biết gì về repo (đủ đường dẫn, chữ ký hàm, lệnh chạy). Làm việc nào thì chỉ đọc cặp của việc đó.
- `../DOCS/NEXTJS-SEO-GUIDELINES.md`: nguyên tắc cấu trúc App Router + SEO (dùng lại được cho mọi project Next.js, không chỉ VCB) — đọc trước khi đụng route, `generateMetadata`, sitemap, robots, OG/icon.

## Hướng sản phẩm đã chốt (2026-09-30)

Spec gốc: `../DOCS/superpowers/specs/2026-09-30-vcb-api-page-blocks-design.md`, plan: `../DOCS/superpowers/plans/2026-09-30-vcb-api-page-blocks.md`.

- Website ghép từ **block dựng sẵn**, mỗi loại block là 1 component có hiệu ứng riêng. Admin chỉ chọn block, điền nội dung (có giới hạn ký tự/số thẻ/số ảnh), kéo thả sắp xếp. Admin không chỉnh layout hay hiệu ứng.
- **Trang chủ và Về chúng tôi** do admin tự ghép từ block. **Tuyển dụng, Liên hệ, Tin tức** là trang cố định design sẵn, admin chỉ sửa nội dung (phần này hoãn, chưa làm).
- Mỗi trang là 1 document `{pageKey, pub, draft, version}` ở backend, draft/publish theo cả trang, khoá lạc quan bằng `version`. Block là `{id, type, data}`, `data` được kiểm bằng **registry trong code của backend** (`cpw_be/src/pages/blocks/registry.ts`); **thêm loại block mới = thêm 1 mục registry (backend) + 1 component FE tương ứng**, không thêm field mà backend chưa có.
- Chữ trong block có `vi` (bắt buộc) và `en` (tuỳ chọn), backend giải sẵn ngôn ngữ cho API public. Chữ nhấn dùng `*...*`, render bằng React — **không nhận/dùng HTML**.
- **Mạng lưới quốc gia + bản đồ (`network`) là collection riêng, giữ nguyên.** Ảnh là dữ liệu nằm trong block; sản phẩm là collection `products` riêng (tên và mô tả `vi`/`en` dạng field phẳng, ảnh, thứ tự, trạng thái Hiển thị / Sắp ra mắt / Ẩn) và khối `product-list` đọc từ đó. **Đội ngũ đã bỏ.** Tin tức dùng module `posts` (HTML đã sanitize ở backend, `vi` bắt buộc, `en` tuỳ chọn); tuyển dụng dùng `jobs`.

## Quy tắc làm việc chung

1. **Không bịa.** Field, endpoint, hành vi phải có nguồn trong spec/plan/mockup/kiểu đã cài. Không chắc thì hỏi, không đoán "mặc định hợp lý". Không đoán API thư viện (Next, React, next-intl...) từ bộ nhớ: đọc kiểu/tài liệu của đúng phiên bản đã cài trong `node_modules/`.
2. **Sau khi sửa file, đọc lại** để xác nhận đúng thật. Chỉ nói "xong" khi có output lệnh hoặc code làm bằng chứng.
3. **Git:** mặc định KHÔNG chạy lệnh làm thay đổi repo (`add`, `commit`, `checkout`, `restore`, `reset`, `stash`, `clean`, `rm`, `mv`, `merge`); chỉ `git status`, `diff`, `log`, `show`. Hoàng tự commit, trừ khi Hoàng nói rõ khác trong chat. Working tree thường có thay đổi chưa commit của việc khác: không đụng vào.
4. **Cấm chạy:** `pnpm lint`/`pnpm format` kèm `--fix` (sửa lan ra ngoài phạm vi — `pnpm lint` không `--fix` thì được chạy bình thường), `pnpm start*`, và mọi thứ nối Cloudinary/backend thật ngoài localhost dev.
5. **Đúng phạm vi.** Diff của 1 task phải khớp mô tả task. Không thêm abstraction, không "tiện tay dọn". File ngoài danh sách được phép của plan: dừng và hỏi. Hai plan chạy cùng lúc mà đụng cùng file: dừng và hỏi.
6. **Ngôn ngữ trao đổi:** Hoàng dùng tiếng Việt và thích danh sách đánh số. Tài liệu, thông báo lỗi, commit của dự án: tiếng Việt cho nội dung hướng người dùng, tên mã/kỹ thuật giữ tiếng Anh.
7. **Mức quy trình theo cỡ việc (Hoàng chốt 2026-10-14).** Việc nhỏ và vừa (sửa một trang hoặc component, thêm vài file, đổi bố cục): đưa Hoàng một spec/thiết kế ngắn trong chat, Hoàng duyệt rồi làm thẳng trong phiên chính; kiểm bằng `tsc --noEmit`, `pnpm lint` (không `--fix`), `pnpm build` một lần, và đo/chụp trên trình duyệt khi là UI. **Không** dựng spec + plan nhiều vòng, không giao subagent implementer/reviewer cho việc cỡ này (quá chậm và tốn token). Chỉ việc lớn (nhiều tính năng độc lập, đổi cả backend lẫn frontend, đổi kiến trúc, hoặc Hoàng yêu cầu rõ) mới dùng đủ các công đoạn: spec và plan viết vào `../DOCS/superpowers/`, thực thi bằng `/superpowers:subagent-driven-development` (mỗi task một subagent mới, có reviewer gate đúng spec rồi chất lượng code; quy tắc 3, 4, 5 ghi vào prompt giao việc). Không chắc việc thuộc cỡ nào thì hỏi Hoàng một câu.

## Cấu trúc và luồng dữ liệu

- Không có `app/layout.tsx` ở root (Next 16, `experimental.globalNotFound: true` trong `next.config.ts`). Mỗi nhánh tự định nghĩa `<html>/<body>` riêng: `app/(site)/[lang]/layout.tsx` bọc mọi trang public (header, footer, Lenis, theme, next-intl) theo tiền tố ngôn ngữ `/vi`/`/en`; `app/admin/layout.tsx` + `app/admin/(protected)/layout.tsx` cho admin (layout `(protected)` tự đọc cookie `admin_token` qua `cookies()`, `redirect`/`notFound` trước khi render nếu không hợp lệ). `app/global-not-found.tsx`/`app/global-error.tsx` là fallback thật ở root khi không khớp route nào hoặc root tự lỗi.
- Phiên đăng nhập admin do **server Next** giữ trong cookie của chính FE (`admin_token`, `admin_rt`: `httpOnly`, `SameSite=Lax`, `lib/admin/auth/cookies.ts`). Backend không đặt và không đọc cookie nào: `POST /auth/login` và `/auth/refresh` trả token trong body JSON (`lib/admin/auth/refresh.ts` `readTokenResponse`), mọi route bảo vệ chỉ nhận header `Authorization: Bearer`. Route ghi dữ liệu dưới `/api/admin` phải gọi `isSameOriginRequest` (`lib/admin/auth/same-origin.ts`, chống CSRF giống Server Action của Next).
- Admin: đăng nhập qua `app/api/admin/(auth)/login/route.ts`; mọi gọi API admin từ trình duyệt đi qua `/api/admin/proxy/*` (`app/api/admin/proxy/[...path]/route.ts`), route này đọc cookie, tự refresh token khi hết hạn, rồi chuyển thành header `Authorization: Bearer`. Proxy chuyển body bằng `arrayBuffer()` để upload ảnh không bị hỏng: đừng đổi lại thành `.text()`. Ghi thành công (`POST`/`PUT`/`PATCH`/`DELETE`) còn tự `revalidateTag()` theo `lib/api/tags.ts` để site public thấy ngay, không đợi hết cache.
- Code admin chia theo mảng, cùng tên thư mục ở `lib/admin/<mảng>/` và `components/admin/<mảng>/`: `news` (route `admin/news`), `resources` (`admin/jobs`, `network`, `products`), `site-settings` (`admin/settings`), `page-editor` (`admin/pages` và trang xem trước). `lib/admin/auth/` là phiên đăng nhập (cookie, refresh, kiểm quyền, kiểm Origin), đi cùng các route `app/api/admin/(auth)/`. `components/admin/shell/` là khung admin (sidebar, menu), `components/admin/ui/` là component giao diện dùng chung. `lib/admin/api-error.ts` là xử lý lỗi chung cho mọi API admin; `lib/admin/request.ts` là hàm gọi proxy dùng chung (`createAdminRequest`, mỗi mảng truyền hàm đổi lỗi riêng).
- Trang public đọc API qua `lib/api/client.ts` (`apiGet<T>(path, { revalidate?, tags? })`): không bao giờ throw, trả `{ status: "ok" | "not-found" | "error", data? }`; nơi gọi tự quyết hiển thị gì khi lỗi (thường coi như rỗng) — không được làm sập trang khi backend tắt. Mỗi collection một file nhỏ trong `lib/api/` (`posts.ts`, `jobs.ts`, `pages.ts`...).
- Upload ảnh/video admin đi qua proxy (`POST /uploads`): bài viết dùng `uploadPostImage` (`lib/admin/news/api.ts`), trang block dùng `uploadPageImage`/`uploadPageVideo` (`lib/admin/page-editor/api.ts`).

## Quy tắc code

1. **Không dùng `dangerouslySetInnerHTML` cho nội dung đến từ API.** Chữ nhấn `*...*` render bằng React (không qua HTML).
2. Thêm loại block mới = một component FE tương ứng với một mục trong registry của backend (`cpw_be/src/pages/blocks/registry.ts`). Không thêm field mà backend chưa có.
3. Tiếng Việt có dấu: `line-height` tiêu đề ≥ 1.1, `letter-spacing` không âm mạnh hơn khoảng -0.015em. Marquee, Lenis và mọi animation phải tôn trọng `prefers-reduced-motion`. Ảnh chưa có thì dùng khung nét đứt có chú thích (`ImagePlaceholder`), không dùng ảnh stock.
4. **Ảnh Cloudinary dùng `next/image` với một loader Cloudinary dùng chung** (một hàm trong `lib/` nhận `src`, `width`, `quality` và trả URL có `f_auto,q_auto,w_<width>`; trả nguyên `src` nếu không phải URL Cloudinary). Lý do: ảnh admin upload là bản gốc tới 10MB và block lưu nguyên URL gốc, nên không dán link thô vào `<img>`; và loader cho trình duyệt tải thẳng từ Cloudinary nên không cần khai báo host. **Không** thêm `res.cloudinary.com` vào `remotePatterns`. (`next.config.ts` hiện chỉ cho `next/image` mặc định đúng host `flagcdn.com`: chỉ áp dụng cho `next/image` không dùng loader.) Loader đó là `cloudinaryLoader` (`lib/images/cloudinary-loader.ts`), dùng qua `CloudinaryImage` (`components/blocks/shared/cloudinary-image.tsx`): đừng tự đổi sang cách khai báo host.
5. Component UI dùng shadcn trong `components/ui/`; thêm bằng CLI shadcn, không viết tay lại component đã có.
6. Không đọc hay in nội dung `.env`, `.env.local`.

## Quy tắc SEO

- Trước khi đụng route, `generateMetadata`, sitemap, robots, OG/icon: đọc `../DOCS/NEXTJS-SEO-GUIDELINES.md`.
- `generateMetadata` luôn gọi `buildMetadata()` (`lib/seo/metadata.ts`), không viết tay canonical/OG/hreflang riêng từng trang.
- Trang có filter/sort qua query string (ví dụ `/news?category=`, `/careers?department=`) → `noindex: true` và canonical tự trỏ kèm đúng param đó (không trỏ URL sạch). Trang chỉ có `page` (không filter) vẫn `index, follow` như bình thường — đừng noindex nhầm cả hai.
- JSON-LD qua `lib/seo/json-ld.ts` + component `JsonLd`; không tự thêm `aggregateRating` khi chưa có review thật thu thập được.
- Trang chi tiết gọi `notFound()` (`news/[slug]`, `careers/[slug]`) không được có `loading.tsx` nào bọc ngoài, nếu không HTTP trả 200 (soft-404) thay vì 404. Vì vậy skeleton của trang danh sách nằm trong route group `news/(list)/`, `careers/(list)/` (sửa 2026-10-23): đừng chuyển `loading.tsx` ra lại `news/` hay `careers/`. `/news?page=` vượt tổng số trang vẫn là soft-404, chấp nhận để giữ skeleton danh sách.
- Tiêu đề `news/[slug]`/`careers/[slug]` dùng thẳng `post.title`/`job.title` + hậu tố `" | Viễn Chí Bảo"`. Hoàng chốt không xử lý (2026-10-23), chỉ dặn người viết giữ tiêu đề dưới khoảng 60 ký tự: đừng tự thêm cắt tiêu đề hay `absoluteTitle`.

## Lệnh

- `pnpm dev`, `pnpm build` (kiểm tra biên dịch và kiểu), `pnpm lint` (eslint, không có `--fix` nên chạy được). Không có test tự động (vitest đã bỏ, không còn file test nào) — xác nhận thay đổi bằng `pnpm build` và kiểm tay trên trình duyệt.
- Chạy `pnpm build` sau khi sửa để xác nhận; chỉ nói "xong" khi có output.
