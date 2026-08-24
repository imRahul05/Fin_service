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
          borderColor: '#64748b',
          backgroundColor: 'rgba(100, 116, 139, 0.1)',
          fill: true,
          tension: 0.2
        },
        {
          label: 'New Career - Annual Income',
          data: newPath,
          borderColor: '#0f766e',
          backgroundColor: 'rgba(15, 118, 110, 0.1)',
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
          borderColor: '#475569',
          backgroundColor: 'rgba(71, 85, 105, 0.1)',
          fill: true,
          tension: 0.2
        },
        {
          label: 'New Career - Cumulative Savings',
          data: newSavings,
          borderColor: '#0f766e',
          backgroundColor: 'rgba(15, 118, 110, 0.1)',
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
  }, [careerParams, finances]);
  
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
          borderColor: '#64748b',
          backgroundColor: 'rgba(100, 116, 139, 0.1)',
          fill: true,
          tension: 0.2
        },
        {
          label: `${newStrategy.toUpperCase()} Returns`,
          data: newStrategyReturns,
          borderColor: '#0f766e',
          backgroundColor: 'rgba(15, 118, 110, 0.1)',
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
  }, [investmentParams]);
  
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
          borderColor: '#b45309',
          backgroundColor: 'rgba(180, 83, 9, 0.1)',
          fill: true,
          tension: 0.2
        },
        {
          label: 'Cumulative Cost of Renting',
          data: rentingCosts,
          borderColor: '#475569',
          backgroundColor: 'rgba(71, 85, 105, 0.1)',
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
  }, [purchaseParams, finances]);

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
    const textColor = isDark ? '#9ca3af' : '#6b7280';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          ticks: {
            color: textColor,
            callback: function(value) {
              return '₹' + value.toLocaleString('en-IN');
            }
          },
          grid: { color: gridColor }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: textColor }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ₹' + Number(context.raw).toLocaleString('en-IN');
            }
          }
        }
      },
    };
  }, [isDark]);

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
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            "What If" Scenarios
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Simulate different financial decisions and see how they affect your future.
          </p>
        </div>
      </div>

      {/* Scenario Type Selection */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-950/40 rounded-xl mb-8 overflow-hidden transition-colors">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Choose a Scenario to Simulate
          </h3>
        </div>
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
            <button
              type="button"
              onClick={() => setScenarioType("career")}
              className={`px-4 py-3 rounded-xl text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                scenarioType === "career" 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Career Growth
            </button>
            <button
              type="button"
              onClick={() => setScenarioType("investment")}
              className={`px-4 py-3 rounded-xl text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                scenarioType === "investment" 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Investments
            </button>
            <button
              type="button"
              onClick={() => setScenarioType("purchase")}
              className={`px-4 py-3 rounded-xl text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                scenarioType === "purchase" 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Major Purchase
            </button>
            <button
              type="button"
              onClick={() => setScenarioType("tax")}
              className={`px-4 py-3 rounded-xl text-center text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                scenarioType === "tax" 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Tax Optimizer
            </button>
          </div>
        </div>
      </div>

      {/* Tax Regime Optimizer Component */}
      {scenarioType === "tax" && (
        <TaxRegimeOptimizer finances={finances} />
      )}

      {/* Parameters Form */}
      {scenarioType !== "tax" && (
        <>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-950/40 rounded-xl mb-8 overflow-hidden transition-colors">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {scenarioType === "career" ? "Career Change Parameters" : 
             scenarioType === "investment" ? "Investment Strategy Parameters" : 
             "Major Purchase Parameters"}
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {/* Career Change Form */}
          {scenarioType === "career" && (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="currentSalary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Monthly Salary (₹)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="currentSalary"
                    id="currentSalary"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
                    value={careerParams.currentSalary}
                    onChange={handleCareerParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="newSalary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Monthly Salary (₹)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="newSalary"
                    id="newSalary"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
                    value={careerParams.newSalary}
                    onChange={handleCareerParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="yearsToSimulate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Years to Simulate
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="yearsToSimulate"
                    id="yearsToSimulate"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
                    value={careerParams.yearsToSimulate}
                    onChange={handleCareerParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="annualGrowthRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Annual Growth Rate (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="annualGrowthRate"
                    id="annualGrowthRate"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
                    value={careerParams.annualGrowthRate}
                    onChange={handleCareerParamChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Investment Strategy Form */}
          {scenarioType === "investment" && (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="currentStrategy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Investment Strategy
                </label>
                <div className="mt-1">
                  <select
                    name="currentStrategy"
                    id="currentStrategy"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
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
              </div>
              <div>
                <label htmlFor="newStrategy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Investment Strategy
                </label>
                <div className="mt-1">
                  <select
                    name="newStrategy"
                    id="newStrategy"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
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
              </div>
              <div>
                <label htmlFor="monthlyAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monthly Investment Amount (₹)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="monthlyAmount"
                    id="monthlyAmount"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
                    value={investmentParams.monthlyAmount}
                    onChange={handleInvestmentParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="yearsToSimulate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Years to Simulate
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="yearsToSimulate"
                    id="yearsToSimulate"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
                    value={investmentParams.yearsToSimulate}
                    onChange={handleInvestmentParamChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Major Purchase Form */}
          {scenarioType === "purchase" && (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Purchase Type
                </label>
                <div className="mt-1">
                  <select
                    name="itemType"
                    id="itemType"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
                    value={purchaseParams.itemType}
                    onChange={handlePurchaseParamChange}
                  >
                    <option value="property">Property</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="itemCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Cost (₹)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="itemCost"
                    id="itemCost"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
                    value={purchaseParams.itemCost}
                    onChange={handlePurchaseParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Down Payment (₹)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="downPayment"
                    id="downPayment"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
                    value={purchaseParams.downPayment}
                    onChange={handlePurchaseParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="loanTenureYears" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loan Tenure (Years)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="loanTenureYears"
                    id="loanTenureYears"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
                    value={purchaseParams.loanTenureYears}
                    onChange={handlePurchaseParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Annual Interest Rate (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="interestRate"
                    id="interestRate"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
                    value={purchaseParams.interestRate}
                    onChange={handlePurchaseParamChange}
                  />
                </div>
              </div>
              {purchaseParams.itemType === "property" && (
                <div>
                  <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Monthly Rent (for Buy vs Rent) (₹)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="monthlyRent"
                      id="monthlyRent"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md p-2 border"
                      value={purchaseParams.monthlyRent}
                      onChange={handlePurchaseParamChange}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={runSimulation}
              className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-xs text-xs font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 focus:outline-none transition cursor-pointer"
            >
              Run Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Results */}
      {simulationResult && (
        <div className="mt-8">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Simulation Results</h3>
          
          {/* Charts */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-950/40 px-5 py-6 transition-colors">
              <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                {simulationResult.type === "career" ? "Income Comparison" : 
                 simulationResult.type === "investment" ? "Investment Growth" : 
                 "Buying vs Renting Costs"}
              </h4>
              <div className="h-80">
                <Line
                  data={simulationResult.chartData}
                  options={lineChartOptions}
                />
              </div>
            </div>

            {simulationResult.type === "career" && simulationResult.savingsChartData && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-950/40 px-5 py-6 transition-colors">
                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">Cumulative Savings Comparison</h4>
                <div className="h-80">
                  <Line
                    data={simulationResult.savingsChartData}
                    options={lineChartOptions}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {simulationResult.type === "career" && (
              <>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Income Difference (After {careerParams.yearsToSimulate} years)</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(simulationResult.summary.fiveYearIncomeDifference)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500 dark:text-gray-400">Annual difference in year {careerParams.yearsToSimulate}</dd>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Savings Difference (After {careerParams.yearsToSimulate} years)</dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(simulationResult.summary.fiveYearSavingsDifference)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500 dark:text-gray-400">Cumulative savings difference</dd>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Monthly Income Change</dt>
                    <dd className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(careerParams.newSalary - careerParams.currentSalary)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {((careerParams.newSalary - careerParams.currentSalary) / (careerParams.currentSalary || 1) * 100).toFixed(2)}% change
                    </dd>
                  </div>
                </div>
              </>
            )}

            {simulationResult.type === "investment" && (
              <>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Final Amount Difference</dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(simulationResult.summary.finalAmountDifference)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      After {investmentParams.yearsToSimulate} years
                    </dd>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{investmentParams.currentStrategy.toUpperCase()} Final Amount</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(simulationResult.summary.currentFinalAmount)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Total investment: {formatCurrency(investmentParams.monthlyAmount * 12 * investmentParams.yearsToSimulate)}
                    </dd>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{investmentParams.newStrategy.toUpperCase()} Final Amount</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(simulationResult.summary.newFinalAmount)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500 dark:text-gray-400">
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
                </div>
              </>
            )}

            {simulationResult.type === "purchase" && (
              <>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Monthly EMI</dt>
                    <dd className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(simulationResult.summary.monthlyEMI)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      For {purchaseParams.loanTenureYears} years
                    </dd>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Monthly Savings Impact</dt>
                    <dd className="mt-1 text-3xl font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(-simulationResult.summary.savingsReduction)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      From {formatCurrency(simulationResult.summary.currentMonthlySavings)} to {formatCurrency(simulationResult.summary.newMonthlySavings)}
                    </dd>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {purchaseParams.itemType === "property" ? "Buy vs Rent Difference" : "Total Interest Paid"}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {purchaseParams.itemType === "property" 
                        ? formatCurrency(simulationResult.summary.costDifference)
                        : formatCurrency(simulationResult.summary.totalInterestPaid)
                      }
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {purchaseParams.itemType === "property" 
                        ? (simulationResult.summary.breakEvenYear >= 0 
                            ? `Break-even at year ${simulationResult.summary.breakEvenYear}` 
                            : "Buying never breaks even")
                        : `${((simulationResult.summary.totalInterestPaid / (purchaseParams.itemCost - purchaseParams.downPayment || 1)) * 100).toFixed(2)}% of loan amount`
                      }
                    </dd>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Scenario Analysis */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden transition-colors">
            <div className="px-4 py-4 sm:px-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Scenario Insights & Strategy
                  </h3>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Personalized projections and analysis for this scenario
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {cacheInfo?.cached && cacheInfo?.formattedTime && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" />
                    Cached ({cacheInfo.formattedTime})
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => runSimulation(true)}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin text-slate-900 dark:text-white" : ""}`} />
                  {aiLoading ? "Regenerating..." : "Re-analyze"}
                </button>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {aiLoading ? (
                <div className="flex flex-col justify-center items-center h-40 space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-900 dark:border-slate-800 dark:border-t-white"></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Generating scenario analysis...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-xs">
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
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