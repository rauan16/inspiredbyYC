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
        h1: (props) => (
          <h1 className="text-[1.4rem] font-semibold mt-4 mb-2 text-ink" {...props} />
        ),
        h2: (props) => (
          <h2 className="text-[1.15rem] font-semibold mt-4 mb-2 text-ink" {...props} />
        ),
        h3: (props) => (
          <h3 className="text-[1.05rem] font-semibold mt-3 mb-1.5 text-ink" {...props} />
        ),
        p: (props) => (
          <p className="mb-2 leading-[1.6] text-ink" {...props} />
        ),
        ul: (props) => (
          <ul className="ml-5 mb-2 list-disc space-y-0.5" {...props} />
        ),
        ol: (props) => (
          <ol className="ml-5 mb-2 list-decimal space-y-0.5" {...props} />
        ),
        li: (props) => (
          <li className="leading-[1.5] text-ink" {...props} />
        ),
        strong: (props) => (
          <strong className="font-semibold text-ink" {...props} />
        ),
        em: (props) => (
          <em className="opacity-80" {...props} />
        ),
        code: (props) => {
          const isInline = props.node?.position?.start.line === props.node?.position?.end.line;
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
        blockquote: (props) => (
          <blockquote
            className="border-l-2 border-yellow bg-yellow-dim/30 pl-3 pr-2 py-1.5 my-3 italic text-ink-soft"
            {...props}
          />
        ),
        hr: (props) => (
          <hr className="border-0 border-t border-line my-4" {...props} />
        ),
        a: (props) => (
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
