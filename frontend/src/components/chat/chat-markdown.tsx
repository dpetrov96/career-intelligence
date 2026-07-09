"use client";

import { cn } from "@/lib/utils";

type ListNode = {
  text: string;
  children: ListNode[];
};

type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "ul"; items: ListNode[] }
  | { type: "ol"; items: ListNode[] }
  | { type: "paragraph"; text: string };

function getIndent(line: string): number {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

function parseBulletLine(trimmed: string): string | null {
  const match = trimmed.match(/^[-*]\s+(.+)$/);
  return match ? match[1] : null;
}

function parseNumberedLine(trimmed: string): string | null {
  const match = trimmed.match(/^\d+\.\s+(.+)$/);
  return match ? match[1] : null;
}

function parseListBlock(
  lines: string[],
  start: number,
  baseIndent: number,
  kind: "ul" | "ol",
): { items: ListNode[]; nextIndex: number } {
  const items: ListNode[] = [];
  let index = start;

  while (index < lines.length) {
    const raw = lines[index];
    const trimmed = raw.trim();

    if (!trimmed) {
      index++;
      break;
    }

    const indent = getIndent(raw);
    if (indent < baseIndent) break;

    const text =
      kind === "ul" ? parseBulletLine(trimmed) : parseNumberedLine(trimmed);

    if (indent === baseIndent && text) {
      items.push({ text, children: [] });
      index++;
      continue;
    }

    if (indent > baseIndent && items.length > 0) {
      const nested = parseListBlock(lines, index, indent, "ul");
      items[items.length - 1].children.push(...nested.items);
      index = nested.nextIndex;
      continue;
    }

    break;
  }

  return { items, nextIndex: index };
}

function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  const lines = content.split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const raw = lines[index];
    const trimmed = raw.trim();

    if (!trimmed) {
      index++;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2],
      });
      index++;
      continue;
    }

    if (parseBulletLine(trimmed)) {
      const list = parseListBlock(lines, index, getIndent(raw), "ul");
      blocks.push({ type: "ul", items: list.items });
      index = list.nextIndex;
      continue;
    }

    if (parseNumberedLine(trimmed)) {
      const list = parseListBlock(lines, index, getIndent(raw), "ol");
      blocks.push({ type: "ol", items: list.items });
      index = list.nextIndex;
      continue;
    }

    const paragraphLines = [trimmed];
    index++;
    while (index < lines.length) {
      const nextTrimmed = lines[index].trim();
      if (!nextTrimmed) break;
      if (/^#{1,3}\s+/.test(nextTrimmed)) break;
      if (parseBulletLine(nextTrimmed) || parseNumberedLine(nextTrimmed)) break;
      paragraphLines.push(nextTrimmed);
      index++;
    }

    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function renderInlineMarkdown(text: string, inverted = false) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, partIndex) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={partIndex}
          className={cn(
            "font-semibold",
            inverted ? "text-white" : "text-foreground",
          )}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function ListItems({
  items,
  ordered,
  inverted,
}: {
  items: ListNode[];
  ordered: boolean;
  inverted?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag
      className={cn(
        "space-y-1 pl-5",
        ordered ? "list-decimal" : "list-disc",
        inverted ? "text-white" : "text-foreground/90",
      )}
    >
      {items.map((item, index) => (
        <li
          key={index}
          className="text-[14px] leading-[1.55] sm:text-[15px] [&>ul]:mt-1 [&>ol]:mt-1"
        >
          {renderInlineMarkdown(item.text, inverted)}
          {item.children.length > 0 && (
            <ListItems items={item.children} ordered={false} inverted={inverted} />
          )}
        </li>
      ))}
    </Tag>
  );
}

const headingClassName: Record<1 | 2 | 3, string> = {
  1: "text-[17px] font-semibold leading-snug sm:text-[18px]",
  2: "text-[16px] font-semibold leading-snug sm:text-[17px]",
  3: "mt-2 text-[15px] font-semibold leading-snug first:mt-0 sm:text-[16px]",
};

export function ChatMarkdown({
  content,
  inverted = false,
}: {
  content: string;
  inverted?: boolean;
}) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Tag = `h${block.level}` as "h1" | "h2" | "h3";
          return (
            <Tag
              key={index}
              className={cn(
                headingClassName[block.level],
                inverted ? "text-white" : "text-foreground",
              )}
            >
              {renderInlineMarkdown(block.text, inverted)}
            </Tag>
          );
        }

        if (block.type === "ul" || block.type === "ol") {
          return (
            <ListItems
              key={index}
              items={block.items}
              ordered={block.type === "ol"}
              inverted={inverted}
            />
          );
        }

        return (
          <p
            key={index}
            className={cn(
              "text-[14px] leading-[1.55] sm:text-[15px]",
              inverted ? "text-white" : "text-foreground/90",
            )}
          >
            {renderInlineMarkdown(block.text, inverted)}
          </p>
        );
      })}
    </div>
  );
}
