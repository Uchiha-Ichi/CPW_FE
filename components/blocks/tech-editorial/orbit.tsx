"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import styles from "./tech-editorial.module.css";

export type OrbitSat = {
  key: "ai" | "ip" | "global";
  title: string;
  text?: string;
  chips: { t: string; flag?: string }[];
};

// Vệ tinh theo khoá cố định (D21: thứ tự, icon, màu là bố cục, không phải nội dung). Index k quyết định vòng
// (RR[k]), góc (k × 120°), độ trễ nhấn (k × 3 s) và mốc của nhịp mở màn. Path SVG chép từ mockup BẢN 65 dòng 849–851.
const SAT_KEYS = ["ai", "ip", "global"] as const;
const SAT_ICONS: Record<OrbitSat["key"], { color: string; paths: ReactNode }> = {
  ai: {
    color: "#0066FF",
    paths: (
      <>
        <path d="M11 3l1.9 5.4L18.3 10l-5.4 1.9L11 17.3l-1.9-5.4L3.7 10l5.4-1.6z" />
        <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
      </>
    ),
  },
  ip: {
    color: "#0AA5C9",
    paths: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M10 9.5l5 2.5-5 2.5z" />
      </>
    ),
  },
  global: {
    color: "#3B5BDB",
    paths: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c3.2 3.4 3.2 14.6 0 18" />
        <path d="M12 3c-3.2 3.4-3.2 14.6 0 18" />
      </>
    ),
  },
};

// Bán kính vòng, vị trí chấm và thời gian vệt sáng chạy của 3 vòng (mockup dòng 853).
const RR = ["24.5cqw", "31cqw", "37.5cqw"];
const DOTS = [
  [30, 160, 250],
  [80, 200, 320],
  [10, 130, 230],
];
const TR = [16, 22, 28];

// Chuỗi cảnh lặp 15 s (mockup dòng 1046–1086): mở màn, vệ tinh đầu bay về giữa, rồi lần lượt trang chi tiết d0/d1/d2.
const CUES = [
  [0, "intro"],
  [4.2, "focus"],
  [5.1, "d0"],
  [8.4, "d1"],
  [11.7, "d2"],
] as const;
const LOOP = 15;
// Chỉ chạy khi ≥ 35% khung nằm trong màn hình.
const MIN_RATIO = 0.35;

// Logo công ty ở tâm: public/logo.png là 1788×1787 với lề trong suốt rất rộng, cắt lề bằng CSS như
// components/admin/ui/admin-logo.tsx (chép hằng số, không import component admin). Bản "full" (hoa + chữ):
// bbox x 253–1534, y 317–1425 → 1281×1108.
const LOGO_SRC_W = 1788;
const LOGO_SRC_H = 1787;
const LOGO_BBOX = { l: 253, t: 317, w: 1281, h: 1108 } as const;

