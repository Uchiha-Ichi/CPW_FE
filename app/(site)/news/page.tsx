import { Card } from "@/components/ui/card";
import { ImagePlaceholder } from "@/components/content-block/image-placeholder";
import { getPublicNewsArticles } from "@/lib/api/news";

export default async function NewsPage() {
  const articles = await getPublicNewsArticles();

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Góc nhìn & câu chuyện</h1>
        <p className="mt-4 text-muted-foreground">
          Những câu chuyện về chất liệu, cảm hứng và hành trình tạo nên trang
          sức Viễn Chí Bảo.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Card key={article.title} className="overflow-hidden">
            {article.cover ? (
              <img
                src={article.cover}
                alt={article.title}
                className="h-40 w-full object-cover"
              />
            ) : (
              <ImagePlaceholder label={article.title} className="h-40" />
            )}
            <div className="p-4">
              <p className="text-xs text-muted-foreground">
                {article.category} · {article.date}
              </p>
              <h2 className="mt-1 font-medium leading-tight">
                {article.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {article.summary}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
