"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./network.module.css";
import { cn } from "@/lib/utils";
import { MAP_HEIGHT, MAP_WIDTH, type Pin } from "@/lib/blocks/network-geometry";

export function NetworkMap({
  pins,
  routes,
  legend,
  mapCredit,
}: {
  pins: Pin[];
  routes: { code: string; d: string }[];
  legend: string;
  mapCredit: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <div className={styles.networkStage}>
        <div className={styles.networkMapBg} />
        <div className={styles.networkVignette} />
        <svg
          className={styles.networkSvg}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {routes.map((r) => (
            <g key={r.code}>
              <path className={styles.routeGlow} d={r.d} />
              <path id={`vcb-route-${r.code}`} className={styles.route} d={r.d} />
            </g>
          ))}

          {routes.map((r, i) => (
            <text
              key={`plane-${r.code}`}
              className={styles.plane}
              textAnchor="middle"
              dominantBaseline="central"
            >
              ✈
              <animateMotion
                dur={`${8.5 + (i % 3) * 2}s`}
                begin={`${-i * 2.7}s`}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath href={`#vcb-route-${r.code}`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.07;0.87;1"
                dur={`${8.5 + (i % 3) * 2}s`}
                begin={`${-i * 2.7}s`}
                repeatCount="indefinite"
              />
            </text>
          ))}
        </svg>

        {pins.map((pin) => (
          <div
            key={pin.code}
            className={cn(styles.networkPin, active === pin.code && styles.isActive)}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            tabIndex={0}
            aria-label={pin.city ? `${pin.name} · ${pin.city}` : pin.name}
            onMouseEnter={() => setActive(pin.code)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(pin.code)}
            onBlur={() => setActive(null)}
          >
            <span className={styles.flagIcon} aria-hidden="true">
              <Image
                src={`https://flagcdn.com/w40/${pin.code}.png`}
                alt=""
                width={24}
                height={16}
                unoptimized
                className="h-full w-full object-cover"
              />
            </span>
          </div>
        ))}

        <div className={styles.networkLegend}>
          <i /> {legend}
        </div>
      </div>

      <div className={styles.networkCountries}>
        {pins.map((pin) => (
          <div
            key={pin.code}
            className={cn(styles.networkCountry, active === pin.code && styles.isActive)}
            onMouseEnter={() => setActive(pin.code)}
            onMouseLeave={() => setActive(null)}
          >
            <span className={styles.cardFlag} aria-hidden="true">
              <Image
                src={`https://flagcdn.com/w40/${pin.code}.png`}
                alt=""
                width={30}
                height={20}
                unoptimized
                className="rounded-sm shadow-sm"
              />
            </span>
            <b>{pin.name}</b>
            <small>
              {pin.city}
              {pin.note && ` · ${pin.note}`}
            </small>
          </div>
        ))}
      </div>

      <p className={styles.mapCredit}>
        {mapCredit}{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/3.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          (license)
        </a>
      </p>
    </>
  );
}
