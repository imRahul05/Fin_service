import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { 
  formatCurrency, 
  calculateFutureValue, 
  calculateEMI,
  calculateSection80CTaxBenefits
} from "../utils/financialUtils";
import { simulateScenario } from "../services/AIService";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Scenarios() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [finances, setFinances] = useState(null);
  const [scenarioType, setScenarioType] = useState("career");
  const [simulationResult, setSimulationResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  
  // Career change scenario params
  const [careerParams, setCareerParams] = useState({
    currentSalary: 0,
    newSalary: 0,
    yearsToSimulate: 5,
    annualGrowthRate: 5,
  });
  
  // Investment scenario params
  const [investmentParams, setInvestmentParams] = useState({
    currentStrategy: "fd", // fd, mutual_funds, stocks, etc.
    newStrategy: "sip", // sip, elss, nps, etc.
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
    itemType: "property", // property, car, bike, etc.
    itemCost: 5000000,
    downPayment: 1000000,
    loanTenureYears: 20,
    interestRate: 7.5,
    monthlyRent: 25000, // For buy vs rent comparison
  });
  
  // Load user's data when component mounts
  useEffect(() => {
    async function loadUserFinances() {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const docRef = doc(db, "userFinances", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userFinances = docSnap.data().finances;
          setFinances(userFinances);
          
          // Set initial values based on user data
          if (userFinances.income && userFinances.income.salary) {
            setCareerParams(prev => ({
              ...prev,
              currentSalary: userFinances.income.salary,
              newSalary: userFinances.income.salary * 1.3, // Default 30% increase
            }));
          }
          
          const totalInvestments = Object.values(userFinances.investments).reduce((sum, val) => sum + val, 0);
          setInvestmentParams(prev => ({
            ...prev,
            monthlyAmount: totalInvestments > 0 ? totalInvestments : 5000,
          }));
        }
      } catch (error) {
        console.error("Error loading finances:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserFinances();
  }, [currentUser]);
  
  // Run simulation based on scenario type
  const runSimulation = async () => {
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
    
    // Get AI analysis of the scenario
    setAiLoading(true);
    try {
      const currentData = {
        income: finances?.income || {},
        expenses: {
          ...finances?.fixedExpenses || {},
          ...finances?.variableExpenses || {}
        },
        investments: finances?.investments || {},
        loans: finances?.loans || {}
      };
      
      // Determine which params to send based on scenario type
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
      
      const analysis = await simulateScenario(currentData, scenarioData);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error("Error getting AI analysis:", error);
      setAiAnalysis("Unable to generate AI analysis at this time. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };
  
  // Career change simulation
  const simulateCareerChange = () => {
    const { currentSalary, newSalary, yearsToSimulate, annualGrowthRate } = careerParams;
    
    const labels = Array.from({ length: yearsToSimulate + 1 }, (_, i) => `Year ${i}`);
    const currentPath = [];
    const newPath = [];
    
    // Calculate current path
    for (let year = 0; year <= yearsToSimulate; year++) {
      const growthFactor = Math.pow(1 + (annualGrowthRate / 100), year);
      currentPath.push(currentSalary * growthFactor * 12); // Annual income
    }
    
    // Calculate new path
    for (let year = 0; year <= yearsToSimulate; year++) {
      const growthFactor = Math.pow(1 + (annualGrowthRate / 100), year);
      newPath.push(newSalary * growthFactor * 12); // Annual income
    }
    
    // Calculate difference in savings over time
    const currentExpenses = finances ? 
      Object.values(finances.fixedExpenses).reduce((sum, val) => sum + val, 0) +
      Object.values(finances.variableExpenses).reduce((sum, val) => sum + val, 0) : 
      currentSalary * 0.7; // Assume 70% expenses if no data
    
    const newExpenses = currentExpenses * (newSalary / currentSalary) * 0.9; // Assume some economy of scale
    
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
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        },
        {
          label: 'New Career - Annual Income',
          data: newPath,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        }
      ]
    };
    
    const savingsChartData = {
      labels,
      datasets: [
        {
          label: 'Current Career - Cumulative Savings',
          data: currentSavings,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
        {
          label: 'New Career - Cumulative Savings',
          data: newSavings,
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
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
  };
  
  // Investment strategy simulation
  const simulateInvestmentChange = () => {
    const { currentStrategy, newStrategy, monthlyAmount, yearsToSimulate, expectedReturns } = investmentParams;
    
    const labels = Array.from({ length: yearsToSimulate + 1 }, (_, i) => `Year ${i}`);
    const currentStrategyReturns = [];
    const newStrategyReturns = [];
    
    // Calculate current strategy returns
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
    
    // Calculate new strategy returns
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
    
    // Calculate tax benefits for ELSS and NPS
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
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        },
        {
          label: `${newStrategy.toUpperCase()} Returns`,
          data: newStrategyReturns,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
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
  };
  
  // Purchase simulation
  const simulatePurchase = () => {
    const { itemCost, downPayment, loanTenureYears, interestRate, monthlyRent } = purchaseParams;
    
    const loanAmount = itemCost - downPayment;
    const tenureInMonths = loanTenureYears * 12;
    const monthlyEMI = calculateEMI(loanAmount, interestRate, tenureInMonths);
    
    const labels = Array.from({ length: loanTenureYears + 1 }, (_, i) => `Year ${i}`);
    const buyingCosts = [];
    const rentingCosts = [];
    
    // Initial cost (down payment)
    buyingCosts.push(downPayment);
    rentingCosts.push(0);
    
    // Yearly costs over time
    let totalInterestPaid = 0;
    let remainingPrincipal = loanAmount;
    
    for (let year = 1; year <= loanTenureYears; year++) {
      const yearlyEMI = monthlyEMI * 12;
      const yearlyInterest = remainingPrincipal * (interestRate / 100);
      const yearlyPrincipal = Math.min(yearlyEMI - yearlyInterest, remainingPrincipal);
      
      remainingPrincipal -= yearlyPrincipal;
      totalInterestPaid += yearlyInterest;
      
      const maintenanceCost = itemCost * 0.01; // Assume 1% maintenance cost yearly
      
      buyingCosts.push(buyingCosts[year-1] + yearlyEMI + maintenanceCost);
      rentingCosts.push(rentingCosts[year-1] + (monthlyRent * 12));
    }
    
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Cumulative Cost of Buying',
          data: buyingCosts,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        },
        {
          label: 'Cumulative Cost of Renting',
          data: rentingCosts,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        }
      ]
    };
    
    // Calculate monthly cash flow impact
    const currentExpenses = finances ? 
      Object.values(finances.fixedExpenses).reduce((sum, val) => sum + val, 0) +
      Object.values(finances.variableExpenses).reduce((sum, val) => sum + val, 0) : 0;
    
    const currentIncome = finances ? 
      Object.values(finances.income).reduce((sum, val) => sum + val, 0) : 0;
    
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
  };
  
  // Handle input change for career params
  const handleCareerParamChange = (e) => {
    const { name, value } = e.target;
    setCareerParams(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  // Handle input change for investment params
  const handleInvestmentParamChange = (e) => {
    const { name, value } = e.target;
    setInvestmentParams(prev => ({
      ...prev,
      [name]: name === "currentStrategy" || name === "newStrategy" ? value : parseFloat(value) || 0
    }));
  };
  
  // Handle input change for purchase params
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
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            "What If" Scenarios
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Simulate different financial decisions and see how they affect your future.
          </p>
        </div>
      </div>

      {/* Scenario Type Selection */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Choose a Scenario to Simulate
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <button
              onClick={() => setScenarioType("career")}
              className={`px-4 py-2 rounded-lg text-center ${
                scenarioType === "career" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Career Change
            </button>
            <button
              onClick={() => setScenarioType("investment")}
              className={`px-4 py-2 rounded-lg text-center ${
                scenarioType === "investment" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Investment Strategy
            </button>
            <button
              onClick={() => setScenarioType("purchase")}
              className={`px-4 py-2 rounded-lg text-center ${
                scenarioType === "purchase" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Major Purchase
            </button>
          </div>
        </div>
      </div>

      {/* Parameters Form */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {scenarioType === "career" ? "Career Change Parameters" : 
             scenarioType === "investment" ? "Investment Strategy Parameters" : 
             "Major Purchase Parameters"}
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {/* Career Change Form */}
          {scenarioType === "career" && (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="currentSalary" className="block text-sm font-medium text-gray-700">
                  Current Monthly Salary (₹)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="currentSalary"
                    id="currentSalary"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={careerParams.currentSalary}
                    onChange={handleCareerParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="newSalary" className="block text-sm font-medium text-gray-700">
                  New Monthly Salary (₹)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="newSalary"
                    id="newSalary"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={careerParams.newSalary}
                    onChange={handleCareerParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="yearsToSimulate" className="block text-sm font-medium text-gray-700">
                  Years to Simulate
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="yearsToSimulate"
                    id="yearsToSimulate"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={careerParams.yearsToSimulate}
                    onChange={handleCareerParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="annualGrowthRate" className="block text-sm font-medium text-gray-700">
                  Annual Growth Rate (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="annualGrowthRate"
                    id="annualGrowthRate"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                <label htmlFor="currentStrategy" className="block text-sm font-medium text-gray-700">
                  Current Investment Strategy
                </label>
                <div className="mt-1">
                  <select
                    name="currentStrategy"
                    id="currentStrategy"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                <label htmlFor="newStrategy" className="block text-sm font-medium text-gray-700">
                  New Investment Strategy
                </label>
                <div className="mt-1">
                  <select
                    name="newStrategy"
                    id="newStrategy"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                <label htmlFor="monthlyAmount" className="block text-sm font-medium text-gray-700">
                  Monthly Investment Amount (₹)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="monthlyAmount"
                    id="monthlyAmount"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={investmentParams.monthlyAmount}
                    onChange={handleInvestmentParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="yearsToSimulate" className="block text-sm font-medium text-gray-700">
                  Years to Simulate
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="yearsToSimulate"
                    id="yearsToSimulate"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                <label htmlFor="itemType" className="block text-sm font-medium text-gray-700">
                  Purchase Type
                </label>
                <div className="mt-1">
                  <select
                    name="itemType"
                    id="itemType"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                <label htmlFor="itemCost" className="block text-sm font-medium text-gray-700">
                  Total Cost (₹)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="itemCost"
                    id="itemCost"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={purchaseParams.itemCost}
                    onChange={handlePurchaseParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700">
                  Down Payment (₹)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="downPayment"
                    id="downPayment"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={purchaseParams.downPayment}
                    onChange={handlePurchaseParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="loanTenureYears" className="block text-sm font-medium text-gray-700">
                  Loan Tenure (Years)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="loanTenureYears"
                    id="loanTenureYears"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={purchaseParams.loanTenureYears}
                    onChange={handlePurchaseParamChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
                  Annual Interest Rate (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="interestRate"
                    id="interestRate"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={purchaseParams.interestRate}
                    onChange={handlePurchaseParamChange}
                  />
                </div>
              </div>
              {purchaseParams.itemType === "property" && (
                <div>
                  <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700">
                    Monthly Rent (for Buy vs Rent) (₹)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="monthlyRent"
                      id="monthlyRent"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Run Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Results */}
      {simulationResult && (
        <div className="mt-8">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Simulation Results</h3>
          
          {/* Charts */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow px-5 py-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">
                {simulationResult.type === "career" ? "Income Comparison" : 
                 simulationResult.type === "investment" ? "Investment Growth" : 
                 "Buying vs Renting Costs"}
              </h4>
              <div className="h-80">
                <Line
                  data={simulationResult.chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        ticks: {
                          callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return context.dataset.label + ': ₹' + context.raw.toLocaleString('en-IN');
                          }
                        }
                      }
                    },
                  }}
                />
              </div>
            </div>

            {simulationResult.type === "career" && simulationResult.savingsChartData && (
              <div className="bg-white rounded-lg shadow px-5 py-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Cumulative Savings Comparison</h4>
                <div className="h-80">
                  <Line
                    data={simulationResult.savingsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          ticks: {
                            callback: function(value) {
                              return '₹' + value.toLocaleString('en-IN');
                            }
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return context.dataset.label + ': ₹' + context.raw.toLocaleString('en-IN');
                            }
                          }
                        }
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {simulationResult.type === "career" && (
              <>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Income Difference (After {careerParams.yearsToSimulate} years)</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {formatCurrency(simulationResult.summary.fiveYearIncomeDifference)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500">Annual difference in year {careerParams.yearsToSimulate}</dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Savings Difference (After {careerParams.yearsToSimulate} years)</dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600">
                      {formatCurrency(simulationResult.summary.fiveYearSavingsDifference)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500">Cumulative savings difference</dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Income Change</dt>
                    <dd className="mt-1 text-3xl font-semibold text-blue-600">
                      {formatCurrency(careerParams.newSalary - careerParams.currentSalary)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500">
                      {((careerParams.newSalary - careerParams.currentSalary) / careerParams.currentSalary * 100).toFixed(2)}% change
                    </dd>
                  </div>
                </div>
              </>
            )}

            {simulationResult.type === "investment" && (
              <>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Final Amount Difference</dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600">
                      {formatCurrency(simulationResult.summary.finalAmountDifference)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500">
                      After {investmentParams.yearsToSimulate} years
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">{investmentParams.currentStrategy.toUpperCase()} Final Amount</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {formatCurrency(simulationResult.summary.currentFinalAmount)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500">
                      Total investment: {formatCurrency(investmentParams.monthlyAmount * 12 * investmentParams.yearsToSimulate)}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">{investmentParams.newStrategy.toUpperCase()} Final Amount</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {formatCurrency(simulationResult.summary.newFinalAmount)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500">
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
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly EMI</dt>
                    <dd className="mt-1 text-3xl font-semibold text-blue-600">
                      {formatCurrency(simulationResult.summary.monthlyEMI)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500">
                      For {purchaseParams.loanTenureYears} years
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Savings Impact</dt>
                    <dd className="mt-1 text-3xl font-semibold text-red-600">
                      {formatCurrency(-simulationResult.summary.savingsReduction)}
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500">
                      From {formatCurrency(simulationResult.summary.currentMonthlySavings)} to {formatCurrency(simulationResult.summary.newMonthlySavings)}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {purchaseParams.itemType === "property" ? "Buy vs Rent Difference" : "Total Interest Paid"}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {purchaseParams.itemType === "property" 
                        ? formatCurrency(simulationResult.summary.costDifference)
                        : formatCurrency(simulationResult.summary.totalInterestPaid)
                      }
                    </dd>
                    <dd className="mt-2 text-sm text-gray-500">
                      {purchaseParams.itemType === "property" 
                        ? (simulationResult.summary.breakEvenYear >= 0 
                            ? `Break-even at year ${simulationResult.summary.breakEvenYear}` 
                            : "Buying never breaks even")
                        : `${(simulationResult.summary.totalInterestPaid / (purchaseParams.itemCost - purchaseParams.downPayment) * 100).toFixed(2)}% of loan amount`
                      }
                    </dd>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* AI Analysis */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-blue-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                AI Analysis
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personalized insights about this scenario
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {aiLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line">
                    {aiAnalysis}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scenarios;