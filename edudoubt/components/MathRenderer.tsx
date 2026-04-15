'use client';
import { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  text: string;
}

export default function MathRenderer({ text }: MathRendererProps) {
  const rendered = useMemo(() => {
    if (!text) return '';
    // Replace $$...$$ (block) then $...$ (inline)
    let result = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return `<div class="katex-block my-2">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
      } catch {
        return `<code>${math}</code>`;
      }
    });
    result = result.replace(/\$([^$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch {
        return `<code>${math}</code>`;
      }
    });
    return result;
  }, [text]);

  return <span dangerouslySetInnerHTML={{ __html: rendered }} />;
}
