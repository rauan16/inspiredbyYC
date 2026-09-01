import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-[1.4rem] font-semibold mt-4 mb-2 text-ink" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-[1.15rem] font-semibold mt-4 mb-2 text-ink" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-[1.05rem] font-semibold mt-3 mb-1.5 text-ink" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="mb-2 leading-[1.6] text-ink" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="ml-5 mb-2 list-disc space-y-0.5" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="ml-5 mb-2 list-decimal space-y-0.5" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="leading-[1.5] text-ink" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-semibold text-ink" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="opacity-80" {...props} />
        ),
        code: ({ node, ...props }) => {
          const isInline = (node?.position?.start.line === node?.position?.end.line);
          if (isInline) {
            return (
              <code
                className="px-1.5 py-0.5 text-[12px] bg-paper-dim text-ink rounded border border-line font-mono"
                {...props}
              />
            );
          }
          return (
            <pre className="bg-ink text-paper p-3 rounded-lg overflow-x-auto my-3">
              <code className="font-mono text-[12px]" {...props} />
            </pre>
          );
        },
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-2 border-yellow bg-yellow-dim/30 pl-3 pr-2 py-1.5 my-3 italic text-ink-soft"
            {...props}
          />
        ),
        hr: ({ node, ...props }) => (
          <hr className="border-0 border-t border-line my-4" {...props} />
        ),
        a: ({ node, ...props }) => (
          <a
            className="text-red hover:text-red-dim border-b border-dotted border-red"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
