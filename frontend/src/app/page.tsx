import { Suspense } from "react";

import { CareerAssistant } from "@/components/career-assistant/career-assistant";

function CareerAssistantFallback() {
  return (
    <div className="flex h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<CareerAssistantFallback />}>
      <CareerAssistant routeSessionId={null} />
    </Suspense>
  );
}
