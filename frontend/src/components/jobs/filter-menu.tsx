"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface FilterMenuOption {
  value: string;
  label: string;
}

interface FilterMenuProps {
  label: string;
  value: string;
  options: FilterMenuOption[];
  onChange: (value: string) => void;
  align?: "left" | "right";
  activeValue?: string;
}

export function FilterMenu({
  label,
  value,
  options,
  onChange,
  align = "left",
  activeValue = "all",
}: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = value !== activeValue;
  const displayLabel =
    options.find((option) => option.value === value)?.label ?? label;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
          isActive
            ? "border-primary bg-brand-light text-primary"
            : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
        )}
      >
        {isActive ? displayLabel : label}
        <ChevronDown
          className={cn(
            "size-3 transition-transform duration-200",
            open && "rotate-180",
          )}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute top-[calc(100%+6px)] z-30 max-h-52 min-w-[11rem] overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs transition-colors hover:bg-accent",
                  selected ? "font-medium text-primary" : "text-foreground",
                )}
              >
                {option.label}
                {selected && (
                  <Check className="size-3.5 shrink-0" strokeWidth={2} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
