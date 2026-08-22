import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { 
  getFinancialAdvice, 
  simulateScenario, 
  analyzeSpendingBehavior, 
  getBackwardAnalysis,
  askFinancialQuestion 
} from "../services/AIService";
import { 
  computeFinancialDataHash, 
  computeScenarioHash, 
  computeSpendingHash, 
  computeBackwardHash, 
  getAiCacheInfo 
} from "../utils/aiCache";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';

function AIAdvisor() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [finances, setFinances] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("personalAdvice");
  const [timeRange, setTimeRange] = useState("month");

  // Tab-specific response states to avoid cross-tab clobbering
  const [adviceState, setAdviceState] = useState({ response: "", loading: false, info: null });
  const [spendingState, setSpendingState] = useState({ response: "", loading: false, info: null });
  const [scenarioState, setScenarioState] = useState({ response: "", loading: false, info: null });
  const [backwardState, setBackwardState] = useState({ response: "", loading: false, info: null });
  const [customState, setCustomState] = useState({ prompt: "", response: "", loading: false });
  
  // Scenario state variables
  const [scenarioType, setScenarioType] = useState("career");
  const [careerParams, setCareerParams] = useState({
    currentSalary: 0,
    newSalary: 0,
    yearsToSimulate: 10,
    annualGrowthRate: 5
  });
  const [investmentParams, setInvestmentParams] = useState({
    currentStrategy: "fd",
    newStrategy: "sip",
    monthlySavings: 0,
    yearsToSimulate: 10
  });
  const [purchaseParams, setPurchaseParams] = useState({
    itemType: "property",
    itemCost: 0,
    downPayment: 0,
    loanTermYears: 20,
    interestRate: 7.5
  });
  
  // Historical decisions state
  const [historicalDecisions, setHistoricalDecisions] = useState([
    { type: "investment", description: "", amount: 0, date: "", outcome: "" }
  ]);

  // Load user's financial data
  useEffect(() => {
    async function loadUserData() {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const docRef = doc(db, "userFinances", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const financeData = docSnap.data().finances;
          setFinances(financeData);
          
          if (financeData) {
            const totalIncome = financeData.income ? 
              Object.values(financeData.income).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0;
            
            const totalExpenses = 
              (financeData.fixedExpenses ? Object.values(financeData.fixedExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0) +
              (financeData.variableExpenses ? Object.values(financeData.variableExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0);
            
            const monthlySavings = totalIncome - totalExpenses;
            
            setCareerParams(prev => ({
              ...prev,
              currentSalary: totalIncome,
              newSalary: prev.newSalary || totalIncome * 1.2
            }));
            
            setInvestmentParams(prev => ({
              ...prev,
              monthlySavings: monthlySavings > 0 ? monthlySavings : 0
            }));
          }
        }
        
        const transactionsRef = collection(db, "transactions");
        const now = new Date();
        let startDate;
        
        if (timeRange === "month") {
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        } else if (timeRange === "quarter") {
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        } else {
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        }
        
        const startDateString = startDate.toISOString().split('T')[0];
        
        const q = query(
          transactionsRef, 
          where("userId", "==", currentUser.uid),
          where("date", ">=", startDateString),
          orderBy("date", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const transactionsData = [];
        
        querySnapshot.forEach((document) => {
          transactionsData.push({ id: document.id, ...document.data() });
        });
        
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [currentUser, timeRange]);

  // Derived financial data context for advice
  const financialDataContext = useMemo(() => {
    if (!finances) return null;
    return {
      income: finances.income ? 
        Object.values(finances.income).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0,
      fixedExpenses: finances.fixedExpenses ? 
        Object.values(finances.fixedExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0,
      variableExpenses: finances.variableExpenses ? 
        Object.values(finances.variableExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0,
      investments: finances.investments || {},
      loans: finances.loans || {},
      goals: finances.goals || ""
    };
  }, [finances]);

  // Handle personal advice fetch (with cache awareness)
  const handleFetchPersonalAdvice = useCallback(async (forceRefresh = false) => {
    if (!financialDataContext || !currentUser) return;
    
    const hash = computeFinancialDataHash(financialDataContext);
    
    if (!forceRefresh) {
      const cacheInfo = getAiCacheInfo(currentUser.uid, "personal_advice", hash);
      if (cacheInfo.cached) {
        setAdviceState(prev => ({ ...prev, info: cacheInfo }));
      }
    }

    setAdviceState(prev => ({ ...prev, loading: true }));
    
    try {
      const advice = await getFinancialAdvice(financialDataContext, {
        userId: currentUser.uid,
        forceRefresh
      });
      const cacheInfo = getAiCacheInfo(currentUser.uid, "personal_advice", hash);
      setAdviceState({ response: advice, loading: false, info: cacheInfo });
    } catch (error) {
      console.error("Error getting personal advice:", error);
      setAdviceState(prev => ({ 
        ...prev, 
        loading: false, 
        response: "Sorry, I couldn't generate financial advice at this moment. Please try again later." 
      }));
    }
  }, [financialDataContext, currentUser]);

  // On initial load when finances are ready, load personal advice (from cache or API)
  useEffect(() => {
    if (financialDataContext && currentUser && !adviceState.response) {
      handleFetchPersonalAdvice(false);
    }
  }, [financialDataContext, currentUser, handleFetchPersonalAdvice, adviceState.response]);

  // Handle spending analysis (with cache awareness)
  const handleFetchSpendingAnalysis = useCallback(async (forceRefresh = false) => {
    if (transactions.length === 0) {
      setSpendingState({
        response: "No transaction data available for the selected time period. Please add transactions or select a different time range.",
        loading: false,
        info: null
      });
      return;
    }
    
    if (!currentUser) return;
    const hash = computeSpendingHash(transactions, timeRange);

    if (!forceRefresh) {
      const cacheInfo = getAiCacheInfo(currentUser.uid, "spending", hash);
      if (cacheInfo.cached) {
        setSpendingState(prev => ({ ...prev, info: cacheInfo }));
      }
    }

    setSpendingState(prev => ({ ...prev, loading: true }));
    
    try {
      const analysis = await analyzeSpendingBehavior(transactions, {
        userId: currentUser.uid,
        timeRange,
        forceRefresh
      });
      const cacheInfo = getAiCacheInfo(currentUser.uid, "spending", hash);
      setSpendingState({ response: analysis, loading: false, info: cacheInfo });
    } catch (error) {
      console.error("Error analyzing spending behavior:", error);
      setSpendingState(prev => ({ 
        ...prev, 
        loading: false, 
        response: "Sorry, I couldn't analyze your spending behavior at this moment. Please try again later." 
      }));
    }
  }, [transactions, timeRange, currentUser]);

  // Check cached spending when tab or transactions change
  useEffect(() => {
    if (activeTab === "spendingAnalysis" && currentUser && transactions.length > 0 && !spendingState.response) {
      const hash = computeSpendingHash(transactions, timeRange);
      const cacheInfo = getAiCacheInfo(currentUser.uid, "spending", hash);
      if (cacheInfo.cached) {
        handleFetchSpendingAnalysis(false);
      }
    }
  }, [activeTab, currentUser, transactions, timeRange, spendingState.response, handleFetchSpendingAnalysis]);

  // Handle Scenario Simulation (with cache awareness)
  const handleSimulateScenario = useCallback(async (forceRefresh = false) => {
    if (!finances || !currentUser) return;
    
    const currentData = {
      income: finances.income ? 
        Object.values(finances.income).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0,
      expenses: {
        fixed: finances.fixedExpenses ? 
          Object.values(finances.fixedExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0,
        variable: finances.variableExpenses ? 
          Object.values(finances.variableExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0
      },
      investments: finances.investments || {},
      loans: finances.loans || {}
    };
    
    let scenarioData;
    if (scenarioType === "career") {
      scenarioData = { type: "career_change", params: careerParams };
    } else if (scenarioType === "investment") {
      scenarioData = { type: "investment_strategy", params: investmentParams };
    } else if (scenarioType === "purchase") {
      scenarioData = { type: "major_purchase", params: purchaseParams };
    }

    const hash = computeScenarioHash(currentData, scenarioData);
    setScenarioState(prev => ({ ...prev, loading: true }));
    
    try {
      const analysis = await simulateScenario(currentData, scenarioData, {
        userId: currentUser.uid,
        forceRefresh
      });
      const cacheInfo = getAiCacheInfo(currentUser.uid, "scenario", hash);
      setScenarioState({ response: analysis, loading: false, info: cacheInfo });
    } catch (error) {
      console.error("Error simulating scenario:", error);
      setScenarioState(prev => ({ 
        ...prev, 
        loading: false, 
        response: "Sorry, I couldn't simulate this scenario at this moment. Please try again later." 
      }));
    }
  }, [finances, currentUser, scenarioType, careerParams, investmentParams, purchaseParams]);

  // Handle Backward Analysis (with cache awareness)
  const handleAnalyzeHistoricalDecisions = useCallback(async (forceRefresh = false) => {
    if (!currentUser) return;

    const validDecisions = historicalDecisions.filter(
      decision => decision.description && decision.amount > 0
    );
    
    if (validDecisions.length === 0) {
      setBackwardState({
        response: "Please add at least one past financial decision with description and amount to analyze.",
        loading: false,
        info: null
      });
      return;
    }
    
    const hash = computeBackwardHash(validDecisions);
    setBackwardState(prev => ({ ...prev, loading: true }));
    
    try {
      const analysis = await getBackwardAnalysis(validDecisions, {
        userId: currentUser.uid,
        forceRefresh
      });
      const cacheInfo = getAiCacheInfo(currentUser.uid, "backward_analysis", hash);
      setBackwardState({ response: analysis, loading: false, info: cacheInfo });
    } catch (error) {
      console.error("Error analyzing historical decisions:", error);
      setBackwardState(prev => ({ 
        ...prev, 
        loading: false, 
        response: "Sorry, I couldn't analyze your past decisions at this moment. Please try again later." 
      }));
    }
  }, [historicalDecisions, currentUser]);

  // Handle Custom Question
  const handleCustomPromptSubmit = async () => {
    if (!customState.prompt.trim() || !finances || !currentUser) return;
    
    setCustomState(prev => ({ ...prev, loading: true }));
    
    try {
      const financialContext = {
        income: finances.income,
        fixedExpenses: finances.fixedExpenses,
        variableExpenses: finances.variableExpenses,
        investments: finances.investments || {},
        loans: finances.loans || {}
      };
      
      const response = await askFinancialQuestion(customState.prompt, financialContext, {
        userId: currentUser.uid
      });
      setCustomState(prev => ({ ...prev, response, loading: false }));
    } catch (error) {
      console.error("Error getting AI response:", error);
      setCustomState(prev => ({
        ...prev,
        response: "Sorry, I couldn't process your question at this moment. Please try again later.",
        loading: false
      }));
    }
  };

  const handleCareerParamChange = (e) => {
    const { name, value } = e.target;
    setCareerParams(prev => ({
      ...prev,
      [name]: name === "yearsToSimulate" || name === "annualGrowthRate" 
        ? parseInt(value) || 0
        : parseFloat(value) || 0
    }));
  };

  const handleInvestmentParamChange = (e) => {
    const { name, value } = e.target;
    setInvestmentParams(prev => ({
      ...prev,
      [name]: name === "yearsToSimulate" ? parseInt(value) || 0 : 
              name === "currentStrategy" || name === "newStrategy" ? value :
              parseFloat(value) || 0
    }));
  };

  const handlePurchaseParamChange = (e) => {
    const { name, value } = e.target;
    setPurchaseParams(prev => ({
      ...prev,
      [name]: name === "itemType" ? value : 
              name === "loanTermYears" ? parseInt(value) || 0 :
              parseFloat(value) || 0
    }));
  };

  const handleHistoricalDecisionChange = (index, field, value) => {
    const newDecisions = [...historicalDecisions];
    newDecisions[index] = {
      ...newDecisions[index],
      [field]: field === "amount" ? parseFloat(value) || 0 : value
    };
    setHistoricalDecisions(newDecisions);
  };

  const addHistoricalDecision = () => {
    setHistoricalDecisions([
      ...historicalDecisions,
      { type: "investment", description: "", amount: 0, date: "", outcome: "" }
    ]);
  };

  const removeHistoricalDecision = (index) => {
    if (historicalDecisions.length > 1) {
      setHistoricalDecisions(historicalDecisions.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!finances) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            No financial data found
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            You haven't added your financial information yet. Please add your details to use the AI Advisor.
          </p>
          <div className="mt-8">
            <Button
              variant="default"
              onClick={() => window.location.href = "/finance-input"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Financial Information
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            AI Financial Advisor
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get personalized financial guidance powered by AI
          </p>
        </div>
      </div>

      {/* Ask AI Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-950/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-gray-900 dark:text-white">Ask a Financial Question</CardTitle>
            </div>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Get personalized answers to your specific financial questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full p-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              placeholder="Ask me anything about your finances, investments, or financial planning..."
              value={customState.prompt}
              onChange={(e) => setCustomState(prev => ({ ...prev, prompt: e.target.value }))}
            />

            {customState.loading && (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {customState.response && !customState.loading && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg prose dark:prose-invert max-w-none text-sm text-gray-800 dark:text-gray-200">
                <ReactMarkdown>{customState.response}</ReactMarkdown>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="default"
              onClick={handleCustomPromptSubmit}
              disabled={customState.loading || !customState.prompt.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {customState.loading ? "Thinking..." : "Get Answer"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="personalAdvice" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-8 bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="personalAdvice">Personal Advice</TabsTrigger>
          <TabsTrigger value="spendingAnalysis">Spending Analysis</TabsTrigger>
          <TabsTrigger value="scenarios">What-If Scenarios</TabsTrigger>
          <TabsTrigger value="backwardAnalysis">Backward Analysis</TabsTrigger>
        </TabsList>
        
        {/* Personal Advice Tab */}
        <TabsContent value="personalAdvice" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-950/40">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-gray-900 dark:text-white">Personal Financial Advice</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Get tailored advice based on your current financial situation
                </CardDescription>
              </div>
              {adviceState.info?.cached && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" />
                  Cached ({adviceState.info.formattedTime})
                </span>
              )}
            </CardHeader>
            <CardContent>
              {adviceState.loading ? (
                <div className="flex flex-col justify-center items-center h-96 space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading personalized financial advice...</p>
                </div>
              ) : adviceState.response ? (
                <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
                  <ReactMarkdown>{adviceState.response}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Click "Generate Advice" to receive personalized financial recommendations.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-gray-100 dark:border-gray-700/60 pt-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/finance-input"}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
              >
                Update Financial Info
              </Button>
              <Button 
                variant="default" 
                onClick={() => handleFetchPersonalAdvice(true)}
                disabled={adviceState.loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RotateCcw className={`w-4 h-4 mr-1.5 ${adviceState.loading ? "animate-spin" : ""}`} />
                {adviceState.loading ? "Refreshing..." : "Refresh Advice"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Spending Analysis Tab */}
        <TabsContent value="spendingAnalysis" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-950/40">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-gray-900 dark:text-white">Spending Behavior Analysis</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Analyze your spending patterns and discover savings opportunities
                </CardDescription>
              </div>
              {spendingState.info?.cached && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" />
                  Cached ({spendingState.info.formattedTime})
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="timeRange" className="text-gray-700 dark:text-gray-300">Time Period</Label>
                  <select
                    id="timeRange"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-yellow-700 dark:text-yellow-300">
                    No transactions found for the selected time period. Please add transactions or select a different time range.
                  </p>
                </div>
              ) : spendingState.loading ? (
                <div className="flex flex-col justify-center items-center h-96 space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing transactions with AI...</p>
                </div>
              ) : spendingState.response ? (
                <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
                  <ReactMarkdown>{spendingState.response}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Click "Analyze Spending" to generate spending insights for this period.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t border-gray-100 dark:border-gray-700/60 pt-4">
              <Button 
                variant="default" 
                onClick={() => handleFetchSpendingAnalysis(true)}
                disabled={spendingState.loading || transactions.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RotateCcw className={`w-4 h-4 mr-1.5 ${spendingState.loading ? "animate-spin" : ""}`} />
                {spendingState.loading ? "Analyzing..." : "Analyze Spending"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-950/40">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-gray-900 dark:text-white">Financial "What-If" Scenarios</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Simulate different financial scenarios to make better decisions
                </CardDescription>
              </div>
              {scenarioState.info?.cached && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" />
                  Cached ({scenarioState.info.formattedTime})
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="scenarioType" className="text-gray-700 dark:text-gray-300">Scenario Type</Label>
                  <select
                    id="scenarioType"
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={scenarioType}
                    onChange={(e) => setScenarioType(e.target.value)}
                  >
                    <option value="career">Career Change</option>
                    <option value="investment">Investment Strategy</option>
                    <option value="purchase">Major Purchase</option>
                  </select>
                </div>
              </div>
              
              <Separator className="my-6 border-gray-200 dark:border-gray-700" />
              
              {/* Career Change Scenario */}
              {scenarioType === "career" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentSalary" className="text-gray-700 dark:text-gray-300">Current Monthly Salary (₹)</Label>
                      <input
                        type="number"
                        id="currentSalary"
                        name="currentSalary"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={careerParams.currentSalary}
                        onChange={handleCareerParamChange}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newSalary" className="text-gray-700 dark:text-gray-300">New Monthly Salary (₹)</Label>
                      <input
                        type="number"
                        id="newSalary"
                        name="newSalary"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={careerParams.newSalary}
                        onChange={handleCareerParamChange}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="yearsToSimulate" className="text-gray-700 dark:text-gray-300">Years to Simulate</Label>
                      <input
                        type="number"
                        id="yearsToSimulate"
                        name="yearsToSimulate"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={careerParams.yearsToSimulate}
                        onChange={handleCareerParamChange}
                        min="1"
                        max="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="annualGrowthRate" className="text-gray-700 dark:text-gray-300">Annual Salary Growth Rate (%)</Label>
                      <input
                        type="number"
                        id="annualGrowthRate"
                        name="annualGrowthRate"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={careerParams.annualGrowthRate}
                        onChange={handleCareerParamChange}
                        min="0"
                        max="30"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Investment Strategy Scenario */}
              {scenarioType === "investment" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentStrategy" className="text-gray-700 dark:text-gray-300">Current Investment Strategy</Label>
                      <select
                        id="currentStrategy"
                        name="currentStrategy"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <Label htmlFor="newStrategy" className="text-gray-700 dark:text-gray-300">New Investment Strategy</Label>
                      <select
                        id="newStrategy"
                        name="newStrategy"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="monthlySavings" className="text-gray-700 dark:text-gray-300">Monthly Investment Amount (₹)</Label>
                      <input
                        type="number"
                        id="monthlySavings"
                        name="monthlySavings"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={investmentParams.monthlySavings}
                        onChange={handleInvestmentParamChange}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearsToSimulate" className="text-gray-700 dark:text-gray-300">Years to Simulate</Label>
                      <input
                        type="number"
                        id="yearsToSimulate"
                        name="yearsToSimulate"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={investmentParams.yearsToSimulate}
                        onChange={handleInvestmentParamChange}
                        min="1"
                        max="30"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Major Purchase Scenario */}
              {scenarioType === "purchase" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="itemType" className="text-gray-700 dark:text-gray-300">Purchase Type</Label>
                      <select
                        id="itemType"
                        name="itemType"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={purchaseParams.itemType}
                        onChange={handlePurchaseParamChange}
                      >
                        <option value="property">Property</option>
                        <option value="vehicle">Vehicle</option>
                        <option value="education">Education</option>
                        <option value="luxury">Luxury Item</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="itemCost" className="text-gray-700 dark:text-gray-300">Total Cost (₹)</Label>
                      <input
                        type="number"
                        id="itemCost"
                        name="itemCost"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={purchaseParams.itemCost}
                        onChange={handlePurchaseParamChange}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="downPayment" className="text-gray-700 dark:text-gray-300">Down Payment (₹)</Label>
                      <input
                        type="number"
                        id="downPayment"
                        name="downPayment"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={purchaseParams.downPayment}
                        onChange={handlePurchaseParamChange}
                        min="0"
                        max={purchaseParams.itemCost}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="loanTermYears" className="text-gray-700 dark:text-gray-300">Loan Term (Years)</Label>
                      <input
                        type="number"
                        id="loanTermYears"
                        name="loanTermYears"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={purchaseParams.loanTermYears}
                        onChange={handlePurchaseParamChange}
                        min="1"
                        max="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="interestRate" className="text-gray-700 dark:text-gray-300">Interest Rate (%)</Label>
                      <input
                        type="number"
                        id="interestRate"
                        name="interestRate"
                        className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={purchaseParams.interestRate}
                        onChange={handlePurchaseParamChange}
                        min="1"
                        max="20"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <Separator className="my-6 border-gray-200 dark:border-gray-700" />
              
              {scenarioState.loading ? (
                <div className="flex flex-col justify-center items-center h-96 space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Simulating scenario with AI...</p>
                </div>
              ) : scenarioState.response ? (
                <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
                  <ReactMarkdown>{scenarioState.response}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Configure your parameters and click "Simulate Scenario" to see projections.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t border-gray-100 dark:border-gray-700/60 pt-4">
              <Button 
                variant="default" 
                onClick={() => handleSimulateScenario(true)}
                disabled={scenarioState.loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {scenarioState.loading ? "Simulating..." : "Simulate Scenario"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Backward Analysis Tab */}
        <TabsContent value="backwardAnalysis" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-950/40">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-gray-900 dark:text-white">Past Financial Decisions Analysis</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Analyze what could have happened differently with past financial decisions
                </CardDescription>
              </div>
              {backwardState.info?.cached && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" />
                  Cached ({backwardState.info.formattedTime})
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {historicalDecisions.map((decision, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/30 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`decisionType-${index}`} className="text-gray-700 dark:text-gray-300">Decision Type</Label>
                        <select
                          id={`decisionType-${index}`}
                          className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={decision.type}
                          onChange={(e) => handleHistoricalDecisionChange(index, 'type', e.target.value)}
                        >
                          <option value="investment">Investment</option>
                          <option value="property">Property</option>
                          <option value="education">Education</option>
                          <option value="career">Career</option>
                          <option value="loan">Loan/Debt</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`amount-${index}`} className="text-gray-700 dark:text-gray-300">Amount (₹)</Label>
                        <input
                          type="number"
                          id={`amount-${index}`}
                          className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={decision.amount}
                          onChange={(e) => handleHistoricalDecisionChange(index, 'amount', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`date-${index}`} className="text-gray-700 dark:text-gray-300">Date (approximate)</Label>
                        <input
                          type="date"
                          id={`date-${index}`}
                          className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={decision.date}
                          onChange={(e) => handleHistoricalDecisionChange(index, 'date', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`outcome-${index}`} className="text-gray-700 dark:text-gray-300">Actual Outcome</Label>
                        <input
                          type="text"
                          id={`outcome-${index}`}
                          className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={decision.outcome}
                          onChange={(e) => handleHistoricalDecisionChange(index, 'outcome', e.target.value)}
                          placeholder="e.g., +8% return, sold at loss, etc."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`description-${index}`} className="text-gray-700 dark:text-gray-300">Description</Label>
                        <textarea
                          id={`description-${index}`}
                          className="w-full p-2 mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={decision.description}
                          onChange={(e) => handleHistoricalDecisionChange(index, 'description', e.target.value)}
                          rows="2"
                          placeholder="Describe the financial decision..."
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <Button 
                          variant="destructive" 
                          onClick={() => removeHistoricalDecision(index)}
                          disabled={historicalDecisions.length <= 1}
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  onClick={addHistoricalDecision}
                  className="w-full border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                >
                  + Add Another Decision
                </Button>
              </div>
              
              <Separator className="my-6 border-gray-200 dark:border-gray-700" />
              
              {backwardState.loading ? (
                <div className="flex flex-col justify-center items-center h-96 space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing past decisions with AI...</p>
                </div>
              ) : backwardState.response ? (
                <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
                  <ReactMarkdown>{backwardState.response}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Add past decisions and click "Analyze Decisions" to generate retrospective insights.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t border-gray-100 dark:border-gray-700/60 pt-4">
              <Button 
                variant="default" 
                onClick={() => handleAnalyzeHistoricalDecisions(true)}
                disabled={backwardState.loading || !historicalDecisions.some(d => d.description && d.amount > 0)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {backwardState.loading ? "Analyzing..." : "Analyze Decisions"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AIAdvisor;