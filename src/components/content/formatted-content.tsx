import { Fragment } from "react";

// Deliberately limited Markdown. All source is rendered as React text, never HTML.
function inline(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : part.startsWith("*") && part.endsWith("*") ? (
        <em key={index}>{part.slice(1, -1)}</em>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    );
}

export function FormattedContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  return (
    <div className="space-y-3 break-words text-sm leading-7">
      {lines.map((line, index) => {
        if (line.startsWith("### "))
          return (
            <h4 key={index} className="text-base font-semibold">
              {inline(line.slice(4))}
            </h4>
          );
        if (line.startsWith("## "))
          return (
            <h3 key={index} className="text-lg font-semibold">
              {inline(line.slice(3))}
            </h3>
          );
        if (line.startsWith("# "))
          return (
            <h2 key={index} className="text-xl font-semibold">
              {inline(line.slice(2))}
            </h2>
          );
        if (/^[-*] /.test(line))
          return (
            <ul key={index} className="list-disc pl-6">
              <li>{inline(line.slice(2))}</li>
            </ul>
          );
        return line.trim() ? (
          <p key={index} className="whitespace-pre-wrap">
            {inline(line)}
          </p>
        ) : (
          <div key={index} className="h-2" />
        );
      })}
    </div>
  );
}

export function safeActionLink(value?: string | null): string | undefined {
  if (!value || /[\s\\\u0000-\u001f]/.test(value)) return undefined;
  if (/^\/(?!\/)/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
