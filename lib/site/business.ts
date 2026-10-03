// Thông tin liên hệ (điện thoại, email, địa chỉ, mạng xã hội, tên, MST) nằm trong DB, admin sửa ở /admin/settings.
// Ở đây chỉ còn logo, giữ cứng theo quyết định ngày 2026-10-02.
// Đường dẫn tương đối (file tự host tại public/logo.png) thay vì hotlink vienchibao.com:
// tránh phụ thuộc domain ngoài cho LCP và tránh vỡ khi domain đó đổi/ngừng phục vụ ảnh.
// JSON-LD cần URL tuyệt đối nên các nơi dùng cho schema.org tự nối với siteUrl.
export const LOGO_URL = "/logo.png";
