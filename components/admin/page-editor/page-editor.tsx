"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { BlockList } from "@/components/admin/page-editor/block-list";
import { BlockPicker } from "@/components/admin/page-editor/block-picker";
import { ErrorList } from "@/components/admin/page-editor/error-list";
import { Button } from "@/components/ui/button";
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
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Nội dung trang</h1>
        <div className="mt-4 space-y-3">
          <ErrorList messages={metaError} />
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tải lại
          </Button>
        </div>
      </div>
    );
  }

  if (!meta) {
    return <p className="p-6 text-sm text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Nội dung trang</h1>

      <div role="tablist" className="mt-4 flex gap-1 border-b">
        {meta.pages.map((page) => (
          <button
            key={page.key}
            type="button"
            role="tab"
            aria-selected={activePage === page.key}
            disabled={busy}
            onClick={() => selectPage(page.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              activePage === page.key
                ? "border-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {loadError && loadError.key === activePage ? (
        <div className="mt-4 space-y-3">
          <ErrorList messages={loadError.messages} />
          {loadError.expired && <LoginAgainLink />}
          <Button variant="outline" onClick={() => setLoadError(null)}>
            Thử lại
          </Button>
        </div>
      ) : !ready || !editor ? (
        <p className="mt-4 text-sm text-muted-foreground">Đang tải trang…</p>
      ) : (
        <>
          <div className="sticky top-0 z-20 -mx-6 mt-2 flex flex-wrap items-center justify-between gap-2 border-b bg-background px-6 py-3">
            <span className="text-sm text-muted-foreground">
              Trạng thái:{" "}
              <span className="font-medium text-foreground">
                {STATUS_LABELS[pageStatus(editor)]}
              </span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" disabled={busy || !editor.hasDraft} onClick={discard}>
                Bỏ nháp
              </Button>
              <Button variant="outline" disabled={busy || !dirty} onClick={save}>
                Lưu nháp
              </Button>
              <Button disabled={busy || !(dirty || editor.hasDraft)} onClick={publish}>
                Đăng
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {notice && (
              <p role="status" className="rounded-md border p-3 text-sm">
                {notice}
              </p>
            )}
            <ErrorList messages={errors} />
            {conflict && (
              <Button variant="outline" onClick={reloadPage}>
                Tải lại trang này (bỏ thay đổi chưa lưu)
              </Button>
            )}
            {sessionExpired && (
              <p className="text-sm text-destructive">
                Nội dung của bạn vẫn còn trên trang này. <LoginAgainLink /> rồi quay lại đây bấm lưu
                lại.
              </p>
            )}

            {editor.blocks.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
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
    </div>
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
