import { NewsComposerView } from "@/components/admin/news-composer-view";

export default async function AdminNewsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NewsComposerView articleId={id} />;
}
