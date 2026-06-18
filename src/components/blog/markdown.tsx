import { Fragment, type ReactNode } from "react";

// Hafif, bağımlılıksız markdown renderer (admin tarafından girilen güvenilir içerik).
// Desteklenen: ## / ### başlık, - madde listesi, paragraf, **kalın**, satır içi link [metin](url).

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // **kalın** ve [metin](url) için tek geçiş
  const regex = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`}>{m[1]}</strong>);
    } else if (m[2] !== undefined && m[3] !== undefined) {
      const href = m[3];
      const external = /^https?:\/\//.test(href);
      nodes.push(
        <a
          key={`${keyPrefix}-a${i}`}
          href={href}
          className="text-primary hover:underline"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {m[2]}
        </a>
      );
    }
    last = regex.lastIndex;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    const items = listItems;
    listItems = [];
    blocks.push(
      <ul
        key={`ul-${key++}`}
        className="my-4 list-disc space-y-1.5 pl-6 marker:text-primary"
      >
        {items.map((it, idx) => (
          <li key={idx}>{renderInline(it, `li-${key}-${idx}`)}</li>
        ))}
      </ul>
    );
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("- ")) {
      listItems.push(line.slice(2).trim());
      continue;
    }
    flushList();
    if (line.startsWith("### ")) {
      blocks.push(
        <h3
          key={`h3-${key++}`}
          className="mt-6 mb-2 text-lg font-semibold text-foreground"
        >
          {renderInline(line.slice(4), `h3-${key}`)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      blocks.push(
        <h2
          key={`h2-${key++}`}
          className="mt-8 mb-3 text-xl font-bold text-foreground sm:text-2xl"
        >
          {renderInline(line.slice(3), `h2-${key}`)}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      blocks.push(
        <h2
          key={`h1-${key++}`}
          className="mt-8 mb-3 text-xl font-bold text-foreground sm:text-2xl"
        >
          {renderInline(line.slice(2), `h1-${key}`)}
        </h2>
      );
    } else {
      blocks.push(
        <p key={`p-${key++}`} className="my-3 leading-relaxed text-foreground/90">
          {renderInline(line, `p-${key}`)}
        </p>
      );
    }
  }
  flushList();

  return <Fragment>{blocks}</Fragment>;
}
