import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useFinances } from "../hooks/useFinances";
import TaxRegimeOptimizer from "../components/scenarios/TaxRegimeOptimizer";
import { 
  formatCurrency, 
  calculateFutureValue, 
  calculateEMI,
  calculateSection80CTaxBenefits 
} from "../utils/financialUtils";
import { simulateScenario } from "../services/AIService";
import { computeScenarioHash, getAiCacheInfo } from "../utils/aiCache";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Scenarios() {
  const { currentUser } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { finances, loading } = useFinances();

  const [scenarioType, setScenarioType] = useState("career");
  const [simulationResult, setSimulationResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [cacheInfo, setCacheInfo] = useState(null);
  
  // Career change scenario params
  const [careerParams, setCareerParams] = useState({
    currentSalary: 0,
    newSalary: 0,
    yearsToSimulate: 5,
    annualGrowthRate: 5,
  });
  
  // Investment scenario params
  const [investmentParams, setInvestmentParams] = useState({
    currentStrategy: "fd",
    newStrategy: "sip",
    monthlyAmount: 5000,
    yearsToSimulate: 10,
    expectedReturns: {
      fd: 5.5,
      sip: 12,
      elss: 14,
      nps: 10,
      stocks: 15,
      gold: 8,
      realestate: 9,
    }
  });
  
  // Purchase scenario params
  const [purchaseParams, setPurchaseParams] = useState({
    itemType: "property",
    itemCost: 5000000,
    downPayment: 1000000,
    loanTenureYears: 20,
    interestRate: 7.5,
    monthlyRent: 25000,
  });
  
  // Sync parameters when finances load
  useEffect(() => {
    if (finances) {
      if (finances.income?.salary) {
        setCareerParams(prev => ({
          ...prev,
          currentSalary: finances.income.salary,
          newSalary: finances.income.salary * 1.3,
        }));
      }
      const totalInvestments = Object.values(finances.investments || {}).reduce((sum, val) => sum + val, 0);
      setInvestmentParams(prev => ({
        ...prev,
        monthlyAmount: totalInvestments > 0 ? totalInvestments : 5000,
      }));
    }
  }, [finances]);
  
  // Career change simulation
  const simulateCareerChange = useCallback(() => {
    const { currentSalary, newSalary, yearsToSimulate, annualGrowthRate } = careerParams;
    
    const labels = Array.from({ length: yearsToSimulate + 1 }, (_, i) => `Year ${i}`);
    const currentPath = [];
    const newPath = [];
    
    for (let year = 0; year <= yearsToSimulate; year++) {
      const growthFactor = Math.pow(1 + (annualGrowthRate / 100), year);
      currentPath.push(currentSalary * growthFactor * 12);
    }
    
    for (let year = 0; year <= yearsToSimulate; year++) {
      const growthFactor = Math.pow(1 + (annualGrowthRate / 100), year);
      newPath.push(newSalary * growthFactor * 12);
    }
    
    const currentExpenses = finances ? 
      Object.values(finances.fixedExpenses || {}).reduce((sum, val) => sum + val, 0) +
      Object.values(finances.variableExpenses || {}).reduce((sum, val) => sum + val, 0) : 
      currentSalary * 0.7;
    
    const newExpenses = currentExpenses * (newSalary / (currentSalary || 1)) * 0.9;
    
    const currentSavings = [];
    const newSavings = [];
    let cumulativeCurrentSavings = 0;
    let cumulativeNewSavings = 0;
    
    for (let year = 0; year <= yearsToSimulate; year++) {
      const currentYearlySavings = (currentPath[year] / 12 - currentExpenses) * 12;
      const newYearlySavings = (newPath[year] / 12 - newExpenses) * 12;
      
      cumulativeCurrentSavings += currentYearlySavings;
      cumulativeNewSavings += newYearlySavings;
      
      currentSavings.push(cumulativeCurrentSavings);
      newSavings.push(cumulativeNewSavings);
    }
    
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Current Career - Annual Income',
          data: currentPath,
          borderColor: isDark ? '#71717A' : '#64748B',
          backgroundColor: isDark ? 'rgba(113, 113, 122, 0.08)' : 'rgba(100, 116, 139, 0.05)',
          fill: true,
          tension: 0.2
        },
        {
          label: 'New Career - Annual Income',
          data: newPath,
          borderColor: isDark ? '#FAFAFA' : '#0F172A',
          backgroundColor: isDark ? 'rgba(250, 250, 250, 0.08)' : 'rgba(15, 23, 42, 0.05)',
          fill: true,
          tension: 0.2
        }
      ]
    };
    
    const savingsChartData = {
      labels,
      datasets: [
        {
          label: 'Current Career - Cumulative Savings',
          data: currentSavings,
          borderColor: isDark ? '#71717A' : '#64748B',
          backgroundColor: isDark ? 'rgba(113, 113, 122, 0.08)' : 'rgba(71, 85, 105, 0.05)',
          fill: true,
          tension: 0.2
        },
        {
          label: 'New Career - Cumulative Savings',
          data: newSavings,
          borderColor: isDark ? '#FAFAFA' : '#0F172A',
          backgroundColor: isDark ? 'rgba(250, 250, 250, 0.08)' : 'rgba(15, 23, 42, 0.05)',
          fill: true,
          tension: 0.2
        }
      ]
    };
    
    return {
      type: "career",
      chartData,
      savingsChartData,
      summary: {
        fiveYearIncomeDifference: newPath[yearsToSimulate] - currentPath[yearsToSimulate],
        fiveYearSavingsDifference: newSavings[yearsToSimulate] - currentSavings[yearsToSimulate]
      }
    };
  }, [careerParams, finances, isDark]);
  
  // Investment strategy simulation
  const simulateInvestmentChange = useCallback(() => {
    const { currentStrategy, newStrategy, monthlyAmount, yearsToSimulate, expectedReturns } = investmentParams;
    
    const labels = Array.from({ length: yearsToSimulate + 1 }, (_, i) => `Year ${i}`);
    const currentStrategyReturns = [];
    const newStrategyReturns = [];
    
    let currentAmount = 0;
    for (let year = 0; year <= yearsToSimulate; year++) {
      currentStrategyReturns.push(currentAmount);
      currentAmount = calculateFutureValue(
        currentAmount, 
        monthlyAmount, 
        expectedReturns[currentStrategy], 
        1
      );
    }
    
    let newAmount = 0;
    for (let year = 0; year <= yearsToSimulate; year++) {
      newStrategyReturns.push(newAmount);
      newAmount = calculateFutureValue(
        newAmount, 
        monthlyAmount, 
        expectedReturns[newStrategy], 
        1
      );
    }
    
    const yearlyInvestment = monthlyAmount * 12;
    const elssAnnualTaxBenefit = newStrategy === 'elss' ? 
      calculateSection80CTaxBenefits({ elss: yearlyInvestment }, "10L+") : 0;
    
    const npsAnnualTaxBenefit = newStrategy === 'nps' ? 
      calculateSection80CTaxBenefits({ nps: yearlyInvestment }, "10L+") : 0;
    
    const chartData = {
      labels,
      datasets: [
        {
          label: `${currentStrategy.toUpperCase()} Returns`,
          data: currentStrategyReturns,
          borderColor: isDark ? '#71717A' : '#64748B',
          backgroundColor: isDark ? 'rgba(113, 113, 122, 0.08)' : 'rgba(100, 116, 139, 0.05)',
          fill: true,
          tension: 0.2
        },
        {
          label: `${newStrategy.toUpperCase()} Returns`,
          data: newStrategyReturns,
          borderColor: isDark ? '#FAFAFA' : '#0F172A',
          backgroundColor: isDark ? 'rgba(250, 250, 250, 0.08)' : 'rgba(15, 23, 42, 0.05)',
          fill: true,
          tension: 0.2
        }
      ]
    };
    
    return {
      type: "investment",
      chartData,
      summary: {
        finalAmountDifference: newStrategyReturns[yearsToSimulate] - currentStrategyReturns[yearsToSimulate],
        currentFinalAmount: currentStrategyReturns[yearsToSimulate],
        newFinalAmount: newStrategyReturns[yearsToSimulate],
        taxBenefits: {
          elss: elssAnnualTaxBenefit,
          nps: npsAnnualTaxBenefit
        }
      }
    };
  }, [investmentParams, isDark]);
  
  // Purchase simulation
  const simulatePurchase = useCallback(() => {
    const { itemCost, downPayment, loanTenureYears, interestRate, monthlyRent } = purchaseParams;
    
    const loanAmount = itemCost - downPayment;
    const tenureInMonths = loanTenureYears * 12;
    const monthlyEMI = calculateEMI(loanAmount, interestRate, tenureInMonths);
    
    const labels = Array.from({ length: loanTenureYears + 1 }, (_, i) => `Year ${i}`);
    const buyingCosts = [];
    const rentingCosts = [];
    
    buyingCosts.push(downPayment);
    rentingCosts.push(0);
    
    let totalInterestPaid = 0;
    let remainingPrincipal = loanAmount;
    
    for (let year = 1; year <= loanTenureYears; year++) {
      const yearlyEMI = monthlyEMI * 12;
      const yearlyInterest = remainingPrincipal * (interestRate / 100);
      const yearlyPrincipal = Math.min(yearlyEMI - yearlyInterest, remainingPrincipal);
      
      remainingPrincipal -= yearlyPrincipal;
      totalInterestPaid += yearlyInterest;
      
      const maintenanceCost = itemCost * 0.01;
      
      buyingCosts.push(buyingCosts[year-1] + yearlyEMI + maintenanceCost);
      rentingCosts.push(rentingCosts[year-1] + (monthlyRent * 12));
    }
    
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Cumulative Cost of Buying',
          data: buyingCosts,
          borderColor: isDark ? '#FAFAFA' : '#0F172A',
          backgroundColor: isDark ? 'rgba(250, 250, 250, 0.08)' : 'rgba(15, 23, 42, 0.05)',
          fill: true,
          tension: 0.2
        },
        {
          label: 'Cumulative Cost of Renting',
          data: rentingCosts,
          borderColor: isDark ? '#71717A' : '#64748B',
          backgroundColor: isDark ? 'rgba(113, 113, 122, 0.08)' : 'rgba(71, 85, 105, 0.05)',
          fill: true,
          tension: 0.2
        }
      ]
    };
    
    const currentExpenses = finances ? 
      Object.values(finances.fixedExpenses || {}).reduce((sum, val) => sum + val, 0) +
      Object.values(finances.variableExpenses || {}).reduce((sum, val) => sum + val, 0) : 0;
    
    const currentIncome = finances ? 
      Object.values(finances.income || {}).reduce((sum, val) => sum + val, 0) : 0;
    
    const currentMonthlySavings = currentIncome - currentExpenses;
    const newMonthlySavings = currentMonthlySavings - monthlyEMI + (purchaseParams.itemType === "property" ? monthlyRent : 0);
    
    return {
      type: "purchase",
      chartData,
      summary: {
        monthlyEMI,
        totalInterestPaid,
        totalCostOfBuying: buyingCosts[loanTenureYears],
        totalCostOfRenting: rentingCosts[loanTenureYears],
        costDifference: buyingCosts[loanTenureYears] - rentingCosts[loanTenureYears],
        currentMonthlySavings,
        newMonthlySavings,
        savingsReduction: currentMonthlySavings - newMonthlySavings,
        breakEvenYear: buyingCosts.findIndex((cost, index) => cost <= rentingCosts[index])
      }
    };
  }, [purchaseParams, finances, isDark]);

  // Run simulation based on scenario type
  const runSimulation = async (forceRefresh = false) => {
    let result = null;
    
    switch (scenarioType) {
      case "career":
        result = simulateCareerChange();
        break;
      case "investment":
        result = simulateInvestmentChange();
        break;
      case "purchase":
        result = simulatePurchase();
        break;
      default:
        return;
    }
    
    setSimulationResult(result);
    
    const currentData = {
      income: finances?.income || {},
      expenses: {
        ...finances?.fixedExpenses || {},
        ...finances?.variableExpenses || {}
      },
      investments: finances?.investments || {},
      loans: finances?.loans || {}
    };
    
    let scenarioData;
    if (scenarioType === "career") {
      scenarioData = {
        type: "career_change",
        params: careerParams
      };
    } else if (scenarioType === "investment") {
      scenarioData = {
        type: "investment_strategy",
        params: investmentParams
      };
    } else if (scenarioType === "purchase") {
      scenarioData = {
        type: "major_purchase",
        params: purchaseParams
      };
    }

    const hash = computeScenarioHash(currentData, scenarioData);
    if (!forceRefresh && currentUser) {
      const info = getAiCacheInfo(currentUser.uid, "scenario", hash);
      if (info.cached) {
        setCacheInfo(info);
      }
    }

    setAiLoading(true);
    try {
      const analysis = await simulateScenario(currentData, scenarioData, {
        userId: currentUser?.uid,
        forceRefresh
      });
      setAiAnalysis(analysis);
      if (currentUser) {
        const info = getAiCacheInfo(currentUser.uid, "scenario", hash);
        setCacheInfo(info);
      }
    } catch (error) {
      console.error("Error getting AI analysis:", error);
      setAiAnalysis("Unable to generate AI analysis at this time. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  const lineChartOptions = useMemo(() => {
    const textColor = isDark ? '#A1A1AA' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: textColor, font: { size: 11 } },
          grid: { color: gridColor }
        },
        y: {
          ticks: {
            color: textColor,
            font: { size: 11 },
            callback: function(value) {
              return '₹' + Number(value).toLocaleString('en-IN');
            }
          },
          grid: { color: gridColor }
        }
      },
      plugins: {
        legend: {
          position: 'top',
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
              return ' ' + context.dataset.label + ': ₹' + Number(context.raw).toLocaleString('en-IN');
            }
          }
        }
      },
    };
  }, [isDark]);

  const displayChartData = useMemo(() => {
    if (!simulationResult?.chartData) return null;
    return {
      ...simulationResult.chartData,
      datasets: simulationResult.chartData.datasets.map((ds, index) => ({
        ...ds,
        borderColor: index === 0 ? (isDark ? '#71717A' : '#64748B') : (isDark ? '#FAFAFA' : '#0F172A'),
        backgroundColor: index === 0 
          ? (isDark ? 'rgba(113, 113, 122, 0.08)' : 'rgba(100, 116, 139, 0.05)')
          : (isDark ? 'rgba(250, 250, 250, 0.08)' : 'rgba(15, 23, 42, 0.05)')
      }))
    };
  }, [simulationResult, isDark]);

  const displaySavingsChartData = useMemo(() => {
    if (!simulationResult?.savingsChartData) return null;
    return {
      ...simulationResult.savingsChartData,
      datasets: simulationResult.savingsChartData.datasets.map((ds, index) => ({
        ...ds,
        borderColor: index === 0 ? (isDark ? '#71717A' : '#64748B') : (isDark ? '#FAFAFA' : '#0F172A'),
        backgroundColor: index === 0 
          ? (isDark ? 'rgba(113, 113, 122, 0.08)' : 'rgba(71, 85, 105, 0.05)')
          : (isDark ? 'rgba(250, 250, 250, 0.08)' : 'rgba(15, 23, 42, 0.05)')
      }))
    };
  }, [simulationResult, isDark]);

  const handleCareerParamChange = (e) => {
    const { name, value } = e.target;
    setCareerParams(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  const handleInvestmentParamChange = (e) => {
    const { name, value } = e.target;
    setInvestmentParams(prev => ({
      ...prev,
      [name]: name === "currentStrategy" || name === "newStrategy" ? value : parseFloat(value) || 0
    }));
  };
  
  const handlePurchaseParamChange = (e) => {
    const { name, value } = e.target;
    setPurchaseParams(prev => ({
      ...prev,
      [name]: name === "itemType" ? value : parseFloat(value) || 0
    }));
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-foreground"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-foreground sm:text-3xl sm:truncate">
            "What If" Scenarios
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Simulate different financial decisions and see how they affect your future.
          </p>
        </div>
      </div>

      {/* Scenario Type Selection - Clean Pill Switcher */}
      <div className="flex justify-start mb-8 overflow-x-auto pb-2">
        <div className="inline-flex p-1.5 bg-muted/60 dark:bg-muted/40 rounded-full border border-border/60">
          {[
            { id: "career", label: "Career Growth" },
            { id: "investment", label: "Investments" },
            { id: "purchase", label: "Major Purchase" },
            { id: "tax", label: "Tax Optimizer" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setScenarioType(tab.id)}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                scenarioType === tab.id
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tax Regime Optimizer Component */}
      {scenarioType === "tax" && (
        <TaxRegimeOptimizer finances={finances} />
      )}

      {/* Parameters Form */}
      {scenarioType !== "tax" && (
        <>
        <div className="bg-card border border-border/80 shadow-card rounded-3xl mb-8 overflow-hidden transition-colors">
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-base font-bold text-foreground">
              {scenarioType === "career" ? "Career Change Parameters" : 
               scenarioType === "investment" ? "Investment Strategy Parameters" : 
               "Major Purchase Parameters"}
            </h3>
          </div>
          <div className="p-6">
            {/* Career Change Form */}
            {scenarioType === "career" && (
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="currentSalary" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    Current Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    name="currentSalary"
                    id="currentSalary"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={careerParams.currentSalary}
                    onChange={handleCareerParamChange}
                  />
                </div>
                <div>
                  <label htmlFor="newSalary" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    New Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    name="newSalary"
                    id="newSalary"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={careerParams.newSalary}
                    onChange={handleCareerParamChange}
                  />
                </div>
                <div>
                  <label htmlFor="yearsToSimulate" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    Years to Simulate
                  </label>
                  <input
                    type="number"
                    name="yearsToSimulate"
                    id="yearsToSimulate"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={careerParams.yearsToSimulate}
                    onChange={handleCareerParamChange}
                  />
                </div>
                <div>
                  <label htmlFor="annualGrowthRate" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    Annual Growth Rate (%)
                  </label>
                  <input
                    type="number"
                    name="annualGrowthRate"
                    id="annualGrowthRate"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={careerParams.annualGrowthRate}
                    onChange={handleCareerParamChange}
                  />
                </div>
              </div>
            )}

            {/* Investment Strategy Form */}
            {scenarioType === "investment" && (
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="currentStrategy" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    Current Investment Strategy
                  </label>
                  <select
                    name="currentStrategy"
                    id="currentStrategy"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={investmentParams.currentStrategy}
                    onChange={handleInvestmentParamChange}
                  >
                    <option value="fd">Fixed Deposit (5.5% p.a.)</option>
                    <option value="sip">SIP - Mutual Funds (12% p.a.)</option>
                    <option value="elss">ELSS Funds (14% p.a.)</option>
                    <option value="nps">NPS (10% p.a.)</option>
                    <option value="stocks">Stocks (15% p.a.)</option>
                    <option value="gold">Gold (8% p.a.)</option>
                    <option value="realestate">Real Estate (9% p.a.)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="newStrategy" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    New Investment Strategy
                  </label>
                  <select
                    name="newStrategy"
                    id="newStrategy"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={investmentParams.newStrategy}
                    onChange={handleInvestmentParamChange}
                  >
                    <option value="fd">Fixed Deposit (5.5% p.a.)</option>
                    <option value="sip">SIP - Mutual Funds (12% p.a.)</option>
                    <option value="elss">ELSS Funds (14% p.a.)</option>
                    <option value="nps">NPS (10% p.a.)</option>
                    <option value="stocks">Stocks (15% p.a.)</option>
                    <option value="gold">Gold (8% p.a.)</option>
                    <option value="realestate">Real Estate (9% p.a.)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="monthlyAmount" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    Monthly Investment Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="monthlyAmount"
                    id="monthlyAmount"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={investmentParams.monthlyAmount}
                    onChange={handleInvestmentParamChange}
                  />
                </div>
                <div>
                  <label htmlFor="yearsToSimulate" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    Years to Simulate
                  </label>
                  <input
                    type="number"
                    name="yearsToSimulate"
                    id="yearsToSimulate"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={investmentParams.yearsToSimulate}
                    onChange={handleInvestmentParamChange}
                  />
                </div>
              </div>
            )}

            {/* Major Purchase Form */}
            {scenarioType === "purchase" && (
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="itemType" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    Purchase Type
                  </label>
                  <select
                    name="itemType"
                    id="itemType"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={purchaseParams.itemType}
                    onChange={handlePurchaseParamChange}
                  >
                    <option value="property">Property</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="itemCost" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    Total Cost (₹)
                  </label>
                  <input
                    type="number"
                    name="itemCost"
                    id="itemCost"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={purchaseParams.itemCost}
                    onChange={handlePurchaseParamChange}
                  />
                </div>
                <div>
                  <label htmlFor="downPayment" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    Down Payment (₹)
                  </label>
                  <input
                    type="number"
                    name="downPayment"
                    id="downPayment"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={purchaseParams.downPayment}
                    onChange={handlePurchaseParamChange}
                  />
                </div>
                <div>
                  <label htmlFor="loanTenureYears" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    Loan Tenure (Years)
                  </label>
                  <input
                    type="number"
                    name="loanTenureYears"
                    id="loanTenureYears"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={purchaseParams.loanTenureYears}
                    onChange={handlePurchaseParamChange}
                  />
                </div>
                <div>
                  <label htmlFor="interestRate" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                    Annual Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    name="interestRate"
                    id="interestRate"
                    className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                    value={purchaseParams.interestRate}
                    onChange={handlePurchaseParamChange}
                  />
                </div>
                {purchaseParams.itemType === "property" && (
                  <div>
                    <label htmlFor="monthlyRent" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                      Monthly Rent (for Buy vs Rent) (₹)
                    </label>
                    <input
                      type="number"
                      name="monthlyRent"
                      id="monthlyRent"
                      className="block w-full text-xs font-semibold rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground p-3 transition"
                      value={purchaseParams.monthlyRent}
                      onChange={handlePurchaseParamChange}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={runSimulation}
                className="inline-flex justify-center py-2.5 px-6 shadow-xs text-xs font-semibold rounded-full text-background bg-foreground hover:opacity-90 focus:outline-none transition cursor-pointer"
              >
                Run Simulation
              </button>
            </div>
          </div>
        </div>

        {/* Simulation Results */}
        {simulationResult && (
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-bold text-foreground">Simulation Results</h3>
            
            {/* Charts */}
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-card border border-border/80 rounded-3xl shadow-card p-6 transition-colors">
                <h4 className="text-sm font-bold text-foreground mb-4">
                  {simulationResult.type === "career" ? "Income Comparison" : 
                   simulationResult.type === "investment" ? "Investment Growth" : 
                   "Buying vs Renting Costs"}
                </h4>
                <div className="h-80">
                  <Line
                    data={displayChartData}
                    options={lineChartOptions}
                  />
                </div>
              </div>

              {simulationResult.type === "career" && displaySavingsChartData && (
                <div className="bg-card border border-border/80 rounded-3xl shadow-card p-6 transition-colors">
                  <h4 className="text-sm font-bold text-foreground mb-4">Cumulative Savings Comparison</h4>
                  <div className="h-80">
                    <Line
                      data={displaySavingsChartData}
                      options={lineChartOptions}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {simulationResult.type === "career" && (
                <>
                  <div className="bg-card border border-border/80 shadow-card rounded-3xl p-6 transition-colors">
                    <dt className="text-2xs font-bold uppercase tracking-wider text-muted-foreground truncate">Income Difference (After {careerParams.yearsToSimulate} years)</dt>
                    <dd className="mt-2 text-2xl sm:text-3xl font-black text-foreground">
                      {formatCurrency(simulationResult.summary.fiveYearIncomeDifference)}
                    </dd>
                    <dd className="mt-1 text-2xs text-muted-foreground">Annual difference in year {careerParams.yearsToSimulate}</dd>
                  </div>
                  <div className="bg-card border border-border/80 shadow-card rounded-3xl p-6 transition-colors">
                    <dt className="text-2xs font-bold uppercase tracking-wider text-muted-foreground truncate">Savings Difference (After {careerParams.yearsToSimulate} years)</dt>
                    <dd className="mt-2 text-2xl sm:text-3xl font-black text-foreground">
                      {formatCurrency(simulationResult.summary.fiveYearSavingsDifference)}
                    </dd>
                    <dd className="mt-1 text-2xs text-muted-foreground">Cumulative savings difference</dd>
                  </div>
                  <div className="bg-card border border-border/80 shadow-card rounded-3xl p-6 transition-colors">
                    <dt className="text-2xs font-bold uppercase tracking-wider text-muted-foreground truncate">Monthly Income Change</dt>
                    <dd className="mt-2 text-2xl sm:text-3xl font-black text-foreground">
                      {formatCurrency(careerParams.newSalary - careerParams.currentSalary)}
                    </dd>
                    <dd className="mt-1 text-2xs text-muted-foreground">
                      {((careerParams.newSalary - careerParams.currentSalary) / (careerParams.currentSalary || 1) * 100).toFixed(2)}% change
                    </dd>
                  </div>
                </>
              )}

              {simulationResult.type === "investment" && (
                <>
                  <div className="bg-card border border-border/80 shadow-card rounded-3xl p-6 transition-colors">
                    <dt className="text-2xs font-bold uppercase tracking-wider text-muted-foreground truncate">Final Amount Difference</dt>
                    <dd className="mt-2 text-2xl sm:text-3xl font-black text-foreground">
                      {formatCurrency(simulationResult.summary.finalAmountDifference)}
                    </dd>
                    <dd className="mt-1 text-2xs text-muted-foreground">
                      After {investmentParams.yearsToSimulate} years
                    </dd>
                  </div>
                  <div className="bg-card border border-border/80 shadow-card rounded-3xl p-6 transition-colors">
                    <dt className="text-2xs font-bold uppercase tracking-wider text-muted-foreground truncate">{investmentParams.currentStrategy.toUpperCase()} Final Amount</dt>
                    <dd className="mt-2 text-2xl sm:text-3xl font-black text-foreground">
                      {formatCurrency(simulationResult.summary.currentFinalAmount)}
                    </dd>
                    <dd className="mt-1 text-2xs text-muted-foreground">
                      Total investment: {formatCurrency(investmentParams.monthlyAmount * 12 * investmentParams.yearsToSimulate)}
                    </dd>
                  </div>
                  <div className="bg-card border border-border/80 shadow-card rounded-3xl p-6 transition-colors">
                    <dt className="text-2xs font-bold uppercase tracking-wider text-muted-foreground truncate">{investmentParams.newStrategy.toUpperCase()} Final Amount</dt>
                    <dd className="mt-2 text-2xl sm:text-3xl font-black text-foreground">
                      {formatCurrency(simulationResult.summary.newFinalAmount)}
                    </dd>
                    <dd className="mt-1 text-2xs text-muted-foreground">
                      {investmentParams.newStrategy === 'elss' || investmentParams.newStrategy === 'nps' ? 
                        `Annual tax benefit: ${formatCurrency(
                          investmentParams.newStrategy === 'elss' ? 
                          simulationResult.summary.taxBenefits.elss : 
                          simulationResult.summary.taxBenefits.nps
                        )}` : 
                        `Return rate: ${investmentParams.expectedReturns[investmentParams.newStrategy]}%`
                      }
                    </dd>
                  </div>
                </>
              )}

              {simulationResult.type === "purchase" && (
                <>
                  <div className="bg-card border border-border/80 shadow-card rounded-3xl p-6 transition-colors">
                    <dt className="text-2xs font-bold uppercase tracking-wider text-muted-foreground truncate">Monthly EMI</dt>
                    <dd className="mt-2 text-2xl sm:text-3xl font-black text-foreground">
                      {formatCurrency(simulationResult.summary.monthlyEMI)}
                    </dd>
                    <dd className="mt-1 text-2xs text-muted-foreground">
                      For {purchaseParams.loanTenureYears} years
                    </dd>
                  </div>
                  <div className="bg-card border border-border/80 shadow-card rounded-3xl p-6 transition-colors">
                    <dt className="text-2xs font-bold uppercase tracking-wider text-muted-foreground truncate">Monthly Savings Impact</dt>
                    <dd className="mt-2 text-2xl sm:text-3xl font-black text-foreground">
                      {formatCurrency(-simulationResult.summary.savingsReduction)}
                    </dd>
                    <dd className="mt-1 text-2xs text-muted-foreground">
                      From {formatCurrency(simulationResult.summary.currentMonthlySavings)} to {formatCurrency(simulationResult.summary.newMonthlySavings)}
                    </dd>
                  </div>
                  <div className="bg-card border border-border/80 shadow-card rounded-3xl p-6 transition-colors">
                    <dt className="text-2xs font-bold uppercase tracking-wider text-muted-foreground truncate">
                      {purchaseParams.itemType === "property" ? "Buy vs Rent Difference" : "Total Interest Paid"}
                    </dt>
                    <dd className="mt-2 text-2xl sm:text-3xl font-black text-foreground">
                      {purchaseParams.itemType === "property" 
                        ? formatCurrency(simulationResult.summary.costDifference)
                        : formatCurrency(simulationResult.summary.totalInterestPaid)
                      }
                    </dd>
                    <dd className="mt-1 text-2xs text-muted-foreground">
                      {purchaseParams.itemType === "property" 
                        ? (simulationResult.summary.breakEvenYear >= 0 
                            ? `Break-even at year ${simulationResult.summary.breakEvenYear}` 
                            : "Buying never breaks even")
                        : `${((simulationResult.summary.totalInterestPaid / (purchaseParams.itemCost - purchaseParams.downPayment || 1)) * 100).toFixed(2)}% of loan amount`
                      }
                    </dd>
                  </div>
                </>
              )}
            </div>

            {/* Scenario Analysis */}
            <div className="bg-card border border-border/80 rounded-3xl shadow-card overflow-hidden transition-colors">
              <div className="px-6 py-5 bg-muted/20 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Scenario Insights & Strategy
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Personalized projections and analysis for this scenario
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {cacheInfo?.cached && cacheInfo?.formattedTime && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-2xs font-semibold bg-muted text-foreground rounded-full border border-border">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Cached ({cacheInfo.formattedTime})
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => runSimulation(true)}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded-full text-xs font-semibold text-foreground bg-card hover:bg-muted disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : ""}`} />
                    {aiLoading ? "Regenerating..." : "Re-analyze"}
                  </button>
                </div>
              </div>
              <div className="p-6">
                {aiLoading ? (
                  <div className="flex flex-col justify-center items-center h-40 space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-foreground"></div>
                    <p className="text-xs text-muted-foreground font-medium">Generating scenario analysis...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed text-xs">
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No analysis available for this simulation.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}

export default Scenarios;