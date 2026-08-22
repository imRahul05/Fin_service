import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { RotateCcw, Sparkles, CheckCircle2 } from "lucide-react";

const markdownComponents = {
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3 pb-1 border-b border-gray-200 dark:border-gray-700">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-gray-700 dark:text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-gray-700 dark:text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-950/40 pl-4 py-2 my-3 rounded-r text-blue-800 dark:text-blue-300 italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">{children}</td>
  ),
  code: ({ children }) => (
    <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),
};

const FinancialAnalysis = ({ 
  analysis, 
  loading, 
  onRefresh, 
  isRefreshing = false, 
  cacheInfo = null 
}) => {
  return (
    <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-950/40">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Financial Analysis</h3>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            AI-powered analysis of your financial data and spending patterns
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {cacheInfo?.cached && cacheInfo?.formattedTime && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60">
              <CheckCircle2 className="w-3 h-3" />
              Cached ({cacheInfo.formattedTime})
            </span>
          )}

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading || isRefreshing}
              className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs text-gray-700 dark:text-gray-200"
            >
              <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin text-blue-500" : ""}`} />
              {isRefreshing ? "Regenerating..." : "Refresh Advice"}
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-48 space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading financial insights...</p>
        </div>
      ) : analysis ? (
        <div className="max-h-[600px] overflow-y-auto pr-1">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {analysis}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No analysis available. Please ensure your financial data is up to date.
        </p>
      )}
    </Card>
  );
};

export default FinancialAnalysis;