// Theme của site: chỉ có "dark" (mặc định) và "light", lưu ở localStorage. Không dùng thư viện vì thẻ <script>
// do next-themes tự chèn trong component bị React 19 cảnh báo; script này nằm trực tiếp trong layout (server component).
export const THEME_STORAGE_KEY = "vcb-theme";

// Chạy trong <head> trước khi trình duyệt vẽ trang để người chọn giao diện sáng không bị nháy tối.
// CSS coi "không có data-theme" là dark nên script lỗi (localStorage bị chặn) vẫn ra đúng theme mặc định.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)})==="light"?"light":"dark";var d=document.documentElement;d.setAttribute("data-theme",t);d.style.colorScheme=t}catch(e){}})()`;
