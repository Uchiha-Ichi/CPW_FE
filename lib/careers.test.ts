import { describe, expect, it } from "vitest";
import { findJobBySlug, type Job } from "./careers";

const jobs: Job[] = [
  {
    slug: "nhan-vien-kinh-doanh",
    title: "Nhân viên kinh doanh",
    department: "Kinh doanh",
    location: "TP.HCM",
    type: "Toàn thời gian",
    status: "Đang tuyển",
    description: "Mô tả công việc mẫu.",
  },
];

describe("findJobBySlug", () => {
  it("returns the job when the slug matches", () => {
    expect(findJobBySlug(jobs, "nhan-vien-kinh-doanh")).toBe(jobs[0]);
  });

  it("returns undefined when the slug does not match", () => {
    expect(findJobBySlug(jobs, "khong-ton-tai")).toBeUndefined();
  });
});
