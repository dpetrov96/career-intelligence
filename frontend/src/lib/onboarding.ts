export type OnboardingStep = 1 | 2 | 3;

export function getOnboardingStep(
  hasResume: boolean,
  jobCount: number,
  isScraping = false,
  isMatching = false,
): OnboardingStep {
  if (!hasResume) return 1;
  if (jobCount === 0 || isScraping || isMatching) return 2;
  return 3;
}
