"use client";

interface ChatHeroBackgroundProps {
  className?: string;
}

export function ChatHeroBackground({ className }: ChatHeroBackgroundProps) {
  return (
    <div aria-hidden className={className}>
      <div className="hero-orb hero-orb-a absolute -left-24 -top-20 size-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="hero-orb hero-orb-b absolute -bottom-32 right-0 size-96 rounded-full bg-indigo-400/5 blur-3xl" />
      <div className="hero-grid absolute inset-0 opacity-[0.18]" />
    </div>
  );
}
