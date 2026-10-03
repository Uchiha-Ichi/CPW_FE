import { Fragment } from "react";
import { splitAccent } from "@/lib/blocks/accent";

// Render "chữ *nhấn* chữ" bằng React. Không dùng HTML thô nên mọi ký tự đều được escape.
export function RichTitle({ text }: { text: string }) {
  return (
    <>
      {splitAccent(text).map((part, i) =>
        part.accent ? (
          <em key={i} className="not-italic text-primary">
            {part.text}
          </em>
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}
