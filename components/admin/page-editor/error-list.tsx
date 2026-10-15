import { AdminNotice } from "@/components/admin/ui/admin-notice";

interface ErrorListProps {
  messages: string[];
}

export function ErrorList({ messages }: ErrorListProps) {
  if (messages.length === 0) return null;
  return (
    <AdminNotice tone="danger">
      {messages.length === 1 ? (
        <p>{messages[0]}</p>
      ) : (
        <>
          <p className="font-medium">Có {messages.length} chỗ cần sửa:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {messages.map((message, i) => (
              <li key={i}>{message}</li>
            ))}
          </ul>
        </>
      )}
    </AdminNotice>
  );
}
