import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostBody } from "./post-body";

const FakeImage = ({ src, alt }: { src: string; alt: string }) =>
  createElement("img", { "data-fake": "1", src, alt });

const render = (html: string) =>
  renderToStaticMarkup(createElement(PostBody, { html, Image: FakeImage }));

describe("PostBody", () => {
  it("giữ các thẻ được phép", () => {
    const out = render(
      "<p>Xin <strong>chào</strong></p><h2>Tiêu đề</h2><ul><li>a</li></ul>"
    );
    expect(out).toContain("<strong>chào</strong>");
    expect(out).toContain("<h2>Tiêu đề</h2>");
    expect(out).toContain("<li>a</li>");
  });

  it("loại script, style, iframe cùng nội dung bên trong", () => {
    const out = render(
      "<p>a</p><script>alert(1)</script><style>p{x:y}</style><iframe src='https://x.test'>hi</iframe>"
    );
    expect(out).toContain("<p>a</p>");
    expect(out).not.toMatch(/script|alert|style|iframe|hi</i);
  });

  it("bỏ mọi thuộc tính của thẻ thường (onclick, style, class)", () => {
    const out = render(
      '<p onclick="alert(1)" style="color:red" class="x" id="y">a</p>'
    );
    expect(out).toContain("<p>a</p>");
    expect(out).not.toMatch(/onclick|style=|id="y"/);
  });

  it("thẻ lạ chỉ bỏ thẻ, giữ chữ bên trong", () => {
    const out = render("<font color='red'>chữ</font>");
    expect(out).toContain("chữ");
    expect(out).not.toContain("<font");
  });

  it("liên kết javascript: bị bỏ href nhưng giữ chữ", () => {
    const out = render('<a href="javascript:alert(1)">bấm</a>');
    expect(out).toContain("bấm");
    expect(out).not.toMatch(/javascript|href/i);
  });

  it("liên kết ngoài có target và rel; mailto và nội bộ thì không mở tab mới", () => {
    const ext = render('<a href="https://a.test/x">ngoài</a>');
    expect(ext).toContain('href="https://a.test/x"');
    expect(ext).toContain('target="_blank"');
    expect(ext).toContain('rel="noopener noreferrer"');
    const mail = render('<a href="mailto:a@b.co">mail</a>');
    expect(mail).toContain('href="mailto:a@b.co"');
    expect(mail).not.toContain("target=");
    const inner = render('<a href="/vi/news">trong</a>');
    expect(inner).toContain('href="/vi/news"');
    expect(inner).not.toContain("target=");
  });

  it("//host (protocol-relative) không được coi là liên kết nội bộ an toàn", () => {
    const out = render('<a href="//evil.test/x">x</a>');
    expect(out).not.toContain("href");
  });

  it("ảnh https đi qua component ảnh; ảnh khác giao thức hoặc thiếu src bị bỏ", () => {
    expect(
      render('<img src="https://res.cloudinary.com/x/a.jpg" alt="Mô tả">')
    ).toContain(
      'data-fake="1" src="https://res.cloudinary.com/x/a.jpg" alt="Mô tả"'
    );
    for (const bad of [
      '<img src="http://x.test/a.jpg">',
      '<img src="data:image/png;base64,AAAA">',
      '<img src="javascript:alert(1)">',
      "<img>",
    ]) {
      expect(render(bad)).not.toContain("data-fake");
    }
  });

  // Phần bên trong khung <div class=...> của PostBody, để so khớp chính xác.
  const inner = (html: string) =>
    render(html)
      .replace(/^<div class="[^"]*">/, "")
      .replace(/<\/div>$/, "");

  it.each([
    [
      "svg bị bỏ cùng nội dung",
      "<p>a</p><svg onload=alert(1)>x</svg>",
      "<p>a</p>",
    ],
    ["href JaVaScRiPt: bị bỏ", '<a href="JaVaScRiPt:alert(1)">t</a>', "t"],
    [
      "href có khoảng trắng đầu + javascript: bị bỏ",
      '<a href=" javascript:alert(1)">t</a>',
      "t",
    ],
    [
      "href data: bị bỏ",
      '<a href="data:text/html,&lt;script&gt;alert(1)&lt;/script&gt;">t</a>',
      "t",
    ],
    ["href /\\host bị bỏ", '<a href="/\\evil.test">t</a>', "t"],
    ["href /<tab>/host bị bỏ", '<a href="/\t/evil.test">t</a>', "t"],
    ["href có xuống dòng bị bỏ", '<a href="/\n/evil.test">t</a>', "t"],
    ["href //host bị bỏ", '<a href="//evil.test/x">t</a>', "t"],
    [
      "thẻ được phép mất thuộc tính, giữ chữ",
      '<p onclick="alert(1)" style="color:red"><strong onclick="x" style="y">đậm</strong></p>',
      "<p><strong>đậm</strong></p>",
    ],
    // Thẻ lạ chỉ bị bỏ vỏ; thẻ được phép bên trong vẫn được dựng lại (không thuộc tính).
    [
      "thẻ được phép lồng trong thẻ lạ",
      '<custom><p onclick="x">t</p></custom>',
      "<p>t</p>",
    ],
  ])("%s", (_name, html, expected) => {
    expect(inner(html)).toBe(expected);
  });

  it("liên kết nội bộ hợp lệ vẫn giữ href (khóa quy tắc /path)", () => {
    expect(inner('<a href="/vi/news">t</a>')).toBe(
      '<a href="/vi/news" class="text-primary underline underline-offset-4">t</a>'
    );
  });

  it("br và chuỗi rỗng không làm hỏng", () => {
    expect(render("a<br>b")).toContain("<br/>");
    expect(() => render("")).not.toThrow();
  });
});
