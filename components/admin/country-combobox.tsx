"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import { findCountry, getCountryOptions, type CountryOption } from "@/lib/admin/countries";

// Bỏ dấu và chữ hoa để gõ "viet nam" vẫn ra "Việt Nam".
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

function Flag({ code, size }: { code: string; size: "sm" | "md" }) {
  const [w, h] = size === "sm" ? [20, 14] : [24, 16];
  return (
    <Image
      src={`https://flagcdn.com/w40/${code}.png`}
      alt=""
      width={w}
      height={h}
      unoptimized
      className="shrink-0 rounded-[2px] shadow-sm"
    />
  );
}

export function CountryCombobox({
  code,
  name,
  onSelect,
}: {
  code: string;
  name: string;
  onSelect: (country: CountryOption) => void;
}) {
  const options = useMemo(() => getCountryOptions(), []);
  const selected = findCountry(code) ?? null;
  // Dữ liệu cũ có tên nhưng mã cờ không nằm trong danh sách: giữ nguyên và báo để chọn lại.
  const legacy = !selected && name.trim() !== "";

  return (
    <div className="mt-1">
      <Combobox
        items={options}
        value={selected}
        onValueChange={(next) => {
          if (next) onSelect(next);
        }}
        itemToStringLabel={(c: CountryOption) => c.name}
        isItemEqualToValue={(a: CountryOption, b: CountryOption) => a.code === b.code}
        filter={(item: CountryOption, query: string) => {
          const q = fold(query.trim());
          return q === "" || fold(item.name).includes(q) || fold(item.en).includes(q);
        }}
      >
        <ComboboxInput
          placeholder="Chọn quốc gia…"
          aria-label="Quốc gia"
          className="w-full"
        >
          {selected && (
            <InputGroupAddon align="inline-start">
              <Flag code={selected.code} size="md" />
            </InputGroupAddon>
          )}
        </ComboboxInput>
        <ComboboxContent>
          <ComboboxEmpty>Không tìm thấy quốc gia</ComboboxEmpty>
          <ComboboxList>
            {(c: CountryOption) => (
              <ComboboxItem key={c.code} value={c}>
                <Flag code={c.code} size="sm" />
                <span className="truncate">{c.name}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {legacy && (
        <p className="mt-1 text-xs text-muted-foreground">
          Đang lưu: {name}. Mã cờ hiện tại không có trong danh sách, chọn lại quốc gia để cập nhật cờ và vị trí.
        </p>
      )}
    </div>
  );
}
