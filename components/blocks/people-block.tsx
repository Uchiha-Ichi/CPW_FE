import { CloudinaryMedia } from "./shared/cloudinary-media";
import { ImageSlot } from "./shared/image-slot";
import { Reveal } from "./shared/reveal";
import { RichTitle } from "./shared/rich-title";
import { list, str } from "@/lib/blocks/read";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

// Block loại "people": vài gương mặt đại diện công ty. 1–2 người: thẻ ngang (chân dung bên trái, chữ bên phải) cho
// ảnh to và chữ rộng; từ 3 người: thẻ dọc xếp lưới. Chỉ họ tên là bắt buộc; chưa có ảnh thì hiện khung giữ chỗ
// ghi quy cách ảnh chân dung.
export function PeopleBlock({ data }: BlockProps) {
  const title = str(data.title);
  const people = list(data.items)
    .map((p) => ({ image: str(p.image), name: str(p.name), role: str(p.role), bio: str(p.bio) }))
    .filter((p): p is { image: string | undefined; name: string; role: string | undefined; bio: string | undefined } =>
      Boolean(p.name),
    );
  if (!title || people.length === 0) return null;

  const wide = people.length <= 2;

  return (
    <section className="border-b border-border py-12 md:py-16">
      <div className="mx-auto max-w-[1240px] px-4">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-bold leading-[1.12] md:text-5xl">
            <RichTitle text={title} />
          </h2>
        </Reveal>

        <ul
          className={cn(
            "mt-8 grid gap-x-12 gap-y-14 md:mt-10",
            wide
              ? people.length === 1
                ? "max-w-3xl"
                : "md:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))] lg:gap-x-8",
          )}
          style={{ "--n": people.length } as React.CSSProperties}
        >
          {people.map((p, i) => (
            <li key={p.name + i}>
              <Reveal
                delay={i * 120}
                className={cn("grid gap-6", wide && "sm:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] sm:items-end")}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-br-[28px] rounded-tl-[28px] border border-border bg-card">
                  {p.image ? (
                    <CloudinaryMedia
                      src={p.image}
                      alt={p.name}
                      sizes={wide ? "(min-width: 768px) 27vw, 80vw" : "(min-width: 1024px) 25vw, 50vw"}
                      variant="loop"
                      className="object-cover object-[50%_20%]"
                    />
                  ) : (
                    <ImageSlot
                      slot="people.items.image"
                      label={p.name}
                      dense={!wide}
                      className="h-full rounded-br-[28px] rounded-tl-[28px] border-0"
                    />
                  )}
                </div>

                <div className={cn(wide && "sm:border-l sm:border-primary/50 sm:pb-1 sm:pl-6")}>
                  <h3 className={cn("leading-[1.15]", wide ? "text-3xl md:text-4xl" : "text-2xl")}>{p.name}</h3>
                  {p.role && (
                    <p className="mt-3 text-sm font-semibold uppercase leading-snug tracking-widest text-primary">
                      {p.role}
                    </p>
                  )}
                  {p.bio && <p className="mt-5 text-base leading-relaxed text-muted-foreground">{p.bio}</p>}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
