import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "../../components/ui/card";

const markdownComponents = {
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3 pb-1 border-b border-gray-200">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-700 leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-gray-700">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-gray-700">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-400 bg-blue-50 pl-4 py-2 my-3 rounded-r text-blue-800 italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-gray-200 rounded-lg text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-100 text-gray-700">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 text-left font-semibold border-b border-gray-200">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 border-b border-gray-100">{children}</td>
  ),
  code: ({ children }) => (
    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),
};

const FinancialAnalysis = ({ analysis, loading }) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-1">AI Financial Analysis</h3>
      <p className="text-gray-500 text-sm mb-4">
        AI-powered analysis of your financial data and spending patterns
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        <p className="text-gray-500 text-sm">
          No analysis available. Please ensure your financial data is up to date.
        </p>
      )}
    </Card>
  );
};

export default FinancialAnalysis;