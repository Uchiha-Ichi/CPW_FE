import { describe, expect, it } from "vitest";
import { CACHE_TAGS, tagsForAdminWrite } from "./tags";

describe("tagsForAdminWrite", () => {
  it("jobs: ghi thì xóa tag jobs", () => {
    expect(tagsForAdminWrite("POST", ["jobs"])).toEqual([CACHE_TAGS.jobs]);
    expect(tagsForAdminWrite("PATCH", ["jobs", "665f"])).toEqual([CACHE_TAGS.jobs]);
    expect(tagsForAdminWrite("DELETE", ["jobs", "665f"])).toEqual([CACHE_TAGS.jobs]);
  });

  it("posts: mọi đường dẫn bắt đầu bằng posts", () => {
    expect(tagsForAdminWrite("POST", ["posts"])).toEqual([CACHE_TAGS.posts]);
    expect(tagsForAdminWrite("PATCH", ["posts", "abc"])).toEqual([CACHE_TAGS.posts]);
    expect(tagsForAdminWrite("POST", ["posts", "abc", "publish"])).toEqual([CACHE_TAGS.posts]);
    expect(tagsForAdminWrite("DELETE", ["posts", "abc"])).toEqual([CACHE_TAGS.posts]);
  });

  it("network: ghi thì xóa tag network", () => {
    expect(tagsForAdminWrite("PUT", ["network", "vn"])).toEqual([CACHE_TAGS.network]);
  });

  it("pages: chỉ publish xóa tag pages", () => {
    expect(tagsForAdminWrite("POST", ["pages", "home", "publish"])).toEqual([CACHE_TAGS.pages]);
    expect(tagsForAdminWrite("PUT", ["pages", "home", "draft"])).toEqual([]);
    expect(tagsForAdminWrite("POST", ["pages", "home", "discard"])).toEqual([]);
  });

  it("GET không bao giờ xóa cache", () => {
    expect(tagsForAdminWrite("GET", ["jobs"])).toEqual([]);
    expect(tagsForAdminWrite("GET", ["posts", "admin"])).toEqual([]);
    expect(tagsForAdminWrite("HEAD", ["network"])).toEqual([]);
    expect(tagsForAdminWrite("get", ["pages", "home", "publish"])).toEqual([]);
  });

  it("phương thức không phân biệt hoa thường", () => {
    expect(tagsForAdminWrite("post", ["jobs"])).toEqual([CACHE_TAGS.jobs]);
  });

  it("tài nguyên khác không xóa gì", () => {
    expect(tagsForAdminWrite("POST", ["products"])).toEqual([]);
    expect(tagsForAdminWrite("POST", ["uploads"])).toEqual([]);
    expect(tagsForAdminWrite("POST", ["contacts"])).toEqual([]);
    expect(tagsForAdminWrite("POST", ["auth", "login"])).toEqual([]);
  });

  it("đường dẫn rỗng không xóa gì", () => {
    expect(tagsForAdminWrite("POST", [])).toEqual([]);
  });
});
