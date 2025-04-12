import React from "react";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";

const FinancialAnalysis = ({ financialData }) => {
  // Placeholder data for demonstration purposes
  const insights = [
    {
      id: 1,
      title: "Spending Pattern",
      description: "Your top spending category is Housing at 35% of total expenses.",
    },
    {
      id: 2,
      title: "Savings Potential",
      description: "Reducing dining out by 20% could save you approximately $150 monthly.",
    },
    {
      id: 3,
      title: "Budget Alert",
      description: "Entertainment expenses exceeded your budget by 15% this month.",
    },
    {
      id: 4,
      title: "Investment Opportunity",
      description: "Based on your savings rate, you could increase retirement contributions by 3%.",
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Financial Insights</h3>
      <p className="text-gray-600 mb-6">
        AI-powered analysis of your financial data and spending patterns
      </p>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <React.Fragment key={insight.id}>
            <div className="py-2">
              <h4 className="font-medium text-primary">{insight.title}</h4>
              <p className="text-gray-600 mt-1">{insight.description}</p>
            </div>
            {index < insights.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>These insights are based on your historical transaction data and financial goals.</p>
      </div>
    </Card>
  );
};

export default FinancialAnalysis;