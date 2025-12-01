import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ConversationalMessageProps {
  content: string;
}

export function ConversationalMessage({ content }: ConversationalMessageProps) {
  return (
    <div className="bg-muted rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-2xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          code: ({ children }) => (
            <code className="bg-muted-foreground/10 px-1 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="ml-2">{children}</li>,
          h1: ({ children }) => <h1 className="text-lg font-semibold mb-2 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 text-foreground">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-muted-foreground/30 pl-3 mb-2 italic">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-purple-600 hover:text-purple-700 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
