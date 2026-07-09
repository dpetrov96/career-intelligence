"use client";

interface ChatHeroBackgroundProps {
  className?: string;
}

export function ChatHeroBackground({ className }: ChatHeroBackgroundProps) {
  return (
    <div aria-hidden className={className}>
      <div className="hero-orb hero-orb-a absolute -left-20 -top-24 size-80 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="hero-orb hero-orb-b absolute -bottom-28 right-[-2rem] size-[28rem] rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="hero-orb absolute left-1/2 top-1/3 size-64 -translate-x-1/2 rounded-full bg-sky-300/10 blur-3xl" />
      <div className="hero-grid absolute inset-0 opacity-[0.22]" />
    </div>
  );
}
