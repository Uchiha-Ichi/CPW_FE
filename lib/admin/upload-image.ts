export async function uploadAdminImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/proxy/uploads", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Tải ảnh thất bại" }));
    throw new Error(body.message ?? "Tải ảnh thất bại");
  }
  const data = await res.json();
  return data.url as string;
}
