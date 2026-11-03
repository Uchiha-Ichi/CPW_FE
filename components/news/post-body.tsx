import parse, {
  domToReact,
  Element,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";
import { createElement, type ElementType } from "react";
import { CloudinaryImage } from "@/components/blocks/shared/cloudinary-image";

// Danh sách thẻ khớp bộ lọc của backend (cpw_be/src/posts/helpers/post-content.ts, ALLOWED_TAGS).
// FE vẫn tự lọc một lần nữa: không tin dữ liệu từ API tuyệt đối.
const ALLOWED_TAGS = new Set([
  "p",
  "h2",
  "h3",
  "strong",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "figure",
  "figcaption",
  "br",
]);

// Các thẻ bị bỏ cả nội dung bên trong (không chỉ bỏ thẻ).
const DROP_WITH_CONTENT = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "noscript",
  "template",
  "svg",
  "math",
  "form",
  "input",
  "button",
  "textarea",
  "select",
]);

const BODY_CLASS =
  "md:text-justify text-[1.05rem] leading-8 text-foreground/90 " +
  "[&_p]:mt-5 [&_h2]:mt-12 [&_h2]:text-left [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-[1.2] " +
  "[&_h3]:mt-8 [&_h3]:text-left [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-[1.25] " +
  "[&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-2 " +
  "[&_blockquote]:mt-6 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:italic " +
  "[&_figure]:mt-8 [&_figcaption]:mt-2 [&_figcaption]:text-left [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground [&_img]:mt-6";

export type PostImageComponent = ElementType<{ src: string; alt: string }>;

// Ảnh trong thân bài không có kích thước trong HTML: đặt tỉ lệ mặc định 3:2 để giữ chỗ, CLS kiểm bằng Lighthouse.
export function PostImage({ src, alt }: { src: string; alt: string }) {
  return (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={1200}
      height={800}
      sizes="(min-width: 768px) 720px, 100vw"
      className="h-auto w-full rounded-xl"
    />
  );
}

// Có dấu "\" hoặc khoảng trắng/ký tự điều khiển ở bất kỳ đâu thì bỏ: trình duyệt chuẩn hóa
// "/\host" và "/<tab>/host" thành "//host" (liên kết ra site ngoài). "//host" cũng không nhận.
const UNSAFE_HREF_CHARS = /[\\\s\u0000-\u001f\u007f]/;
const isSafeHref = (href: string) =>
  !UNSAFE_HREF_CHARS.test(href) &&
  /^(https?:\/\/|mailto:|\/(?!\/))/i.test(href);
const isExternal = (href: string) => /^https?:\/\//i.test(href.trim());

function buildOptions(Img: PostImageComponent): HTMLReactParserOptions {
  const options: HTMLReactParserOptions = {
    replace(node) {
      if (!(node instanceof Element)) return undefined;
      const name = node.name;
      const children = node.children as DOMNode[];

      if (DROP_WITH_CONTENT.has(name)) return <></>;
      if (!ALLOWED_TAGS.has(name)) return <>{domToReact(children, options)}</>;
      if (name === "br") return <br />;

      if (name === "img") {
        const src = node.attribs.src?.trim();
        if (!src || !/^https:\/\//i.test(src)) return <></>;
        return <Img src={src} alt={node.attribs.alt ?? ""} />;
      }

      if (name === "a") {
        const href = node.attribs.href ?? "";
        const inner = domToReact(children, options);
        if (!isSafeHref(href)) return <>{inner}</>;
        const external = isExternal(href)
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {};
        return (
          <a
            href={href}
            {...external}
            className="text-primary underline underline-offset-4"
          >
            {inner}
          </a>
        );
      }

      // Thẻ được phép còn lại: dựng lại không kèm thuộc tính nào.
      return createElement(name, undefined, domToReact(children, options));
    },
  };
  return options;
}

export function PostBody({
  html,
  Image = PostImage,
}: {
  html: string;
  Image?: PostImageComponent;
}) {
  return <div className={BODY_CLASS}>{parse(html, buildOptions(Image))}</div>;
}
