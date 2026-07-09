import {
  GitCompareArrows,
  ListChecks,
  Mic,
  Target,
} from "lucide-react";

export const SUGGESTED_PROMPTS = [
  { label: "Missing skills for this role?", icon: ListChecks },
  { label: "Align with Job #2?", icon: Target },
  { label: "Interview prep", icon: Mic },
  { label: "Compare all jobs", icon: GitCompareArrows },
] as const;

export const ONBOARDING_STEPS = [
  { num: "01", label: "Upload CV" },
  { num: "02", label: "Pick a role" },
  { num: "03", label: "Ask anything" },
] as const;
