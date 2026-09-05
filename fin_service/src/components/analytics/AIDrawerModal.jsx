import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { 
  X, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  ExternalLink, 
  Bot,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";

const markdownComponents = {
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-foreground mt-6 mb-3 pb-1 border-b border-border/70 flex items-center gap-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-muted-foreground leading-relaxed mb-3 text-sm">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-muted-foreground text-sm">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-muted-foreground text-sm">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-foreground bg-muted/40 pl-4 py-2.5 my-3 rounded-r-xl text-foreground text-xs italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full border border-border/80 rounded-2xl text-xs">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted text-foreground font-semibold">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left border-b border-border/80">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-b border-border/60 text-muted-foreground">{children}</td>
  ),
  code: ({ children }) => (
    <code className="bg-muted text-foreground px-1.5 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  ),
};

export default function AIDrawerModal({
  isOpen,
  onClose,
  analysis,
  loading,
  isRefreshing,
  cacheInfo,
  onRefresh
}) {
  const [copied, setCopied] = useState(false);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCopy = () => {
    if (analysis && typeof analysis === "string" && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(analysis).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-card shadow-2xl border-l border-border/80 flex flex-col transition-all animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="px-6 py-4 bg-muted/30 border-b border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-xs">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  FinSage AI Strategic Report
                </h2>
                <p className="text-xs text-muted-foreground">
                  Comprehensive financial guidance and prioritized action plan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Copy advice to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader: Metadata & Controls */}
          <div className="px-6 py-2.5 bg-muted/20 border-b border-border/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {cacheInfo?.cached && cacheInfo?.formattedTime ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Generated & cached ({cacheInfo.formattedTime})
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Real-time generated analysis
                </span>
              )}
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading || isRefreshing}
                className="inline-flex items-center gap-1 text-foreground hover:underline font-semibold disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Regenerating..." : "Regenerate Analysis"}
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-80 space-y-4 text-center">
                <div className="h-10 w-10 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Formulating Personalized Strategy...</p>
                  <p className="text-xs text-muted-foreground mt-1">Cross-referencing income, debt ratios, and growth projections</p>
                </div>
              </div>
            ) : typeof analysis === "string" && analysis.trim() ? (
              <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed text-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {analysis}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p>No financial analysis available.</p>
                <p className="text-xs mt-1">Please ensure you have filled out your financial profile.</p>
              </div>
            )}
          </div>

          {/* Footer Action Links */}
          <div className="p-4 bg-muted/20 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bot className="w-4 h-4 text-foreground" />
              <span>Need to test portfolio changes?</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                to="/scenarios"
                onClick={onClose}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-full border border-border/80 bg-background hover:bg-muted px-4 py-2 text-xs font-medium text-foreground transition-colors shadow-xs"
              >
                <span>Simulate Scenarios</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </Link>
              <Link
                to="/advisor"
                onClick={onClose}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground text-background hover:bg-foreground/90 px-4 py-2 text-xs font-medium shadow-xs transition-colors"
              >
                <span>Ask AI Advisor</span>
                <ExternalLink className="w-3 h-3 text-background/80" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
