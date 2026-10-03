import { Link } from "@/i18n/navigation";
import { POST_CATEGORIES, type PostCategory } from "@/lib/api/posts";
import { buildNewsQuery } from "@/lib/news/params";
import { cn } from "@/lib/utils";

export function CategoryFilter({
  active,
  label,
  labels,
}: {
  active?: PostCategory;
  label: string;
  labels: Record<PostCategory | "all", string>;
}) {
  const chip = (isActive: boolean) =>
    cn(
      "rounded-full border px-5 py-2.5 text-sm font-medium transition-colors",
      isActive
        ? "border-transparent bg-foreground text-background"
        : "border-border bg-background hover:bg-muted",
    );
  return (
    <nav aria-label={label} className="mx-auto flex max-w-[1240px] flex-wrap justify-center gap-2 px-4">
      <Link href="/news" aria-current={!active ? "page" : undefined} className={chip(!active)}>
        {labels.all}
      </Link>
      {POST_CATEGORIES.map((category) => (
        <Link
          key={category}
          href={`/news${buildNewsQuery({ category })}`}
          aria-current={active === category ? "page" : undefined}
          className={chip(active === category)}
        >
          {labels[category]}
        </Link>
      ))}
    </nav>
  );
}
