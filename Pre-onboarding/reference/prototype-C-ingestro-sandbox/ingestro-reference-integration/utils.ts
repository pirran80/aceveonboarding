export type StudentCsvRow = {
  student_email: string;
  first_name: string;
  last_name: string;
  password: string;
  company: string;
  group_names: string;
  courses: string;
};

export const STUDENT_CSV_COLUMNS: Array<keyof StudentCsvRow> = [
  "student_email",
  "first_name",
  "last_name",
  "password",
  "company",
  "group_names",
  "courses",
];

export const THINKIFIC_SAMPLE_ROWS: StudentCsvRow[] = [
  {
    student_email: "jane.doe@thinkific.com",
    first_name: "Jane",
    last_name: "Doe",
    password: "Passw0rd!",
    company: "Global Studio",
    group_names: "Launchers, Core Cohort",
    courses: "Mastering XLSX, English C1",
  },
  {
    student_email: "marco.rivera@thinkific.com",
    first_name: "Marco",
    last_name: "Rivera",
    password: "Thinkific123!",
    company: "Engineering Entity",
    group_names: "Engineers, Robotics",
    courses: "Math advanced, LLM Python",
  },
  {
    student_email: "zoe.li@thinkific.com",
    first_name: "Zoe",
    last_name: "Li",
    password: "TalentPass99!",
    company: "Creative Guild",
    group_names: "Creators, Writing Lab",
    courses: "Writing class, LLM Python",
  },
];

const sanitizeArray = (value: unknown): string => {
  if (value === undefined || value === null) {
    return "";
  }

  const normalized = Array.isArray(value)
    ? value.join(", ")
    : typeof value === "object"
    ? JSON.stringify(value)
    : String(value);

  return normalized.trim();
};

export const sanitizeString = (value: unknown): string => sanitizeArray(value);

const escapeCsvValue = (value: string): string => {
  const containsSpecial = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return containsSpecial ? `"${escaped}"` : escaped;
};

export const buildCsvBlob = (
  rows: StudentCsvRow[],
  columns: Array<keyof StudentCsvRow>
): Blob => {
  const header = columns.join(",");
  const lines = rows.map((row) =>
    columns.map((column) => escapeCsvValue(sanitizeString(row[column]))).join(",")
  );

  const csvContent = [header, ...lines].join("\n");
  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
};
