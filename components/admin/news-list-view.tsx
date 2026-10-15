"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminNotice } from "@/components/admin/ui/admin-notice";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminTable } from "@/components/admin/ui/admin-table";
import { StatusChip } from "@/components/admin/ui/status-chip";
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
    <AdminPage>
      <AdminPageHeader
        title="Tin tức"
        actions={
          <AdminButton onClick={() => router.push("/admin/news/new")}>Viết bài mới</AdminButton>
        }
      />

      {sessionExpired && (
        <AdminNotice tone="danger" className="mb-4">
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
        </AdminNotice>
      )}

      {errors.length > 0 && (
        <AdminNotice tone="danger" className="mb-4">
          <ul className="list-disc space-y-1 pl-5">
            {errors.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </AdminNotice>
      )}

      <AdminTable>
        <thead>
          <tr>
            <th>Bài viết</th>
            <th>Chuyên mục</th>
            <th>Ngày đăng</th>
            <th>Trạng thái</th>
            <th className="admin-act">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={5} className="admin-empty">
                Đang tải…
              </td>
            </tr>
          )}
          {!loading &&
            posts.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="font-medium">{p.vi.title}</div>
                  {p.vi.excerpt && (
                    <div className="text-xs text-muted-foreground">{p.vi.excerpt}</div>
                  )}
                </td>
                <td data-label="Chuyên mục">{POST_CATEGORY_LABELS[p.category]}</td>
                <td data-label="Ngày đăng">
                  {p.status === "published" ? formatDate(p.publishedAt) : "—"}
                </td>
                <td data-label="Trạng thái">
                  <StatusChip tone={p.status === "published" ? "ok" : "warn"}>
                    {POST_STATUS_LABELS[p.status]}
                  </StatusChip>
                  {p.en?.title && (
                    <span className="ml-2 rounded border border-[color:var(--admin-line)] px-1.5 text-xs font-medium text-muted-foreground">
                      EN
                    </span>
                  )}
                </td>
                <td className="admin-act">
                  <div className="inline-flex justify-end gap-1 max-[760px]:flex-wrap">
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      disabled={busyId === p._id}
                      onClick={() => router.push(`/admin/news/${p._id}`)}
                    >
                      Sửa
                    </AdminButton>
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      disabled={busyId === p._id}
                      onClick={() => toggleStatus(p)}
                    >
                      {p.status === "published" ? "Gỡ đăng" : "Đăng"}
                    </AdminButton>
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      danger
                      disabled={busyId === p._id}
                      onClick={() => remove(p)}
                    >
                      Xóa
                    </AdminButton>
                  </div>
                </td>
              </tr>
            ))}
          {!loading && posts.length === 0 && (
            <tr>
              <td colSpan={5} className="admin-empty">
                Chưa có bài viết nào.
              </td>
            </tr>
          )}
        </tbody>
      </AdminTable>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <AdminButton
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => {
              setLoading(true);
              setPage((p) => Math.max(1, p - 1));
            }}
          >
            Trước
          </AdminButton>
          <span>
            Trang {page} / {totalPages}
          </span>
          <AdminButton
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => {
              setLoading(true);
              setPage((p) => p + 1);
            }}
          >
            Sau
          </AdminButton>
        </div>
      )}
    </AdminPage>
  );
}
