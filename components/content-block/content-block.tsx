import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ImagePlaceholder } from "./image-placeholder";
import type { ContentBlockData } from "./types";

function BlockImage({ data }: { data: ContentBlockData }) {
  if (!data.image) {
    return <ImagePlaceholder label={data.imageAlt ?? data.title} />;
  }
  return (
    <Image
      src={data.image}
      alt={data.imageAlt ?? data.title}
      width={800}
      height={600}
      className="h-auto w-full object-cover"
    />
  );
}

export function ContentBlock({ data }: { data: ContentBlockData }) {
  switch (data.layout) {
    case "hero":
      return (
        <section className="px-4 py-20 text-center">
          <h1 className="text-4xl font-bold">{data.title}</h1>
          {data.text && <p className="mt-4 text-lg">{data.text}</p>}
          {data.btnLabel && data.btnLink && (
            <Link
              href={data.btnLink}
              className="mt-6 inline-block underline"
            >
              {data.btnLabel}
            </Link>
          )}
        </section>
      );

    case "text":
      return (
        <section className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-2xl font-semibold">{data.title}</h2>
          {data.text && <p className="mt-4">{data.text}</p>}
        </section>
      );

    case "imgleft":
    case "imgright":
      return (
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
          <div className={data.layout === "imgright" ? "md:order-2" : ""}>
            <BlockImage data={data} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{data.title}</h2>
            {data.text && <p className="mt-4">{data.text}</p>}
          </div>
        </section>
      );

    case "banner":
      return (
        <section className="relative px-4 py-24 text-center text-white">
          <div className="absolute inset-0 -z-10">
            <BlockImage data={data} />
          </div>
          <h2 className="text-3xl font-bold relative z-10">{data.title}</h2>
        </section>
      );

    case "cards":
      return (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-semibold">{data.title}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data.items ?? []).map((item) => (
              <Card key={item.t} className="p-6">
                <h3 className="font-medium">{item.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.d}
                </p>
              </Card>
            ))}
          </div>
        </section>
      );

    case "cta":
      return (
        <section className="px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold">{data.title}</h2>
          {data.text && <p className="mt-2">{data.text}</p>}
          {data.btnLabel && data.btnLink && (
            <Link
              href={data.btnLink}
              className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground"
            >
              {data.btnLabel}
            </Link>
          )}
        </section>
      );
  }
}
