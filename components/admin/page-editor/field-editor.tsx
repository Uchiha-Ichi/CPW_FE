"use client";

import { ImageField } from "@/components/admin/page-editor/image-field";
import {
  countChars,
  readCount,
  readLocalized,
  readText,
} from "@/lib/admin/page-editor/state";
import type { ItemFieldDef, LocalizedFieldDef } from "@/lib/admin/page-editor/types";

const CONTROL = "mt-1 w-full rounded-md border p-2 text-sm";

interface FieldEditorProps {
  def: ItemFieldDef;
  value: unknown;
  idBase: string;
  disabled?: boolean;
  // undefined = xóa giá trị của field.
  onChange: (value: unknown) => void;
}

export function FieldEditor({ def, value, idBase, disabled, onChange }: FieldEditorProps) {
  const id = `${idBase}-${def.key}`;
  const label = (
    <label className="text-sm font-medium" htmlFor={id}>
      {def.label}
      {def.required && <span className="text-destructive"> *</span>}
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
          onChange={onChange}
        />
      );
    case "link":
      return (
        <div>
          {label}
          <input
            id={id}
            type="text"
            className={CONTROL}
            placeholder="/duong-dan hoặc https://…"
            disabled={disabled}
            value={readText(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "count":
      return (
        <div>
          {label}
          <input
            id={id}
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className={CONTROL}
            disabled={disabled}
            value={readCount(value)}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
      );
    case "enum": {
      const current = readText(value);
      return (
        <div>
          {label}
          <select
            id={id}
            className={CONTROL}
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
          </select>
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
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">
        {def.label}
        {def.required && <span className="text-destructive"> *</span>}
      </legend>
      {def.kind === "title" && (
        <p className="text-xs text-muted-foreground">
          Dùng *chữ* để nhấn mạnh. Không nhập HTML.
        </p>
      )}
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
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground" htmlFor={id}>
          {label}
        </label>
        <span className={`text-xs ${over ? "text-destructive" : "text-muted-foreground"}`}>
          {length}/{def.max}
        </span>
      </div>
      {def.kind === "textarea" ? (
        <textarea
          id={id}
          rows={3}
          className={CONTROL}
          disabled={disabled}
          aria-invalid={over}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type="text"
          className={CONTROL}
          disabled={disabled}
          aria-invalid={over}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
