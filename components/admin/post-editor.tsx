"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { uploadPostImage } from "@/lib/admin/post-api";
import { errorMessages } from "@/lib/admin/post-errors";
import {
  IMAGE_OPTIONS,
  STARTER_KIT_OPTIONS,
  isImageFile,
} from "@/lib/admin/post-editor-config";

interface PostEditorProps {
  value: string;
  onChange: (html: string) => void;
  onError: (messages: string[]) => void;
  onBusyChange: (busy: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
}

export function PostEditor({
  value,
  onChange,
  onError,
  onBusyChange,
  disabled = false,
  ariaLabel,
}: PostEditorProps) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const pending = useRef(0);
  // Giữ callback mới nhất để editor (tạo một lần) không dùng bản cũ.
  const callbacks = useRef({ onChange, onError, onBusyChange });
  useEffect(() => {
    callbacks.current = { onChange, onError, onBusyChange };
  });

  async function insertImages(files: File[]) {
    const editor = editorRef.current;
    if (!editor || files.length === 0) return;
    pending.current += files.length;
    callbacks.current.onBusyChange(true);
    for (const file of files) {
      try {
        const { url } = await uploadPostImage(file);
        editor.chain().focus().setImage({ src: url, alt: "" }).run();
      } catch (err) {
        callbacks.current.onError(errorMessages(err));
      } finally {
        pending.current -= 1;
        if (pending.current === 0) callbacks.current.onBusyChange(false);
      }
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure(STARTER_KIT_OPTIONS),
      Image.configure(IMAGE_OPTIONS),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "post-content min-h-[280px] rounded-lg border border-[color:var(--admin-field-border)] bg-card p-3 text-sm focus:outline-none focus-visible:border-[color:var(--admin-brand-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--admin-brand-strong)]/30",
        "aria-label": ariaLabel,
        role: "textbox",
        "aria-multiline": "true",
      },
      // Dán/kéo ảnh vào khung soạn: tải lên rồi chèn URL, không bao giờ chèn base64.
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter(
          isImageFile
        );
        if (files.length === 0) return false;
        event.preventDefault();
        void insertImages(files);
        return true;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter(
          isImageFile
        );
        if (files.length === 0) return false;
        event.preventDefault();
        void insertImages(files);
        return true;
      },
    },
    onUpdate: ({ editor: current }) =>
      callbacks.current.onChange(current.getHTML()),
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor)
    return (
      <div className="min-h-[280px] rounded-lg border border-[color:var(--admin-field-border)] bg-card" />
    );

  function toggleLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(
      "Dán đường dẫn (bắt đầu bằng https://). Để trống để bỏ liên kết:",
      previous ?? "https://"
    );
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed })
      .run();
  }

  const tool = (label: string, active: boolean, onClick: () => void) => (
    <AdminButton
      key={label}
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </AdminButton>
  );

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1">
        {tool("Đậm", editor.isActive("bold"), () =>
          editor.chain().focus().toggleBold().run()
        )}
        {tool("Nghiêng", editor.isActive("italic"), () =>
          editor.chain().focus().toggleItalic().run()
        )}
        {tool("Gạch chân", editor.isActive("underline"), () =>
          editor.chain().focus().toggleUnderline().run()
        )}
        {tool("Tiêu đề", editor.isActive("heading", { level: 2 }), () =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        )}
        {tool("Tiêu đề nhỏ", editor.isActive("heading", { level: 3 }), () =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        )}
        {tool("Danh sách", editor.isActive("bulletList"), () =>
          editor.chain().focus().toggleBulletList().run()
        )}
        {tool("Danh sách số", editor.isActive("orderedList"), () =>
          editor.chain().focus().toggleOrderedList().run()
        )}
        {tool("Trích dẫn", editor.isActive("blockquote"), () =>
          editor.chain().focus().toggleBlockquote().run()
        )}
        {tool("Liên kết", editor.isActive("link"), toggleLink)}
        <AdminButton
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => fileInput.current?.click()}
        >
          Chèn ảnh
        </AdminButton>
      </div>
      <EditorContent editor={editor} />
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          void insertImages(files);
        }}
      />
      <p className="mt-1 text-xs text-muted-foreground">
        Có thể dán hoặc kéo thả ảnh trực tiếp vào khung soạn. Dòng trống để sang
        đoạn mới.
      </p>
    </div>
  );
}
