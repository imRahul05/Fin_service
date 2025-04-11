import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/financialUtils";

// Indian salary income tax brackets for 2024-25 (simplified)
const TAX_BRACKETS = [
  { limit: 300000, rate: 0 },     // 0-3L: Nil
  { limit: 600000, rate: 0.05 },  // 3L-6L: 5%
  { limit: 900000, rate: 0.1 },   // 6L-9L: 10%
  { limit: 1200000, rate: 0.15 }, // 9L-12L: 15%
  { limit: 1500000, rate: 0.2 },  // 12L-15L: 20%
  { limit: Infinity, rate: 0.3 }, // Above 15L: 30%
];

function FinanceInput() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("income");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Form data state
  const [income, setIncome] = useState({
    salary: 0,
    business: 0,
    rental: 0,
    investments: 0,
    other: 0
  });
  
  const [fixedExpenses, setFixedExpenses] = useState({
    rent: 0,
    mortgage: 0,
    utilities: 0,
    insurance: 0,
    subscriptions: 0,
    education: 0,
    other: 0
  });
  
  const [variableExpenses, setVariableExpenses] = useState({
    groceries: 0,
    dining: 0,
    entertainment: 0,
    shopping: 0,
    transportation: 0,
    healthcare: 0,
    travel: 0,
    other: 0
  });
  
  const [investments, setInvestments] = useState({
    equity: 0,
    mutual_funds: 0,
    fd: 0,
    ppf: 0,
    epf: 0,
    nps: 0,
    gold: 0,
    real_estate: 0,
    crypto: 0,
    other: 0
  });
  
  const [loans, setLoans] = useState({
    home: 0,
    car: 0,
    education: 0,
    personal: 0,
    credit_card: 0,
    other: 0
  });
  
  // Load user's financial data when component mounts
  useEffect(() => {
    async function loadUserFinances() {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const docRef = doc(db, "userFinances", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data().finances;
          
          if (data.income) setIncome(data.income);
          if (data.fixedExpenses) setFixedExpenses(data.fixedExpenses);
          if (data.variableExpenses) setVariableExpenses(data.variableExpenses);
          if (data.investments) setInvestments(data.investments);
          if (data.loans) setLoans(data.loans);
        }
      } catch (error) {
        console.error("Error loading finances:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserFinances();
  }, [currentUser]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError("You must be logged in to save your financial data");
      return;
    }
    
    setSaving(true);
    setError("");
    
    try {
      const financesData = {
        income,
        fixedExpenses,
        variableExpenses,
        investments,
        loans,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, "userFinances", currentUser.uid), {
        finances: financesData
      });
      
      setSuccess(true);
      setFormSubmitted(true);
      
      // Navigate to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error saving finances:", error);
      setError("Failed to save your financial data. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  
  // Handle numeric input changes for different financial categories
  const handleIncomeChange = (e) => {
    const { name, value } = e.target;
    setIncome(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  const handleFixedExpensesChange = (e) => {
    const { name, value } = e.target;
    setFixedExpenses(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  const handleVariableExpensesChange = (e) => {
    const { name, value } = e.target;
    setVariableExpenses(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  const handleInvestmentsChange = (e) => {
    const { name, value } = e.target;
    setInvestments(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  const handleLoansChange = (e) => {
    const { name, value } = e.target;
    setLoans(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  // Calculate totals for each category
  const totalIncome = Object.values(income).reduce((sum, val) => sum + val, 0);
  const totalFixedExpenses = Object.values(fixedExpenses).reduce((sum, val) => sum + val, 0);
  const totalVariableExpenses = Object.values(variableExpenses).reduce((sum, val) => sum + val, 0);
  const totalInvestments = Object.values(investments).reduce((sum, val) => sum + val, 0);
  const totalLoans = Object.values(loans).reduce((sum, val) => sum + val, 0);
  const totalExpenses = totalFixedExpenses + totalVariableExpenses;
  
  // Calculate monthly savings
  const monthlySavings = totalIncome - totalExpenses;
  
  // Calculate approximate income tax (simplified calculation)
  const calculateIncomeTax = (annualIncome) => {
    let tax = 0;
    let remainingIncome = annualIncome;
    
    for (const bracket of TAX_BRACKETS) {
      if (remainingIncome <= 0) break;
      
      const taxableInThisBracket = Math.min(remainingIncome, bracket.limit);
      tax += taxableInThisBracket * bracket.rate;
      remainingIncome -= taxableInThisBracket;
    }
    
    return tax / 12; // Monthly tax amount
  };
  
  const annualSalary = income.salary * 12;
  const monthlyTax = calculateIncomeTax(annualSalary);
  const afterTaxIncome = totalIncome - monthlyTax;
  const afterTaxSavings = afterTaxIncome - totalExpenses;
  
  // Calculate savings rate
  const savingsRate = totalIncome > 0 ? (monthlySavings / totalIncome) * 100 : 0;
  const afterTaxSavingsRate = afterTaxIncome > 0 ? (afterTaxSavings / afterTaxIncome) * 100 : 0;
  
  // Input field component for reuse
  const InputField = ({ label, name, value, onChange, type = "number", min = "0", step = "1", prefix = "₹" }) => (
    <div className="sm:col-span-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          type={type}
          name={name}
          id={name}
          min={min}
          step={step}
          value={value}
          onChange={onChange}
          className={`${prefix ? 'pl-8' : 'pl-3'} block w-full pr-3 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
        />
      </div>
    </div>
  );
  
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
            Financial Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter your financial details to get personalized insights and analysis
          </p>
        </div>
      </div>

      {formSubmitted && success && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Financial information saved successfully! Redirecting to dashboard...
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 bg-blue-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Monthly Financial Summary
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Based on the information you've provided
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <p className="text-xl font-semibold text-blue-600">{formatCurrency(totalIncome)}</p>
              <p className="text-xs text-gray-500">Before Tax: {formatCurrency(monthlyTax)} in estimated taxes</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-xl font-semibold text-red-600">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-gray-500">Fixed: {formatCurrency(totalFixedExpenses)}, Variable: {formatCurrency(totalVariableExpenses)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500">Monthly Savings</p>
              <p className={`text-xl font-semibold ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlySavings)}
              </p>
              <p className="text-xs text-gray-500">Savings Rate: {savingsRate.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500">After-Tax Savings</p>
              <p className={`text-xl font-semibold ${afterTaxSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(afterTaxSavings)}
              </p>
              <p className="text-xs text-gray-500">After-Tax Rate: {afterTaxSavingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form tabs */}
      <div className="bg-white shadow sm:rounded-lg mb-8">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="income">Income</option>
            <option value="fixed-expenses">Fixed Expenses</option>
            <option value="variable-expenses">Variable Expenses</option>
            <option value="investments">Investments</option>
            <option value="loans">Loans</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("income")}
                className={`${
                  activeTab === "income"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Income
              </button>
              <button
                onClick={() => setActiveTab("fixed-expenses")}
                className={`${
                  activeTab === "fixed-expenses"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Fixed Expenses
              </button>
              <button
                onClick={() => setActiveTab("variable-expenses")}
                className={`${
                  activeTab === "variable-expenses"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Variable Expenses
              </button>
              <button
                onClick={() => setActiveTab("investments")}
                className={`${
                  activeTab === "investments"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Investments
              </button>
              <button
                onClick={() => setActiveTab("loans")}
                className={`${
                  activeTab === "loans"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Loans
              </button>
            </nav>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Income Section */}
          <div className={activeTab === "income" ? "block" : "hidden"}>
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Income</h3>
              <p className="mt-1 text-sm text-gray-500">Enter all your sources of monthly income</p>
              
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <InputField label="Salary" name="salary" value={income.salary} onChange={handleIncomeChange} />
                <InputField label="Business Income" name="business" value={income.business} onChange={handleIncomeChange} />
                <InputField label="Rental Income" name="rental" value={income.rental} onChange={handleIncomeChange} />
                <InputField label="Investment Income" name="investments" value={income.investments} onChange={handleIncomeChange} />
                <InputField label="Other Income" name="other" value={income.other} onChange={handleIncomeChange} />
              </div>
              
              <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-900">Total Monthly Income: <span className="font-bold">{formatCurrency(totalIncome)}</span></p>
                <button
                  type="button"
                  onClick={() => setActiveTab("fixed-expenses")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next: Fixed Expenses
                </button>
              </div>
            </div>
          </div>

          {/* Fixed Expenses Section */}
          <div className={activeTab === "fixed-expenses" ? "block" : "hidden"}>
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Fixed Expenses</h3>
              <p className="mt-1 text-sm text-gray-500">Enter your recurring monthly expenses</p>
              
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <InputField label="Rent" name="rent" value={fixedExpenses.rent} onChange={handleFixedExpensesChange} />
                <InputField label="Mortgage EMI" name="mortgage" value={fixedExpenses.mortgage} onChange={handleFixedExpensesChange} />
                <InputField label="Utilities (Electricity, Water, etc.)" name="utilities" value={fixedExpenses.utilities} onChange={handleFixedExpensesChange} />
                <InputField label="Insurance Premiums" name="insurance" value={fixedExpenses.insurance} onChange={handleFixedExpensesChange} />
                <InputField label="Subscriptions (OTT, etc.)" name="subscriptions" value={fixedExpenses.subscriptions} onChange={handleFixedExpensesChange} />
                <InputField label="Education (School/Tuition Fees)" name="education" value={fixedExpenses.education} onChange={handleFixedExpensesChange} />
                <InputField label="Other Fixed Expenses" name="other" value={fixedExpenses.other} onChange={handleFixedExpensesChange} />
              </div>
              
              <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-900">Total Fixed Expenses: <span className="font-bold">{formatCurrency(totalFixedExpenses)}</span></p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("income")}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("variable-expenses")}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next: Variable Expenses
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Variable Expenses Section */}
          <div className={activeTab === "variable-expenses" ? "block" : "hidden"}>
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Variable Expenses</h3>
              <p className="mt-1 text-sm text-gray-500">Enter your average monthly spending in each category</p>
              
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <InputField label="Groceries" name="groceries" value={variableExpenses.groceries} onChange={handleVariableExpensesChange} />
                <InputField label="Dining Out" name="dining" value={variableExpenses.dining} onChange={handleVariableExpensesChange} />
                <InputField label="Entertainment" name="entertainment" value={variableExpenses.entertainment} onChange={handleVariableExpensesChange} />
                <InputField label="Shopping (Clothing, etc.)" name="shopping" value={variableExpenses.shopping} onChange={handleVariableExpensesChange} />
                <InputField label="Transportation (Fuel, Taxi, etc.)" name="transportation" value={variableExpenses.transportation} onChange={handleVariableExpensesChange} />
                <InputField label="Healthcare (Medical, Medicine)" name="healthcare" value={variableExpenses.healthcare} onChange={handleVariableExpensesChange} />
                <InputField label="Travel" name="travel" value={variableExpenses.travel} onChange={handleVariableExpensesChange} />
                <InputField label="Other Variable Expenses" name="other" value={variableExpenses.other} onChange={handleVariableExpensesChange} />
              </div>
              
              <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-900">Total Variable Expenses: <span className="font-bold">{formatCurrency(totalVariableExpenses)}</span></p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("fixed-expenses")}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("investments")}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next: Investments
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Investments Section */}
          <div className={activeTab === "investments" ? "block" : "hidden"}>
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Investments</h3>
              <p className="mt-1 text-sm text-gray-500">Enter your monthly contribution to each investment type</p>
              
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <InputField label="Equity/Stocks" name="equity" value={investments.equity} onChange={handleInvestmentsChange} />
                <InputField label="Mutual Funds/SIPs" name="mutual_funds" value={investments.mutual_funds} onChange={handleInvestmentsChange} />
                <InputField label="Fixed Deposits" name="fd" value={investments.fd} onChange={handleInvestmentsChange} />
                <InputField label="PPF (Public Provident Fund)" name="ppf" value={investments.ppf} onChange={handleInvestmentsChange} />
                <InputField label="EPF (Employee Provident Fund)" name="epf" value={investments.epf} onChange={handleInvestmentsChange} />
                <InputField label="NPS (National Pension Scheme)" name="nps" value={investments.nps} onChange={handleInvestmentsChange} />
                <InputField label="Gold/Silver" name="gold" value={investments.gold} onChange={handleInvestmentsChange} />
                <InputField label="Real Estate" name="real_estate" value={investments.real_estate} onChange={handleInvestmentsChange} />
                <InputField label="Cryptocurrency" name="crypto" value={investments.crypto} onChange={handleInvestmentsChange} />
                <InputField label="Other Investments" name="other" value={investments.other} onChange={handleInvestmentsChange} />
              </div>
              
              <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-900">Total Monthly Investments: <span className="font-bold">{formatCurrency(totalInvestments)}</span></p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("variable-expenses")}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("loans")}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next: Loans
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loans Section */}
          <div className={activeTab === "loans" ? "block" : "hidden"}>
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Loan Repayments</h3>
              <p className="mt-1 text-sm text-gray-500">Enter your monthly EMIs and other debt payments</p>
              
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <InputField label="Home Loan EMI" name="home" value={loans.home} onChange={handleLoansChange} />
                <InputField label="Car Loan EMI" name="car" value={loans.car} onChange={handleLoansChange} />
                <InputField label="Education Loan EMI" name="education" value={loans.education} onChange={handleLoansChange} />
                <InputField label="Personal Loan EMI" name="personal" value={loans.personal} onChange={handleLoansChange} />
                <InputField label="Credit Card Payments" name="credit_card" value={loans.credit_card} onChange={handleLoansChange} />
                <InputField label="Other Loan Payments" name="other" value={loans.other} onChange={handleLoansChange} />
              </div>
              
              <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-900">Total Monthly Loan Payments: <span className="font-bold">{formatCurrency(totalLoans)}</span></p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("investments")}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {saving ? 'Saving...' : 'Save and Continue'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FinanceInput;