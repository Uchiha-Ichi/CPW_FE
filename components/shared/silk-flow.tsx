// 3 đường cong mềm, lồng nhau như dải lụa/gợn sóng — trang trí nền toàn site (mounted ở
// app/(site)/[lang]/layout.tsx), chìm phía sau nội dung. Không dùng hình khối cụ thể (gem,
// hoa...) để tránh nhìn như hình vẽ tay.
export function SilkFlow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      fill="none"
    >
      <path
        d="M -50 700 C 280 600, 420 820, 760 680 S 1300 460, 1650 560"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.32"
        strokeLinecap="round"
      />
      <path
        d="M -50 760 C 320 840, 520 620, 860 760 S 1360 640, 1650 700"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.2"
        strokeLinecap="round"
      />
      <path
        d="M -50 630 C 260 540, 480 700, 820 580 S 1340 400, 1650 480"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.16"
        strokeLinecap="round"
      />
    </svg>
  );
}
