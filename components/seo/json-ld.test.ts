import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JsonLd } from "./json-ld";

const inner = (html: string) =>
  html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");

describe("JsonLd", () => {
  it("render một thẻ script ld+json có JSON hợp lệ, không bị HTML-escape", () => {
    const html = renderToStaticMarkup(
      createElement(JsonLd, { data: { name: 'A & B "C" \'D\'', n: 1 } }),
    );
    expect(html.startsWith('<script type="application/ld+json">')).toBe(true);
    expect(JSON.parse(inner(html))).toEqual({ name: 'A & B "C" \'D\'', n: 1 });
  });

  it("không thể thoát khỏi thẻ script qua chuỗi dữ liệu", () => {
    const html = renderToStaticMarkup(
      createElement(JsonLd, { data: { name: "</script><img src=x onerror=alert(1)>" } }),
    );
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).not.toContain("<img");
  });
});
