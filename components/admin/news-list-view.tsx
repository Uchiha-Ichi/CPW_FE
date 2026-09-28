"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/lib/admin/news-types";

export function NewsListView() {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/proxy/news");
    if (res.ok) setArticles(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(article: NewsArticle) {
    if (!confirm(`Xóa bài viết "${article.title}"?`)) return;
    await fetch(`/api/admin/proxy/news/${article._id}`, { method: "DELETE" });
    load();
  }

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tin tức</h1>
        <Button onClick={() => router.push("/admin/news/new")}>Viết bài mới</Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Bài viết</th>
              <th className="p-3 text-left font-medium">Chuyên mục</th>
              <th className="p-3 text-left font-medium">Ngày đăng</th>
              <th className="p-3 text-left font-medium">Trạng thái</th>
              <th className="p-3 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a._id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="font-medium">{a.title}</div>
                  {a.summary && (
                    <div className="text-xs text-muted-foreground">{a.summary}</div>
                  )}
                </td>
                <td className="p-3">{a.category}</td>
                <td className="p-3">{a.date}</td>
                <td className="p-3">{a.status}</td>
                <td className="space-x-2 p-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/news/${a._id}`)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => remove(a)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Chưa có bài viết nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
