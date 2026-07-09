import { Suspense } from "react";
import { redirect } from "next/navigation";

import { CareerAssistant } from "@/components/career-assistant/career-assistant";
import { HOME, parseSessionId } from "@/lib/routes";

function CareerAssistantFallback() {
  return (
    <div className="flex h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId: raw } = await params;
  const sessionId = parseSessionId(raw);

  if (sessionId === null) {
    redirect(HOME);
  }

  return (
    <Suspense fallback={<CareerAssistantFallback />}>
      <CareerAssistant routeSessionId={sessionId} />
    </Suspense>
  );
}
