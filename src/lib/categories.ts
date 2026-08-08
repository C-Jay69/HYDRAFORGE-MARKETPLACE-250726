import type { ProductCategory } from "@/types";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ecommerce: "E-commerce",
  dating: "Dating",
  "resume-builder": "Resume Builder",
  publishing: "Publishing",
  education: "Education",
  "due-diligence": "Due Diligence",
  "parental-monitoring": "Parental Monitoring",
  social: "Social",
  other: "Other",
};

export const CATEGORY_FILTER_OPTIONS: {
  value: ProductCategory | "all";
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "dating", label: "Dating" },
  { value: "social", label: "Social" },
  { value: "publishing", label: "Publishing" },
  { value: "education", label: "Education" },
  { value: "due-diligence", label: "Due Diligence" },
  { value: "parental-monitoring", label: "Parental Monitoring" },
  { value: "resume-builder", label: "Resume Builder" },
  { value: "other", label: "Other" },
];
