import * as React from "react";

// Đầu trang admin: h1 (phông tiêu đề, qua luật [data-admin] h1 trong admin.css) và vùng nút bên phải.
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[clamp(1.6rem,3vw,2.1rem)]">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-[62ch] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 max-[760px]:w-full">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
