"use client";

interface RolesPanelPlaceholderProps {
  hasResume?: boolean;
}

export function RolesPanelPlaceholder({
  hasResume = false,
}: RolesPanelPlaceholderProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
      <p className="text-sm font-medium text-foreground">
        {hasResume ? "No matches yet" : "No roles yet"}
      </p>
      <p className="mt-2 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
        {hasResume
          ? "Recommended roles appear here after analysis. Progress runs in chat."
          : "Upload your CV in chat to start matching."}
      </p>
    </div>
  );
}
