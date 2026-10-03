import type { MetadataRoute } from "next";
import { getJobs } from "@/lib/api/jobs";
import { listAllPosts } from "@/lib/api/posts";
import { buildSitemapEntries } from "@/lib/seo/sitemap-entries";
import { SITE_URL } from "@/lib/seo/site-url";

// Không khai `revalidate` riêng ở đây: listAllPosts()/getJobs() đều đi qua apiGet với
// DEFAULT_REVALIDATE_SECONDS (lib/api/client.ts) = 60 giây — route này đã chạy theo giá trị
// đó, khai một số khác ở đây chỉ gây hiểu nhầm (Next lấy giá trị revalidate THẤP NHẤT trong
// các fetch của route, không phải giá trị khai ở đây).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, jobs] = await Promise.all([listAllPosts(), getJobs()]);
  return buildSitemapEntries({
    siteUrl: SITE_URL,
    posts,
    jobs: jobs.status === "ok" ? jobs.data : [],
  });
}
