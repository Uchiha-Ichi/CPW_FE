"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  deletePost,
  getAdminPost,
  listAdminPosts,
  publishPost,
  unpublishPost,
} from "@/lib/admin/post-api";
import { ApiError, errorMessages, isSessionExpired } from "@/lib/admin/post-errors";
import { htmlIsEmpty } from "@/lib/admin/post-form";
import {
  POST_CATEGORY_LABELS,
  POST_STATUS_LABELS,
  type AdminPost,
} from "@/lib/admin/post-types";

const PAGE_SIZE = 20;

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("vi-VN");
}

export function NewsListView() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [sessionExpired, setSessionExpired] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listAdminPosts(page, PAGE_SIZE);
        if (cancelled) return;
        if (data.items.length === 0 && page > 1) {
          setPage((p) => p - 1); // trang vừa hết bài: lùi một trang, effect sẽ tải lại
          return;
        }
        setPosts(data.items);
        setTotalPages(Math.max(1, data.totalPages));
        setErrors([]);
      } catch (err) {
        if (cancelled) return;
        setErrors(errorMessages(err));
        if (isSessionExpired(err)) setSessionExpired(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  async function runAction(post: AdminPost, action: () => Promise<unknown>) {
    setBusyId(post._id);
    setErrors([]);
    try {
      await action();
      setLoading(true);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setErrors(errorMessages(err));
      if (isSessionExpired(err)) setSessionExpired(true);
    } finally {
      setBusyId(null);
    }
  }

  function toggleStatus(post: AdminPost) {
    if (post.status === "published") {
      void runAction(post, () => unpublishPost(post._id));
      return;
    }
    // Danh sách không có nội dung, nên kiểm tra bài đã có nội dung trước khi đăng.
    void runAction(post, async () => {
      const full = await getAdminPost(post._id);
      if (htmlIsEmpty(full.vi.content)) {
        throw new ApiError(400, [
          "Bài này chưa có nội dung. Hãy mở bài để nhập nội dung trước khi đăng.",
        ]);
      }
      await publishPost(post._id);
    });
  }

  function remove(post: AdminPost) {
    if (!confirm(`Xóa bài viết "${post.vi.title}"? Việc này không thể hoàn tác.`)) return;
    void runAction(post, () => deletePost(post._id));
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tin tức</h1>
        <Button onClick={() => router.push("/admin/news/new")}>Viết bài mới</Button>
      </div>

      {sessionExpired && (
        <div className="mt-3 rounded-md border border-destructive p-3 text-sm text-destructive">
          Phiên đăng nhập đã hết hạn.{" "}
          <a
            href="/admin/login"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            Đăng nhập lại ở tab mới
          </a>{" "}
          rồi tải lại trang này.
        </div>
      )}

      {errors.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-destructive">
          {errors.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      )}

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
            {loading && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading &&
              posts.map((p) => (
                <tr key={p._id} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="font-medium">{p.vi.title}</div>
                    {p.vi.excerpt && (
                      <div className="text-xs text-muted-foreground">{p.vi.excerpt}</div>
                    )}
                  </td>
                  <td className="p-3">{POST_CATEGORY_LABELS[p.category]}</td>
                  <td className="p-3">
                    {p.status === "published" ? formatDate(p.publishedAt) : "—"}
                  </td>
                  <td className="p-3">
                    {POST_STATUS_LABELS[p.status]}
                    {p.en?.title && (
                      <span className="ml-2 rounded border px-1 text-xs text-muted-foreground">
                        EN
                      </span>
                    )}
                  </td>
                  <td className="space-x-2 p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busyId === p._id}
                      onClick={() => router.push(`/admin/news/${p._id}`)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busyId === p._id}
                      onClick={() => toggleStatus(p)}
                    >
                      {p.status === "published" ? "Gỡ đăng" : "Đăng"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      disabled={busyId === p._id}
                      onClick={() => remove(p)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            {!loading && posts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Chưa có bài viết nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => {
              setLoading(true);
              setPage((p) => Math.max(1, p - 1));
            }}
          >
            Trước
          </Button>
          <span>
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => {
              setLoading(true);
              setPage((p) => p + 1);
            }}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
