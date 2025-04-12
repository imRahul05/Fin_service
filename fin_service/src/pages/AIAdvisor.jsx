import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { 
  getFinancialAdvice, 
  simulateScenario, 
  analyzeSpendingBehavior,
  getBackwardAnalysis 
} from "../services/AIService";
import { formatCurrency } from "../utils/financialUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import ReactMarkdown from 'react-markdown';
import { GoogleGenerativeAI } from "@google/generative-ai";

function AIAdvisor() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [finances, setFinances] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("personalAdvice");
  const [timeRange, setTimeRange] = useState("month");
  const [customPrompt, setCustomPrompt] = useState("");
  
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
        // Load financial data from Firebase
        const docRef = doc(db, "userFinances", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const financeData = docSnap.data().finances;
          setFinances(financeData);
          
          // Initialize scenario parameters with user's data
          if (financeData) {
            const totalIncome = financeData.income ? 
              Object.values(financeData.income).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0;
            
            const totalExpenses = 
              (financeData.fixedExpenses ? Object.values(financeData.fixedExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0) +
              (financeData.variableExpenses ? Object.values(financeData.variableExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0);
            
            const monthlySavings = totalIncome - totalExpenses;
            
            // Update career scenario with current income
            setCareerParams(prev => ({
              ...prev,
              currentSalary: totalIncome
            }));
            
            // Update investment scenario with monthly savings
            setInvestmentParams(prev => ({
              ...prev,
              monthlySavings: monthlySavings > 0 ? monthlySavings : 0
            }));
          }
        }
        
        // Load transactions for spending analysis
        const transactionsRef = collection(db, "transactions");
        
        // Create a filter based on selected time range
        const now = new Date();
        let startDate;
        
        if (timeRange === "month") {
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        } else if (timeRange === "quarter") {
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        } else { // year
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        }
        
        const startDateString = startDate.toISOString().split('T')[0];
        
        let q = query(
          transactionsRef, 
          where("userId", "==", currentUser.uid),
          where("date", ">=", startDateString),
          orderBy("date", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const transactionsData = [];
        
        querySnapshot.forEach((doc) => {
          transactionsData.push({ id: doc.id, ...doc.data() });
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

  // Function to get personalized financial advice
  const getPersonalAdvice = async () => {
    if (!finances) return;
    
    setAiLoading(true);
    setAiResponse("");
    
    try {
      const financialData = {
        income: finances.income ? 
          Object.values(finances.income).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0,
        fixedExpenses: finances.fixedExpenses ? 
          Object.values(finances.fixedExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0,
        variableExpenses: finances.variableExpenses ? 
          Object.values(finances.variableExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0,
        investments: finances.investments,
        loans: finances.loans,
        goals: "" // Could be set by user in a future feature
      };
      
      const advice = await getFinancialAdvice(financialData);
      setAiResponse(advice);
    } catch (error) {
      console.error("Error getting AI advice:", error);
      setAiResponse("Sorry, I couldn't generate financial advice at this moment. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  // Function to analyze spending behavior
  const getSpendingAnalysis = async () => {
    if (transactions.length === 0) {
      setAiResponse("No transaction data available for the selected time period. Please add transactions or select a different time range.");
      return;
    }
    
    setAiLoading(true);
    setAiResponse("");
    
    try {
      const analysis = await analyzeSpendingBehavior(transactions);
      setAiResponse(analysis);
    } catch (error) {
      console.error("Error analyzing spending behavior:", error);
      setAiResponse("Sorry, I couldn't analyze your spending behavior at this moment. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  // Function to simulate financial scenarios
  const simulateFinancialScenario = async () => {
    if (!finances) return;
    
    setAiLoading(true);
    setAiResponse("");
    
    try {
      // Prepare current financial data
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
      setAiResponse(analysis);
    } catch (error) {
      console.error("Error simulating scenario:", error);
      setAiResponse("Sorry, I couldn't simulate this scenario at this moment. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  // Function to analyze past financial decisions
  const analyzeHistoricalDecisions = async () => {
    setAiLoading(true);
    setAiResponse("");
    
    // Filter out empty decisions
    const validDecisions = historicalDecisions.filter(
      decision => decision.description && decision.amount > 0
    );
    
    if (validDecisions.length === 0) {
      setAiResponse("Please enter at least one past financial decision to analyze.");
      setAiLoading(false);
      return;
    }
    
    try {
      const analysis = await getBackwardAnalysis(validDecisions);
      setAiResponse(analysis);
    } catch (error) {
      console.error("Error analyzing historical decisions:", error);
      setAiResponse("Sorry, I couldn't analyze these past decisions at this moment. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  // Function to handle custom prompt submission
  const handleCustomPromptSubmit = async () => {
    if (!customPrompt.trim()) return;
    
    setAiLoading(true);
    setAiResponse("");
    
    try {
      const model = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY).getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Create a prompt that includes the user's question and their financial data
      const prompt = `
        As a financial advisor, answer the following question from a user with this financial profile:
        
        Monthly Income: ₹${finances.income ? Object.values(finances.income).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0}
        Fixed Expenses: ₹${finances.fixedExpenses ? Object.values(finances.fixedExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0}
        Variable Expenses: ₹${finances.variableExpenses ? Object.values(finances.variableExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0) : 0}
        Investments: ${JSON.stringify(finances.investments || {})}
        Loans: ${JSON.stringify(finances.loans || {})}
        
        User's question: "${customPrompt}"
        
        Provide a detailed, helpful response focused on Indian financial context. Format your response in markdown with headings, bullet points, and emphasis where appropriate.
      `;
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      setAiResponse(response.text());
    } catch (error) {
      console.error("Error processing custom prompt:", error);
      setAiResponse("Sorry, I couldn't process your question at this moment. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  // Handle tab change and perform appropriate action
  useEffect(() => {
    if (!loading && finances) {
      if (activeTab === "personalAdvice") {
        getPersonalAdvice();
      } else if (activeTab === "spendingAnalysis") {
        getSpendingAnalysis();
      } else if (activeTab === "scenarios") {
        simulateFinancialScenario();
      } else if (activeTab === "backwardAnalysis") {
        if (historicalDecisions.some(decision => decision.description && decision.amount > 0)) {
          analyzeHistoricalDecisions();
        } else {
          setAiResponse("Enter past financial decisions to analyze what could have happened differently.");
        }
      }
    }
  }, [activeTab, finances, loading, timeRange]);

  // Handle input change for career parameters
  const handleCareerParamChange = (e) => {
    const { name, value } = e.target;
    setCareerParams(prev => ({
      ...prev,
      [name]: name === "yearsToSimulate" || name === "annualGrowthRate" 
        ? parseInt(value) 
        : parseFloat(value)
    }));
  };

  // Handle input change for investment parameters
  const handleInvestmentParamChange = (e) => {
    const { name, value } = e.target;
    setInvestmentParams(prev => ({
      ...prev,
      [name]: name === "yearsToSimulate" ? parseInt(value) : 
              name === "currentStrategy" || name === "newStrategy" ? value :
              parseFloat(value)
    }));
  };

  // Handle input change for purchase parameters
  const handlePurchaseParamChange = (e) => {
    const { name, value } = e.target;
    setPurchaseParams(prev => ({
      ...prev,
      [name]: name === "itemType" ? value : 
              name === "loanTermYears" ? parseInt(value) :
              parseFloat(value)
    }));
  };

  // Handle changes to historical decisions
  const handleHistoricalDecisionChange = (index, field, value) => {
    const newDecisions = [...historicalDecisions];
    newDecisions[index] = {
      ...newDecisions[index],
      [field]: field === "amount" ? parseFloat(value) : value
    };
    setHistoricalDecisions(newDecisions);
  };

  // Add a new historical decision form
  const addHistoricalDecision = () => {
    setHistoricalDecisions([
      ...historicalDecisions,
      { type: "investment", description: "", amount: 0, date: "", outcome: "" }
    ]);
  };

  // Remove a historical decision
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
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            No financial data found
          </h2>
          <p className="mt-4 text-lg text-gray-500">
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
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            AI Financial Advisor
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Get personalized financial guidance powered by AI
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Ask a Financial Question</CardTitle>
            <CardDescription>
              Get personalized answers to your specific financial questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <textarea
                className="flex-1 p-4 border rounded-md min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ask me anything about your finances, investments, or financial planning..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="default"
              onClick={handleCustomPromptSubmit}
              disabled={aiLoading || !customPrompt.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Answer
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="personalAdvice" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="personalAdvice">Personal Advice</TabsTrigger>
          <TabsTrigger value="spendingAnalysis">Spending Analysis</TabsTrigger>
          <TabsTrigger value="scenarios">What-If Scenarios</TabsTrigger>
          <TabsTrigger value="backwardAnalysis">Backward Analysis</TabsTrigger>
        </TabsList>
        
        {/* Personal Advice Tab */}
        <TabsContent value="personalAdvice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Financial Advice</CardTitle>
              <CardDescription>
                Get tailored advice based on your current financial situation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/finance-input"}
              >
                Update Financial Info
              </Button>
              <Button 
                variant="default" 
                onClick={getPersonalAdvice}
                disabled={aiLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Refresh Advice
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Spending Analysis Tab */}
        <TabsContent value="spendingAnalysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Behavior Analysis</CardTitle>
              <CardDescription>
                Analyze your spending patterns and discover savings opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="timeRange">Time Period</Label>
                  <select
                    id="timeRange"
                    className="w-full p-2 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="text-center p-8 bg-yellow-50 rounded-md">
                  <p className="text-yellow-700">
                    No transactions found for the selected time period. Please add transactions or select a different time range.
                  </p>
                </div>
              ) : aiLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="default" 
                onClick={getSpendingAnalysis}
                disabled={aiLoading || transactions.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Analyze Spending
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial "What-If" Scenarios</CardTitle>
              <CardDescription>
                Simulate different financial scenarios to make better decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="scenarioType">Scenario Type</Label>
                  <select
                    id="scenarioType"
                    className="w-full p-2 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={scenarioType}
                    onChange={(e) => setScenarioType(e.target.value)}
                  >
                    <option value="career">Career Change</option>
                    <option value="investment">Investment Strategy</option>
                    <option value="purchase">Major Purchase</option>
                  </select>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* Career Change Scenario */}
              {scenarioType === "career" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentSalary">Current Monthly Salary (₹)</Label>
                      <input
                        type="number"
                        id="currentSalary"
                        name="currentSalary"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={careerParams.currentSalary}
                        onChange={handleCareerParamChange}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newSalary">New Monthly Salary (₹)</Label>
                      <input
                        type="number"
                        id="newSalary"
                        name="newSalary"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={careerParams.newSalary}
                        onChange={handleCareerParamChange}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="yearsToSimulate">Years to Simulate</Label>
                      <input
                        type="number"
                        id="yearsToSimulate"
                        name="yearsToSimulate"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={careerParams.yearsToSimulate}
                        onChange={handleCareerParamChange}
                        min="1"
                        max="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="annualGrowthRate">Annual Salary Growth Rate (%)</Label>
                      <input
                        type="number"
                        id="annualGrowthRate"
                        name="annualGrowthRate"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <Label htmlFor="currentStrategy">Current Investment Strategy</Label>
                      <select
                        id="currentStrategy"
                        name="currentStrategy"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <Label htmlFor="newStrategy">New Investment Strategy</Label>
                      <select
                        id="newStrategy"
                        name="newStrategy"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <Label htmlFor="monthlySavings">Monthly Investment Amount (₹)</Label>
                      <input
                        type="number"
                        id="monthlySavings"
                        name="monthlySavings"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={investmentParams.monthlySavings}
                        onChange={handleInvestmentParamChange}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearsToSimulate">Years to Simulate</Label>
                      <input
                        type="number"
                        id="yearsToSimulate"
                        name="yearsToSimulate"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <Label htmlFor="itemType">Purchase Type</Label>
                      <select
                        id="itemType"
                        name="itemType"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <Label htmlFor="itemCost">Total Cost (₹)</Label>
                      <input
                        type="number"
                        id="itemCost"
                        name="itemCost"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={purchaseParams.itemCost}
                        onChange={handlePurchaseParamChange}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="downPayment">Down Payment (₹)</Label>
                      <input
                        type="number"
                        id="downPayment"
                        name="downPayment"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={purchaseParams.downPayment}
                        onChange={handlePurchaseParamChange}
                        min="0"
                        max={purchaseParams.itemCost}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="loanTermYears">Loan Term (Years)</Label>
                      <input
                        type="number"
                        id="loanTermYears"
                        name="loanTermYears"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={purchaseParams.loanTermYears}
                        onChange={handlePurchaseParamChange}
                        min="1"
                        max="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <input
                        type="number"
                        id="interestRate"
                        name="interestRate"
                        className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              
              <Separator className="my-6" />
              
              {aiLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="default" 
                onClick={simulateFinancialScenario}
                disabled={aiLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Simulate Scenario
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Backward Analysis Tab */}
        <TabsContent value="backwardAnalysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Financial Decisions Analysis</CardTitle>
              <CardDescription>
                Analyze what could have happened differently with past financial decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {historicalDecisions.map((decision, index) => (
                  <div key={index} className="p-4 border rounded-md bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`decisionType-${index}`}>Decision Type</Label>
                        <select
                          id={`decisionType-${index}`}
                          className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <Label htmlFor={`amount-${index}`}>Amount (₹)</Label>
                        <input
                          type="number"
                          id={`amount-${index}`}
                          className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={decision.amount}
                          onChange={(e) => handleHistoricalDecisionChange(index, 'amount', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`date-${index}`}>Date (approximate)</Label>
                        <input
                          type="date"
                          id={`date-${index}`}
                          className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={decision.date}
                          onChange={(e) => handleHistoricalDecisionChange(index, 'date', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`outcome-${index}`}>Actual Outcome</Label>
                        <input
                          type="text"
                          id={`outcome-${index}`}
                          className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={decision.outcome}
                          onChange={(e) => handleHistoricalDecisionChange(index, 'outcome', e.target.value)}
                          placeholder="e.g., +8% return, sold at loss, etc."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`description-${index}`}>Description</Label>
                        <textarea
                          id={`description-${index}`}
                          className="w-full p-2 mt-1 rounded-md border bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full"
                >
                  + Add Another Decision
                </Button>
              </div>
              
              <Separator className="my-6" />
              
              {aiLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="default" 
                onClick={analyzeHistoricalDecisions}
                disabled={aiLoading || !historicalDecisions.some(d => d.description && d.amount > 0)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Analyze Decisions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AIAdvisor;