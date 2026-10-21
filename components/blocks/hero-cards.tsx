import { cn } from "@/lib/utils";
import { flipKeyframes } from "@/lib/blocks/flip-keyframes";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { ImageSlot } from "./shared/image-slot";
import styles from "./hero-cards.module.css";

interface HeroCardsProps {
  images: string[];
}

export function HeroCards({ images }: HeroCardsProps) {
  const validImages = images.filter(Boolean);
  const rawN = validImages.length;
  const n = Math.min(rawN, 4);

  if (n === 1) {
    return (
      <div aria-hidden="true" className={styles.photo}>
        <div className={styles.card}>
          <div className={styles.face}>
            <CloudinaryMedia
              src={validImages[0]}
              alt=""
              sizes="min(40vw, 540px)"
              variant="loop"
              className="h-full w-full object-cover"
              imageProps={{ preload: true, fetchPriority: "high" }}
            />
          </div>
          <div className={cn(styles.face, styles.back)} />
        </div>
      </div>
    );
  }

  const effectiveN = n === 0 ? 2 : n;
  const prefix = `hc${effectiveN}-`;
  const { start, css } = flipKeyframes(effectiveN, prefix);

  return (
    <div aria-hidden="true" className={styles.photo}>
      <style>{css}</style>
      {Array.from({ length: effectiveN }).map((_, i) => (
        <div
          key={i}
          className={styles.card}
          style={{
            transform: start[i],
            animation: `${prefix}${i} ${effectiveN * 4.5}s ease-in-out infinite`,
          }}
        >
          <div className={styles.face}>
            {n === 0 ? (
              <ImageSlot slot="hero.cards.image" className="h-full w-full" />
            ) : (
              <CloudinaryMedia
                src={validImages[i]}
                alt=""
                sizes="min(40vw, 540px)"
                variant="loop"
                className="h-full w-full object-cover"
                imageProps={i === 0 ? { preload: true, fetchPriority: "high" } : undefined}
              />
            )}
          </div>
          <div className={cn(styles.face, styles.back)} />
        </div>
      ))}
    </div>
  );
}
