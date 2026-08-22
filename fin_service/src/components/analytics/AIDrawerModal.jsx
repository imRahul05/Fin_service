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
    <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3 pb-1 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-sm">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 pl-4 py-2 my-3 rounded-r text-blue-900 dark:text-blue-200 text-xs italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg text-xs">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left border-b border-gray-200 dark:border-gray-700">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">{children}</td>
  ),
  code: ({ children }) => (
    <code className="bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded text-xs font-mono">
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
    if (analysis) {
      navigator.clipboard.writeText(analysis);
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
        <div className="w-screen max-w-2xl bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col transition-all animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  FinSage AI Strategic Report
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Comprehensive financial guidance and prioritized action plan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="Copy advice to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader: Metadata & Controls */}
          <div className="px-6 py-2.5 bg-blue-50/40 dark:bg-blue-950/20 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {cacheInfo?.cached && cacheInfo?.formattedTime ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Generated & cached ({cacheInfo.formattedTime})
                </span>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">
                  Real-time generated analysis
                </span>
              )}
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading || isRefreshing}
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium disabled:opacity-50 cursor-pointer"
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
                <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Formulating Personalized Strategy...</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cross-referencing income, debt ratios, and growth projections</p>
                </div>
              </div>
            ) : analysis ? (
              <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {analysis}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <p>No financial analysis available.</p>
                <p className="text-xs mt-1">Please ensure you have filled out your financial profile.</p>
              </div>
            )}
          </div>

          {/* Footer Action Links */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Bot className="w-4 h-4 text-blue-500" />
              <span>Need to test changes?</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                to="/scenarios"
                onClick={onClose}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 transition-colors"
              >
                <span>Simulate Scenarios</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                to="/advisor"
                onClick={onClose}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-colors"
              >
                <span>Ask AI Advisor</span>
                <ExternalLink className="w-3 h-3 text-blue-200" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
