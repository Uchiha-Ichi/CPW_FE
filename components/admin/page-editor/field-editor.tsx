"use client";

import type { ReactNode } from "react";
import { ImageField } from "@/components/admin/page-editor/image-field";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminSelect } from "@/components/admin/ui/admin-select";
import { AdminTextarea } from "@/components/admin/ui/admin-textarea";
import {
  countChars,
  readCount,
  readLocalized,
  readText,
} from "@/lib/admin/page-editor/state";
import type { ItemFieldDef, LocalizedFieldDef } from "@/lib/admin/page-editor/types";

// Lưới ô nhập của một khối hoặc một thẻ: hai cột khi đủ rộng. Đo theo bề rộng của chính nó (container
// query), không theo màn hình, vì thanh bên và các lớp thẻ lồng nhau làm bề rộng thật khác xa màn hình.
// Ô chữ song ngữ và danh sách tự chiếm cả hàng (col-span-full); link, số, lựa chọn xếp chung hàng.
export function FieldGrid({ children }: { children: ReactNode }) {
  return (
    <div className="@container">
      <div className="grid gap-x-4 gap-y-5 @lg:grid-cols-2">{children}</div>
    </div>
  );
}

interface FieldEditorProps {
  def: ItemFieldDef;
  value: unknown;
  idBase: string;
  disabled?: boolean;
  mediaVariant?: "loop" | "player";
  // Gợi ý quy cách ảnh, chỉ dùng cho field ảnh.
  imageHint?: string;
  // undefined = xóa giá trị của field.
  onChange: (value: unknown) => void;
}

export function FieldEditor({ def, value, idBase, disabled, mediaVariant = "player", imageHint, onChange }: FieldEditorProps) {
  const id = `${idBase}-${def.key}`;
  const label = (
    <label className="text-sm font-medium" htmlFor={id}>
      {def.label}
      {def.required && <span className="text-[color:var(--admin-danger)]"> *</span>}
    </label>
  );

  switch (def.kind) {
    case "text":
    case "textarea":
    case "title":
      return <LocalizedField def={def} value={value} idBase={id} disabled={disabled} onChange={onChange} />;
    case "image":
      return (
        <ImageField
          label={def.label}
          required={def.required}
          value={readText(value)}
          disabled={disabled}
          mediaVariant={mediaVariant}
          hint={imageHint}
          onChange={onChange}
        />
      );
    case "link":
      return (
        <div className="space-y-1.5">
          {label}
          <AdminInput
            id={id}
            type="text"
            placeholder="/duong-dan hoặc https://…"
            disabled={disabled}
            value={readText(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "count":
      return (
        <div className="space-y-1.5">
          {label}
          <AdminInput
            id={id}
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            disabled={disabled}
            value={readCount(value)}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
      );
    case "enum": {
      const current = readText(value);
      return (
        <div className="space-y-1.5">
          {label}
          <AdminSelect
            id={id}
            disabled={disabled}
            value={current}
            onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
          >
            {(!def.required || current === "") && (
              <option value="">{def.required ? "Chọn…" : "(không chọn)"}</option>
            )}
            {def.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </AdminSelect>
        </div>
      );
    }
  }
}

interface LocalizedFieldProps {
  def: LocalizedFieldDef;
  value: unknown;
  idBase: string;
  disabled?: boolean;
  onChange: (value: unknown) => void;
}

function LocalizedField({ def, value, idBase, disabled, onChange }: LocalizedFieldProps) {
  const { vi, en } = readLocalized(value);

  return (
    <fieldset className="col-span-full min-w-0">
      <legend className="mb-2 text-sm font-medium">
        {def.label}
        {def.required && <span className="text-[color:var(--admin-danger)]"> *</span>}
      </legend>
      {def.kind === "title" && (
        <p className="mb-2 text-xs text-muted-foreground">
          Dùng *chữ* để nhấn mạnh. Không nhập HTML.
        </p>
      )}
      {/* Tiếng Việt và tiếng Anh đặt cạnh nhau khi đủ rộng: gần một nửa chiều cao cho mỗi ô chữ. */}
      <div className="@container">
        <div className="grid gap-3 @lg:grid-cols-2">
          <LangControl
            def={def}
            id={`${idBase}-vi`}
            label="Tiếng Việt"
            value={vi}
            disabled={disabled}
            onChange={(next) => onChange({ vi: next, en })}
          />
          <LangControl
            def={def}
            id={`${idBase}-en`}
            label="Tiếng Anh (tùy chọn)"
            value={en}
            disabled={disabled}
            onChange={(next) => onChange({ vi, en: next })}
          />
        </div>
      </div>
    </fieldset>
  );
}

interface LangControlProps {
  def: LocalizedFieldDef;
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function LangControl({ def, id, label, value, disabled, onChange }: LangControlProps) {
  // Server đếm sau khi chuẩn hóa NFC, nên bộ đếm cũng vậy. Chỉ cảnh báo, không chặn gõ.
  const length = countChars(value.normalize("NFC"));
  const over = length > def.max;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground" htmlFor={id}>
          {label}
        </label>
        <span className={`text-xs ${over ? "text-[color:var(--admin-danger)]" : "text-muted-foreground"}`}>
          {length}/{def.max}
        </span>
      </div>
      {def.kind === "textarea" ? (
        <AdminTextarea
          id={id}
          rows={3}
          disabled={disabled}
          aria-invalid={over}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <AdminInput
          id={id}
          type="text"
          disabled={disabled}
          aria-invalid={over}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
