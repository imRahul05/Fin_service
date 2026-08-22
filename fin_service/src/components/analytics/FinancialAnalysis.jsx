import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  ListFilter,
  Layers
} from "lucide-react";

const markdownComponents = {
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-gray-900 dark:text-white mt-5 mb-2.5 pb-1 border-b border-gray-200 dark:border-gray-700/80 flex items-center gap-1.5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-3 mb-1.5">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2.5 text-xs sm:text-sm">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-4 mb-2.5 space-y-1 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-4 mb-2.5 space-y-1 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 pl-3 py-1.5 my-2.5 rounded-r text-blue-900 dark:text-blue-300 text-xs italic">
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
    <th className="px-3 py-1.5 text-left border-b border-gray-200 dark:border-gray-700">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">{children}</td>
  ),
  code: ({ children }) => (
    <code className="bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  ),
};

const FinancialAnalysis = ({ 
  analysis, 
  loading, 
  onRefresh, 
  isRefreshing = false, 
  cacheInfo = null,
  isSidebar = false 
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedSection, setSelectedSection] = useState("all");

  const handleCopy = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter content by section if selected
  const filteredAnalysis = useMemo(() => {
    if (!analysis || selectedSection === "all") return analysis;

    const sections = {
      summary: /## Financial Summary([\s\S]*?)(?=##|$)/i,
      insights: /## Key Insights([\s\S]*?)(?=##|$)/i,
      risks: /## Risks([\s\S]*?)(?=##|$)/i,
      recommendations: /## Recommendations([\s\S]*?)(?=##|$)/i,
      action: /## Action Plan([\s\S]*?)(?=##|$)/i
    };

    const regex = sections[selectedSection];
    if (regex) {
      const match = analysis.match(regex);
      if (match && match[0]) {
        return match[0].trim();
      }
    }
    return analysis;
  }, [analysis, selectedSection]);

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-950/40 rounded-2xl overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                AI Strategic Advisor
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Real-time recommendations for your profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {cacheInfo?.cached && cacheInfo?.formattedTime && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-2xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3" />
                Cached ({cacheInfo.formattedTime})
              </span>
            )}

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              title="Copy analysis"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading || isRefreshing}
                className="h-7 px-2.5 text-xs border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                <RotateCcw className={`w-3 h-3 mr-1 ${isRefreshing ? "animate-spin text-blue-500" : ""}`} />
                <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Section Quick Filters */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5 text-2xs scrollbar-none">
          <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1 shrink-0 mr-1 text-2xs">
            <ListFilter className="w-3 h-3" /> Jump to:
          </span>
          <button
            onClick={() => setSelectedSection("all")}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors shrink-0 cursor-pointer ${
              selectedSection === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedSection("insights")}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors shrink-0 cursor-pointer ${
              selectedSection === "insights"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setSelectedSection("risks")}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors shrink-0 cursor-pointer ${
              selectedSection === "risks"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Risks
          </button>
          <button
            onClick={() => setSelectedSection("recommendations")}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors shrink-0 cursor-pointer ${
              selectedSection === "recommendations"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Action Plan
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 sm:p-5 flex-1 overflow-y-auto ${isSidebar ? "max-h-[620px]" : "max-h-[600px]"}`}>
        {loading ? (
          <div className="flex flex-col justify-center items-center h-48 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Synthesizing personalized advice...</p>
          </div>
        ) : filteredAnalysis ? (
          <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {filteredAnalysis}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs">
            No analysis available. Please update your financial details.
          </div>
        )}
      </div>

      {/* Footer Quick Links */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Layers className="w-3 h-3 text-blue-500" />
          FinSage AI v2
        </span>
        <div className="flex items-center gap-2">
          <Link
            to="/scenarios"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-medium"
          >
            Test in Scenarios
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default FinancialAnalysis;