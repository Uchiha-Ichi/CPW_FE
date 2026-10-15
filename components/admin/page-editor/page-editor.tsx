"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { BlockList } from "@/components/admin/page-editor/block-list";
import { BlockPicker } from "@/components/admin/page-editor/block-picker";
import { ErrorList } from "@/components/admin/page-editor/error-list";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminNotice } from "@/components/admin/ui/admin-notice";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { cn } from "@/lib/utils";
import {
  discardDraft,
  getAdminPage,
  getBlockTypes,
  publishPage,
  saveDraft,
} from "@/lib/admin/page-editor/api";
import { isConflict } from "@/lib/admin/page-editor/errors";
import {
  cleanBlocks,
  createBlock,
  editorReducer,
  isDirty,
  pageStatus,
  STATUS_LABELS,
  type Path,
} from "@/lib/admin/page-editor/state";
import type { BlockDef, BlockTypesResponse } from "@/lib/admin/page-editor/types";
import { errorMessages, isSessionExpired } from "@/lib/admin/post-errors";

interface LoadError {
  key: string;
  messages: string[];
  expired: boolean;
}

export function PageEditor() {
  const [meta, setMeta] = useState<BlockTypesResponse | null>(null);
  const [metaError, setMetaError] = useState<string[] | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editor, dispatch] = useReducer(editorReducer, null);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [conflict, setConflict] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const activePage = selectedKey ?? meta?.pages[0]?.key ?? null;
  const loadedKey = editor?.pageKey ?? null;
  const failedKey = loadError?.key ?? null;
  const ready = editor !== null && editor.pageKey === activePage;
  const dirty = editor ? isDirty(editor) : false;

  const defs = useMemo(
    () => new Map<string, BlockDef>((meta?.blockTypes ?? []).map((d) => [d.type, d])),
    [meta],
  );

  // Registry và danh sách trang: tải một lần.
  useEffect(() => {
    let cancelled = false;
    getBlockTypes()
      .then((response) => {
        if (!cancelled) setMeta(response);
      })
      .catch((err: unknown) => {
        if (!cancelled) setMetaError(errorMessages(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Nội dung của trang đang chọn: tải khi chưa có (đổi tab, hoặc sau "Tải lại trang này").
  useEffect(() => {
    if (!activePage || loadedKey === activePage || failedKey === activePage) return;
    let cancelled = false;
    getAdminPage(activePage)
      .then((view) => {
        if (cancelled) return;
        dispatch({ type: "load", view });
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError({
          key: activePage,
          messages: errorMessages(err),
          expired: isSessionExpired(err),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [activePage, loadedKey, failedKey]);

  // Cảnh báo khi rời trang lúc còn thay đổi chưa lưu (spec D9).
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function clearMessages() {
    setErrors([]);
    setConflict(false);
    setSessionExpired(false);
    setNotice(null);
  }

  async function run(task: () => Promise<void>) {
    setBusy(true);
    clearMessages();
    try {
      await task();
    } catch (err) {
      setErrors(errorMessages(err));
      setConflict(isConflict(err));
      setSessionExpired(isSessionExpired(err));
    } finally {
      setBusy(false);
    }
  }

  function selectPage(key: string) {
    if (key === activePage) return;
    if (
      dirty &&
      !confirm("Bạn có thay đổi chưa lưu. Chuyển trang sẽ làm mất các thay đổi này. Tiếp tục?")
    ) {
      return;
    }
    clearMessages();
    setSelectedKey(key);
  }

  function save() {
    if (!editor) return;
    void run(async () => {
      const view = await saveDraft(editor.pageKey, editor.version, cleanBlocks(editor.blocks));
      dispatch({ type: "load", view });
      setNotice("Đã lưu bản nháp.");
    });
  }

  // Spec D7: có thay đổi chưa lưu thì lưu nháp trước, rồi đăng bằng version mới.
  function publish() {
    if (!editor) return;
    void run(async () => {
      let version = editor.version;
      if (isDirty(editor)) {
        const saved = await saveDraft(editor.pageKey, version, cleanBlocks(editor.blocks));
        dispatch({ type: "load", view: saved });
        version = saved.version;
      }
      const view = await publishPage(editor.pageKey, version);
      dispatch({ type: "load", view });
      setNotice("Đã đăng trang. Website sẽ hiện nội dung mới ngay.");
    });
  }

  function discard() {
    if (!editor) return;
    const warning = dirty
      ? "Bỏ bản nháp sẽ mất cả bản nháp đã lưu lẫn các thay đổi chưa lưu, và quay về bản đã đăng. Tiếp tục?"
      : "Bỏ bản nháp và quay về bản đã đăng?";
    if (!confirm(warning)) return;
    void run(async () => {
      const view = await discardDraft(editor.pageKey, editor.version);
      dispatch({ type: "load", view });
      setNotice("Đã bỏ bản nháp.");
    });
  }

  function preview() {
    if (!editor) return;
    // Mở tab ngay trong cú click: mở sau await sẽ bị chặn popup.
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setErrors([
        "Trình duyệt đã chặn cửa sổ mới. Hãy cho phép cửa sổ bật lên cho trang này rồi bấm lại.",
      ]);
      return;
    }
    tab.opener = null;
    void run(async () => {
      try {
        if (isDirty(editor)) {
          const view = await saveDraft(editor.pageKey, editor.version, cleanBlocks(editor.blocks));
          dispatch({ type: "load", view });
          setNotice("Đã lưu bản nháp.");
        } else {
          // Chỉ để proxy gia hạn token hết hạn (D12); kết quả bỏ đi, không đụng reducer.
          await getAdminPage(editor.pageKey);
        }
        tab.location.href = `/vi/preview/${encodeURIComponent(editor.pageKey)}`;
      } catch (err) {
        tab.close();
        throw err;
      }
    });
  }

  // Spec D8: 409 thì nạp lại từ server, không tự gộp.
  function reloadPage() {
    clearMessages();
    dispatch({ type: "reset" });
  }

  function addBlock(type: string) {
    const block = createBlock(type);
    dispatch({ type: "add", block });
    setOpenIds((prev) => new Set(prev).add(block.id));
  }

  function removeBlock(id: string) {
    if (!confirm("Xóa khối này khỏi trang?")) return;
    dispatch({ type: "remove", id });
  }

  function toggleBlock(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function changeBlock(id: string, path: Path, value: unknown) {
    dispatch({ type: "setValue", id, path, value });
  }

  if (metaError) {
    return (
      <AdminPage>
        <AdminPageHeader title="Nội dung trang" />
        <div className="space-y-3">
          <ErrorList messages={metaError} />
          <AdminButton variant="outline" onClick={() => window.location.reload()}>
            Tải lại
          </AdminButton>
        </div>
      </AdminPage>
    );
  }

  if (!meta) {
    return (
      <AdminPage>
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader title="Nội dung trang" />

      <div role="tablist" className="flex flex-wrap gap-1 border-b border-[color:var(--admin-line)]">
        {meta.pages.map((page) => (
          <button
            key={page.key}
            type="button"
            role="tab"
            aria-selected={activePage === page.key}
            disabled={busy}
            onClick={() => selectPage(page.key)}
            className={cn(
              "-mb-px min-h-11 border-b-2 px-3 py-2 text-sm transition-colors motion-reduce:transition-none",
              activePage === page.key
                ? "border-[color:var(--admin-brand-strong)] font-semibold text-[color:var(--admin-brand-ink)]"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {page.label}
          </button>
        ))}
      </div>

      {loadError && loadError.key === activePage ? (
        <div className="mt-4 space-y-3">
          <ErrorList messages={loadError.messages} />
          {loadError.expired && <LoginAgainLink />}
          <AdminButton variant="outline" onClick={() => setLoadError(null)}>
            Thử lại
          </AdminButton>
        </div>
      ) : !ready || !editor ? (
        <p className="mt-4 text-sm text-muted-foreground">Đang tải trang…</p>
      ) : (
        <>
          {/* Chỉ dính từ 761px: trên điện thoại các nút xuống ~3 dòng (cao ~170px) và che quá nhiều màn hình. */}
          <div className="sticky top-0 z-10 -mx-[var(--admin-gutter)] mt-2 flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--admin-line)] bg-background px-[var(--admin-gutter)] py-3 max-[760px]:static">
            <span className="text-sm text-muted-foreground">
              Trạng thái:{" "}
              <span className="font-medium text-foreground">
                {STATUS_LABELS[pageStatus(editor)]}
              </span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <AdminButton
                variant="outline"
                disabled={busy || editor.blocks.length === 0}
                onClick={preview}
              >
                Xem trước
              </AdminButton>
              <AdminButton variant="ghost" disabled={busy || !editor.hasDraft} onClick={discard}>
                Bỏ nháp
              </AdminButton>
              <AdminButton variant="outline" disabled={busy || !dirty} onClick={save}>
                Lưu nháp
              </AdminButton>
              <AdminButton disabled={busy || !(dirty || editor.hasDraft)} onClick={publish}>
                Đăng
              </AdminButton>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {notice && <AdminNotice tone="ok">{notice}</AdminNotice>}
            <ErrorList messages={errors} />
            {conflict && (
              <AdminButton variant="outline" onClick={reloadPage}>
                Tải lại trang này (bỏ thay đổi chưa lưu)
              </AdminButton>
            )}
            {sessionExpired && (
              <AdminNotice tone="danger">
                Nội dung của bạn vẫn còn trên trang này. <LoginAgainLink /> rồi quay lại đây bấm lưu
                lại.
              </AdminNotice>
            )}

            {editor.blocks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[color:var(--admin-field-border)] p-6 text-center text-sm text-muted-foreground">
                Trang này chưa có khối nào. Chọn loại khối bên dưới để bắt đầu.
              </p>
            ) : (
              <BlockList
                blocks={editor.blocks}
                defs={defs}
                openIds={openIds}
                disabled={busy}
                onToggle={toggleBlock}
                onMove={(from, to) => dispatch({ type: "move", from, to })}
                onRemove={removeBlock}
                onChange={changeBlock}
              />
            )}

            <BlockPicker
              blockTypes={meta.blockTypes}
              count={editor.blocks.length}
              max={meta.maxBlocksPerPage}
              disabled={busy}
              onAdd={addBlock}
            />
          </div>
        </>
      )}
    </AdminPage>
  );
}

function LoginAgainLink() {
  return (
    <a
      href="/admin/login"
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium underline"
    >
      Đăng nhập lại ở tab mới
    </a>
  );
}