function SatIcon({ satKey }: { satKey: OrbitSat["key"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {SAT_ICONS[satKey].paths}
    </svg>
  );
}

// Quỹ đạo logo: client component vì chuỗi cảnh chạy bằng setInterval 100 ms (chỉ khi khung trong màn hình).
// Server render trạng thái mở màn (data-st="intro"); mọi thay đổi sau đó ghi thẳng vào DOM qua ref như initOrbit
// của mockup (data-st, data-run, class "on" của trang chi tiết), nên không có state và không render lại.
export function Orbit({ sats, label }: { sats: OrbitSat[]; label?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const grpRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);

  // Vị trí theo khoá, không theo thứ tự mảng; chỉ còn vệ tinh có mặt (thiếu thì trang chi tiết của nó bị bỏ qua).
  const present = SAT_KEYS.flatMap((key, k) => {
    const sat = sats.find((s) => s.key === key);
    return sat ? [{ sat, k }] : [];
  });
  // Chữ ký tập khoá có mặt: effect tra panel/vệ tinh một lần mỗi lần chạy, nên phải chạy lại khi tập đổi dù số lượng giữ nguyên.
  const presentKey = present.map((p) => p.sat.key).join(",");

  useEffect(() => {
    const el = rootRef.current;
    const grp = grpRef.current;
    const fly = flyRef.current;
    if (!el || !grp || !fly) return;
    // Reduced-motion: đứng yên ở trạng thái mở màn (CSS tắt animation, ẩn trang chi tiết và icon bay), không interval.
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const panels = Array.from(el.querySelectorAll<HTMLElement>("[data-orb-panel]"));
    // Không có vệ tinh nào thì không có gì để trình diễn: giữ nguyên vòng + logo, chỉ tạm dừng animation khi ra khỏi màn hình.
    const cues = panels.length > 0 ? CUES.slice(0, 2 + panels.length) : [];

    let t = 0;
    let cur = -1;
    let run = false;
    let hov = false;
    let last = performance.now();
    let timer = 0;
    let flyTimer = 0;
    let raf = 0;

    const showPanel = (k: number) =>
      panels.forEach((p, i) => {
        p.classList.toggle(styles.on, i === k);
        p.setAttribute("aria-hidden", i === k ? "false" : "true");
      });

    // Bản sao vệ tinh đầu tiên có mặt bay từ vị trí hiện tại về giữa, thu/phóng cho vừa ô icon của trang chi tiết đầu.
    const doFly = () => {
      const s0 = grp.querySelector<HTMLElement>("[data-orb-sat]");
      const ic = panels[0]?.querySelector<HTMLElement>("[data-orb-icon]");
      if (!s0 || !ic) return;
      const fr = el.getBoundingClientRect();
      const r = s0.getBoundingClientRect();
      const w = r.width;
      fly.replaceChildren(s0.cloneNode(true));
      fly.style.transition = "none";
      fly.style.width = `${w}px`;
      fly.style.height = `${w}px`;
      fly.style.left = `${r.left + w / 2 - fr.left}px`;
      fly.style.top = `${r.top + r.height / 2 - fr.top}px`;
      fly.style.opacity = "1";
      fly.style.transform = "translate(-50%,-50%) scale(1)";
      void fly.offsetWidth;
      fly.style.transition = "";
      fly.style.left = `${fr.width / 2}px`;
      fly.style.top = `${ic.offsetTop + ic.offsetHeight / 2}px`;
      fly.style.transform = `translate(-50%,-50%) scale(${(ic.offsetWidth / w).toFixed(3)})`;
      window.clearTimeout(flyTimer);
      flyTimer = window.setTimeout(() => {
        fly.style.opacity = "0";
      }, 820);
    };

    const apply = (name: string) => {
      if (name === "focus") {
        el.dataset.st = "focus";
        doFly();
      } else if (name[0] === "d") {
        el.dataset.st = "detail";
        showPanel(Number(name[1]));
      } else {
        el.dataset.st = "intro";
        showPanel(-1);
      }
    };

    // Lần đầu vào màn hình: chạy lại phần mở màn từ đầu (tắt transition một nhịp để không nhấp nháy).
    const restart = () => {
      el.classList.add(styles.nt);
      el.dataset.st = "wait";
      void el.offsetWidth;
      el.dataset.st = "intro";
      showPanel(-1);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => el.classList.remove(styles.nt));
      t = 0;
      cur = 0;
    };

    const tick = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      if (hov) return;
      t += dt;
      t %= LOOP;
      let ci = 0;
      cues.forEach((c, i) => {
        if (t >= c[0]) ci = i;
      });
      if (ci !== cur) {
        cur = ci;
        apply(cues[ci][1]);
      }
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };

    const onEnter = () => {
      hov = true;
    };
    const onLeave = () => {
      hov = false;
    };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    // Chưa vào màn hình thì mọi animation CSS đứng yên (data-run="0"), vào rồi mới chạy.
    el.dataset.run = "0";
    const observer = new IntersectionObserver(
      (entries) => {
        // Lấy entry cuối: ([entry]) chập chờn khi cuộn nhanh. isIntersecting đổi từ pixel đầu tiên nên tự kiểm ngưỡng.
        const entry = entries[entries.length - 1];
        if (entry.isIntersecting && entry.intersectionRatio >= MIN_RATIO) {
          if (run) return;
          run = true;
          el.dataset.run = "1";
          last = performance.now();
          if (cur === -1) restart();
          if (cues.length > 0) timer = window.setInterval(tick, 100);
        } else {
          run = false;
          el.dataset.run = "0";
          stop();
        }
      },
      { threshold: MIN_RATIO },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      stop();
      window.clearTimeout(flyTimer);
      cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [presentKey]);

  return (
    <div
      ref={rootRef}
      className={styles.orb}
      data-st="intro"
      {...(label ? { role: "group", "aria-label": label } : {})}
    >
      <div ref={grpRef} className={styles.orbGrp}>
        {RR.map((r, k) => (
          <div key={k} className={styles.orbRing} style={{ "--R": r, "--i": k } as CSSProperties}>
            <i
              className={styles.orbTr}
              style={
                {
                  "--tr": `${TR[k]}s`,
                  animationDirection: k === 1 ? "reverse" : "normal",
                } as CSSProperties
              }
            />
            {DOTS[k].map((a) => (
              <b key={a} className={styles.orbDot} style={{ "--a": `${a}deg` } as CSSProperties} />
            ))}
          </div>
        ))}
        <div className={styles.orbHub}>
          <span className={styles.orbLogo} style={{ aspectRatio: `${LOGO_BBOX.w} / ${LOGO_BBOX.h}` }}>
            <Image
              src="/logo.png"
              alt=""
              width={LOGO_SRC_W}
              height={LOGO_SRC_H}
              sizes="110px"
              className="absolute h-auto max-w-none"
              style={{
                width: `${(LOGO_SRC_W / LOGO_BBOX.w) * 100}%`,
                left: `${(-LOGO_BBOX.l / LOGO_BBOX.w) * 100}%`,
                top: `${(-LOGO_BBOX.t / LOGO_BBOX.h) * 100}%`,
              }}
            />
          </span>
        </div>
        {present.map(({ sat, k }) => (
          <div
            key={sat.key}
            className={styles.orbArm}
            style={{ "--a0": `${k * 120}deg`, "--i": k } as CSSProperties}
          >
            <div className={styles.orbPos} style={{ "--R": RR[k] } as CSSProperties}>
              <div className={styles.orbCard} style={{ "--a0": `${k * 120}deg` } as CSSProperties}>
                <div className={styles.orbEnt}>
                  <div
                    className={styles.orbIn}
                    data-orb-sat=""
                    style={{ "--c": SAT_ICONS[sat.key].color, animationDelay: `${k * 3}s` } as CSSProperties}
                  >
                    <SatIcon satKey={sat.key} />
                    <span>{sat.title}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {present.map(({ sat }) => (
        <div key={sat.key} className={styles.orbDet} data-orb-panel="" aria-hidden="true">
          <span
            className={styles.detIc}
            data-orb-icon=""
            style={{ "--c": SAT_ICONS[sat.key].color } as CSSProperties}
          >
            <SatIcon satKey={sat.key} />
          </span>
          <h3 className={styles.detTitle}>{sat.title}</h3>
          {sat.text && <p className={styles.detText}>{sat.text}</p>}
          {sat.chips.length > 0 && (
            <div className={styles.detChips}>
              {sat.chips.map((c, j) => (
                <span key={j} className={styles.detChip} style={{ "--j": j } as CSSProperties}>
                  {c.flag && (
                    <span className={styles.fl} aria-hidden="true">
                      <Image
                        src={`https://flagcdn.com/w40/${c.flag}.png`}
                        alt=""
                        width={40}
                        height={30}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </span>
                  )}
                  {c.t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
      <div ref={flyRef} className={styles.orbFly} aria-hidden="true" />
    </div>
  );
}
