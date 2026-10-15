"use client";

import { useState } from "react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminSelect } from "@/components/admin/ui/admin-select";
import type { BlockDef } from "@/lib/admin/page-editor/types";

interface BlockPickerProps {
  blockTypes: readonly BlockDef[];
  count: number;
  max: number;
  disabled?: boolean;
  onAdd: (type: string) => void;
}

export function BlockPicker({ blockTypes, count, max, disabled, onAdd }: BlockPickerProps) {
  const [type, setType] = useState(blockTypes[0]?.type ?? "");
  const full = count >= max;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-[color:var(--admin-field-border)] p-3">
      <label className="text-sm font-medium" htmlFor="block-picker-type">
        Thêm khối
      </label>
      <AdminSelect
        id="block-picker-type"
        className="w-auto min-w-44"
        value={type}
        disabled={disabled || full}
        onChange={(e) => setType(e.target.value)}
      >
        {blockTypes.map((def) => (
          <option key={def.type} value={def.type}>
            {def.label}
          </option>
        ))}
      </AdminSelect>
      <AdminButton type="button" disabled={disabled || full || type === ""} onClick={() => onAdd(type)}>
        Thêm
      </AdminButton>
      <span className="text-xs text-muted-foreground">
        {count}/{max} khối{full ? " — đã đủ, không thêm được nữa" : ""}
      </span>
    </div>
  );
}
