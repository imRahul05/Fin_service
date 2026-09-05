import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFinances } from "../hooks/useFinances";
import { formatCurrency, aggregateFinancials } from "../utils/financialUtils";
import SubscriptionRadar from "../components/analytics/SubscriptionRadar";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { 
  BarChart3, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Analytics() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { finances, transactions, loading } = useFinances();

  const [spendingAnalysis, setSpendingAnalysis] = useState("");
  const [, setAiLoading] = useState(false);

  // Synchronously compute analytics metrics from finances
  const financeAnalytics = useMemo(() => {
    return aggregateFinancials(finances);
  }, [finances]);

  // Compute AI spending analysis
  useEffect(() => {
    async function getAnalysis() {
      if (!finances) return;
      
      setAiLoading(true);
      try {
        let analysis = "";
        
        if (financeAnalytics.income > 0) {
          analysis += `Based on your reported finances, you have a monthly income of ${formatCurrency(financeAnalytics.income)} and expenses of ${formatCurrency(financeAnalytics.expenses)}.\n\n`;
          
          if (financeAnalytics.savings > 0) {
            analysis += `You're saving ${formatCurrency(financeAnalytics.savings)} per month (${financeAnalytics.savingsRate.toFixed(1)}% of income), which is strong.\n\n`;
          } else {
            analysis += `Your expenses exceed your income by ${formatCurrency(Math.abs(financeAnalytics.savings))} per month. Consider reducing expenses in discretionary categories.\n\n`;
          }
          
          if (financeAnalytics.investmentsTotal > 0) {
            const investmentPercentage = (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100;
            analysis += `You're investing ${formatCurrency(financeAnalytics.investmentsTotal)} monthly (${investmentPercentage.toFixed(1)}% of income).\n\n`;
          }
          
          if (financeAnalytics.loansTotal > 0) {
            const debtToIncomeRatio = (financeAnalytics.loansTotal / financeAnalytics.income) * 100;
            analysis += `Your debt payments amount to ${formatCurrency(financeAnalytics.loansTotal)} monthly, which is ${debtToIncomeRatio.toFixed(1)}% of your income.\n\n`;
            
            if (debtToIncomeRatio > 36) {
              analysis += `This debt-to-income ratio is higher than the recommended 36%. Consider strategies to accelerate prepayment.\n\n`;
            } else {
              analysis += `Your debt-to-income ratio is within healthy limits.\n\n`;
            }
          }
        } else {
          analysis = "Please complete your financial profile to receive personalized insights.";
        }
        
        setSpendingAnalysis(analysis);
      } catch (error) {
        console.error("Error generating finance analysis:", error);
        setSpendingAnalysis("Unable to generate finance analysis at this time. Please try again later.");
      } finally {
        setAiLoading(false);
      }
    }
    
    getAnalysis();
  }, [finances, financeAnalytics]);

  // Chart configuration with clean monochromatic colors
  const chartPieOptions = useMemo(() => {
    const textColor = isDark ? '#A1A1AA' : '#64748B';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: textColor, font: { size: 11 }, boxWidth: 12 }
        },
        tooltip: {
          backgroundColor: isDark ? '#18181B' : '#0F172A',
          titleColor: '#FAFAFA',
          bodyColor: '#D4D4D8',
          cornerRadius: 12,
          padding: 10,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return ` ${label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      }
    };
  }, [isDark]);

  const monochromaticPalette = isDark ? [
    '#FAFAFA',
    '#D4D4D8',
    '#A1A1AA',
    '#71717A',
    '#52525B',
    '#3F3F46',
    '#27272A',
    '#18181B'
  ] : [
    '#0F172A',
    '#334155',
    '#475569',
    '#64748B',
    '#94A3B8',
    '#CBD5E1',
    '#E2E8F0',
    '#F1F5F9'
  ];

  const incomeData = {
    labels: Object.keys(financeAnalytics.incomeSources).filter(source => financeAnalytics.incomeSources[source] > 0),
    datasets: [
      {
        label: 'Income Sources',
        data: Object.entries(financeAnalytics.incomeSources)
          .filter(([, amount]) => amount > 0)
          .map(([, amount]) => amount),
        backgroundColor: monochromaticPalette.slice(0, 5),
        borderColor: isDark ? '#121214' : '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const expenseCategoryData = {
    labels: Object.keys(financeAnalytics.expenseCategories),
    datasets: [
      {
        label: 'Expense Categories',
        data: Object.values(financeAnalytics.expenseCategories),
        backgroundColor: monochromaticPalette,
        borderColor: isDark ? '#121214' : '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const expenseBreakdownData = {
    labels: Object.keys(financeAnalytics.expenseBreakdown).filter(key => financeAnalytics.expenseBreakdown[key] > 0),
    datasets: [
      {
        label: 'Expense Breakdown',
        data: Object.entries(financeAnalytics.expenseBreakdown)
          .filter(([, amount]) => amount > 0)
          .map(([, amount]) => amount),
        backgroundColor: monochromaticPalette.slice(0, 3),
        borderColor: isDark ? '#121214' : '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const investmentBreakdown = useMemo(() => {
    if (!finances || !finances.investments) return [];
    return Object.entries(finances.investments)
      .filter(([, amount]) => parseFloat(amount) > 0)
      .map(([type, amount]) => ({
        type,
        amount: parseFloat(amount)
      }));
  }, [finances]);
  
  const investmentData = {
    labels: investmentBreakdown.map(item => item.type),
    datasets: [
      {
        label: 'Investment Allocation',
        data: investmentBreakdown.map(item => item.amount),
        backgroundColor: monochromaticPalette.slice(0, 6),
        borderColor: isDark ? '#121214' : '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-foreground"></div>
      </div>
    );
  }

  if (!finances) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-card border border-border/80 rounded-3xl p-8 text-center shadow-card space-y-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-xl font-bold text-foreground">No Financial Profile Found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Please complete your financial profile to unlock rich visual analytics and portfolio allocations.
          </p>
          <Link
            to="/finance-input"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
          >
            <span>Add Finances</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Financial Analytics
            </h1>
            <span className="inline-flex items-center rounded-full bg-muted border border-border/70 px-3 py-0.5 text-2xs font-semibold text-foreground">
              Portfolio Ledger
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Granular breakdown of cash flow, asset allocation, and capital velocity
          </p>
        </div>

        <Link
          to="/finance-input"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/80 bg-card hover:bg-muted text-xs font-semibold text-foreground shadow-2xs transition"
        >
          <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Update Data</span>
        </Link>
      </div>

      {/* Financial Overview Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income */}
        <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-card space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Monthly Inflow</span>
          <p className="text-2xl font-black text-foreground">
            {formatCurrency(financeAnalytics.income)}
          </p>
          <p className="text-2xs text-muted-foreground">Active post-tax compensation</p>
        </div>

        {/* Expenses */}
        <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-card space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Monthly Outflow</span>
          <p className="text-2xl font-black text-foreground">
            {formatCurrency(financeAnalytics.expenses)}
          </p>
          <p className="text-2xs text-muted-foreground">Fixed & variable living expenses</p>
        </div>

        {/* Savings */}
        <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-card space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Net Monthly Surplus</span>
          <p className="text-2xl font-black text-foreground">
            {formatCurrency(financeAnalytics.savings)}
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-muted text-foreground border border-border/70">
            {financeAnalytics.savingsRate.toFixed(1)}% Rate
          </span>
        </div>

        {/* Investments */}
        <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-card space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Total Invested</span>
          <p className="text-2xl font-black text-foreground">
            {formatCurrency(financeAnalytics.investmentsTotal)}
          </p>
          <p className="text-2xs text-muted-foreground">Equities, PPF, NPS & Gold</p>
        </div>
      </div>

      {/* Health Indicators Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Savings Velocity */}
        <div className="bg-card rounded-3xl border border-border/80 p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border/80 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Savings Velocity</span>
            <p className="text-lg font-bold text-foreground mt-0.5">{financeAnalytics.savingsRate.toFixed(1)}%</p>
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border/70 inline-block mt-1">
              {financeAnalytics.savingsRate >= 20 ? "Optimal (≥20%)" : "Target: 20%+"}
            </span>
          </div>
        </div>

        {/* Debt Ratio */}
        <div className="bg-card rounded-3xl border border-border/80 p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border/80 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Debt-to-Income</span>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {financeAnalytics.totalIncome > 0 ? ((financeAnalytics.totalLoans / financeAnalytics.totalIncome) * 100).toFixed(1) : 0}%
            </p>
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border/70 inline-block mt-1">
              {financeAnalytics.totalIncome > 0 && (financeAnalytics.totalLoans / financeAnalytics.totalIncome) * 100 <= 36 ? "Healthy (≤36%)" : "High Leverage"}
            </span>
          </div>
        </div>

        {/* Investment Ratio */}
        <div className="bg-card rounded-3xl border border-border/80 p-5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border/80 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Capital Deployment</span>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {financeAnalytics.totalIncome > 0 ? ((financeAnalytics.investmentsTotal / financeAnalytics.totalIncome) * 100).toFixed(1) : 0}%
            </p>
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border/70 inline-block mt-1">
              {financeAnalytics.totalIncome > 0 && (financeAnalytics.investmentsTotal / financeAnalytics.totalIncome) * 100 >= 15 ? "Strong (≥15%)" : "Build Position"}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Sources */}
        <div className="bg-card border border-border/80 rounded-3xl shadow-card p-6">
          <h3 className="text-sm font-bold text-foreground mb-1">Income Sources</h3>
          <p className="text-2xs text-muted-foreground mb-4">Breakdown of primary & secondary inflow</p>
          <div className="h-64">
            <Pie data={incomeData} options={chartPieOptions} />
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-card border border-border/80 rounded-3xl shadow-card p-6">
          <h3 className="text-sm font-bold text-foreground mb-1">Fixed vs Variable</h3>
          <p className="text-2xs text-muted-foreground mb-4">Committed obligations vs discretionary cash flow</p>
          <div className="h-64">
            <Pie data={expenseBreakdownData} options={chartPieOptions} />
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-card border border-border/80 rounded-3xl shadow-card p-6">
          <h3 className="text-sm font-bold text-foreground mb-1">Expense Categories</h3>
          <p className="text-2xs text-muted-foreground mb-4">Detailed spending allocation</p>
          <div className="h-64">
            <Pie data={expenseCategoryData} options={chartPieOptions} />
          </div>
        </div>

        {/* Investment Allocation */}
        <div className="bg-card border border-border/80 rounded-3xl shadow-card p-6">
          <h3 className="text-sm font-bold text-foreground mb-1">Investment Allocation</h3>
          <p className="text-2xs text-muted-foreground mb-4">Distribution across Indian assets</p>
          <div className="h-64">
            {investmentBreakdown.length > 0 ? (
              <Pie data={investmentData} options={chartPieOptions} />
            ) : (
              <div className="flex justify-center items-center h-full text-xs text-muted-foreground">
                No investment data recorded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recurring Leakage Radar */}
      <SubscriptionRadar 
        transactions={transactions} 
        fixedExpenses={finances?.fixedExpenses} 
      />

      {/* Strategic Synthesis Card */}
      {spendingAnalysis && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-foreground" />
            <h3 className="text-sm font-bold text-foreground">Diagnostic Summary</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {spendingAnalysis}
          </p>
        </div>
      )}

    </div>
  );
}