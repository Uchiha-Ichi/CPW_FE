// Giá trị enum của backend (cpw_be/src/jobs/schemas/job.schema.ts).
const DEPARTMENTS = {
  "Kinh doanh": "business",
  "Sáng tạo": "creative",
  "Vận hành": "operations",
  "Công nghệ": "technology",
} as const;

export type DepartmentKey = (typeof DEPARTMENTS)[keyof typeof DEPARTMENTS];
export const DEPARTMENT_ORDER: readonly DepartmentKey[] = [
  "business",
  "creative",
  "operations",
  "technology",
];

const EMPLOYMENT_TYPES = {
  "Toàn thời gian": "FULL_TIME",
  "Bán thời gian": "PART_TIME",
  "Thực tập": "INTERN",
} as const;

const own = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

export function departmentKeyOf(department: string): DepartmentKey | undefined {
  return own(DEPARTMENTS, department)
    ? DEPARTMENTS[department as keyof typeof DEPARTMENTS]
    : undefined;
}

export function parseDepartment(raw: string | string[] | undefined): DepartmentKey | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return DEPARTMENT_ORDER.find((k) => k === value);
}

export function filterJobsByDepartment<T extends { department: string }>(
  jobs: T[],
  key: DepartmentKey | undefined,
): T[] {
  return key ? jobs.filter((job) => departmentKeyOf(job.department) === key) : jobs;
}

export function employmentTypeOf(
  type: string,
): (typeof EMPLOYMENT_TYPES)[keyof typeof EMPLOYMENT_TYPES] | undefined {
  return own(EMPLOYMENT_TYPES, type)
    ? EMPLOYMENT_TYPES[type as keyof typeof EMPLOYMENT_TYPES]
    : undefined;
}

export function buildCareersQuery({ department }: { department?: DepartmentKey }): string {
  const params = new URLSearchParams();
  if (department) params.set("department", department);
  const query = params.toString();
  return query ? `?${query}` : "";
}
