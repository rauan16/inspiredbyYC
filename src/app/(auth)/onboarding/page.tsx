import { Suspense } from "react";
import { OnboardingFlow } from "@/components/auth/OnboardingFlow";

function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingFlow />
    </Suspense>
  );
}

export default OnboardingPage;
