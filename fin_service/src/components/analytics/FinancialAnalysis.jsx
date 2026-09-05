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
  ListFilter
} from "lucide-react";

const markdownComponents = {
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-foreground mt-5 mb-2.5 pb-1 border-b border-border/70 flex items-center gap-1.5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-foreground mt-3 mb-1.5">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-muted-foreground leading-relaxed mb-2.5 text-xs sm:text-sm">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-4 mb-2.5 space-y-1 text-muted-foreground text-xs sm:text-sm">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-4 mb-2.5 space-y-1 text-muted-foreground text-xs sm:text-sm">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-foreground bg-muted/40 pl-3 py-2 my-3 rounded-r-xl text-foreground text-xs italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full border border-border/80 rounded-xl text-xs">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted/60 text-foreground font-semibold">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left border-b border-border/70">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-b border-border/60 text-muted-foreground">{children}</td>
  ),
  code: ({ children }) => (
    <code className="bg-muted text-foreground px-1.5 py-0.5 rounded-md text-xs font-mono">
      {children}
    </code>
  ),
};

export default function FinancialAnalysis({ 
  analysis, 
  loading, 
  onRefresh, 
  isRefreshing = false, 
  cacheInfo = null
}) {
  const [copied, setCopied] = useState(false);
  const [selectedSection, setSelectedSection] = useState("all");

  const handleCopy = () => {
    if (analysis && typeof analysis === "string" && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(analysis).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter content by section if selected
  const filteredAnalysis = useMemo(() => {
    if (!analysis || typeof analysis !== "string") return "";
    if (selectedSection === "all") return analysis;

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
    <Card className="flex flex-col h-full bg-card border-border/80 shadow-card rounded-3xl overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-border/70 bg-muted/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-2xl bg-foreground text-background flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-foreground truncate">
                AI Strategic Advisor
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                Real-time recommendations for your profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {cacheInfo?.cached && cacheInfo?.formattedTime && (
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-muted text-foreground rounded-full border border-border/70">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Cached ({cacheInfo.formattedTime})
              </span>
            )}

            <button
              onClick={handleCopy}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Copy analysis"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading || isRefreshing}
                className="rounded-full h-8 px-3.5 text-xs border-border/80 hover:bg-muted text-foreground cursor-pointer"
              >
                <RotateCcw className={`w-3 h-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Section Quick Filters */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-0.5 text-xs scrollbar-none">
          <span className="text-muted-foreground flex items-center gap-1 shrink-0 mr-1 text-xs font-medium">
            <ListFilter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setSelectedSection("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
              selectedSection === "all"
                ? "bg-foreground text-background shadow-2xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedSection("insights")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
              selectedSection === "insights"
                ? "bg-foreground text-background shadow-2xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setSelectedSection("recommendations")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
              selectedSection === "recommendations"
                ? "bg-foreground text-background shadow-2xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setSelectedSection("action")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
              selectedSection === "action"
                ? "bg-foreground text-background shadow-2xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
            }`}
          >
            Action Plan
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 sm:p-7 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-foreground"></div>
            <p className="text-xs text-muted-foreground">Generating personalized strategic guidance...</p>
          </div>
        ) : typeof analysis === "string" && analysis.trim() ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {filteredAnalysis}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-muted-foreground">
            No analysis available yet. Complete your financial profile to generate strategic guidance.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 px-6 border-t border-border/70 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <span>Powered by Gemini Financial Engine</span>
        <Link to="/advisor" className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline">
          <span>Open Full Copilot</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </Card>
  );
}