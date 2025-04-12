import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Import components
import IncomeForm from "../components/finances/IncomeForm";
import FixedExpensesForm from "../components/finances/FixedExpensesForm";
import VariableExpensesForm from "../components/finances/VariableExpensesForm";
import InvestmentsForm from "../components/finances/InvestmentsForm";
import LoansForm from "../components/finances/LoansForm";
import FinancialSummary from "../components/finances/FinancialSummary";
import FormTabs from "../components/finances/FormTabs";
import { SuccessAlert, ErrorAlert } from "../components/finances/Notifications";

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
      [name]: value === '' ? 0 : parseFloat(value) || 0
    }));
  };
  
  const handleFixedExpensesChange = (e) => {
    const { name, value } = e.target;
    setFixedExpenses(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseFloat(value) || 0
    }));
  };
  
  const handleVariableExpensesChange = (e) => {
    const { name, value } = e.target;
    setVariableExpenses(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseFloat(value) || 0
    }));
  };
  
  const handleInvestmentsChange = (e) => {
    const { name, value } = e.target;
    setInvestments(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseFloat(value) || 0
    }));
  };
  
  const handleLoansChange = (e) => {
    const { name, value } = e.target;
    setLoans(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseFloat(value) || 0
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

      {formSubmitted && success && <SuccessAlert message="Financial information saved successfully! Redirecting to dashboard..." />}
      {error && <ErrorAlert message={error} />}

      <FinancialSummary 
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        totalFixedExpenses={totalFixedExpenses}
        totalVariableExpenses={totalVariableExpenses}
        monthlySavings={monthlySavings}
        monthlyTax={monthlyTax}
        afterTaxSavings={afterTaxSavings}
        savingsRate={savingsRate}
        afterTaxSavingsRate={afterTaxSavingsRate}
      />

      <div className="bg-white shadow sm:rounded-lg mb-8">
        <FormTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <form onSubmit={handleSubmit}>
          <div className={activeTab === "income" ? "block" : "hidden"}>
            <IncomeForm 
              income={income} 
              handleIncomeChange={handleIncomeChange} 
              totalIncome={totalIncome}
              setActiveTab={setActiveTab}
            />
          </div>

          <div className={activeTab === "fixed-expenses" ? "block" : "hidden"}>
            <FixedExpensesForm 
              fixedExpenses={fixedExpenses} 
              handleFixedExpensesChange={handleFixedExpensesChange} 
              totalFixedExpenses={totalFixedExpenses}
              setActiveTab={setActiveTab}
            />
          </div>

          <div className={activeTab === "variable-expenses" ? "block" : "hidden"}>
            <VariableExpensesForm 
              variableExpenses={variableExpenses} 
              handleVariableExpensesChange={handleVariableExpensesChange} 
              totalVariableExpenses={totalVariableExpenses}
              setActiveTab={setActiveTab}
            />
          </div>

          <div className={activeTab === "investments" ? "block" : "hidden"}>
            <InvestmentsForm 
              investments={investments} 
              handleInvestmentsChange={handleInvestmentsChange} 
              totalInvestments={totalInvestments}
              setActiveTab={setActiveTab}
            />
          </div>

          <div className={activeTab === "loans" ? "block" : "hidden"}>
            <LoansForm 
              loans={loans} 
              handleLoansChange={handleLoansChange} 
              totalLoans={totalLoans}
              setActiveTab={setActiveTab}
              saving={saving}
              // Pass all financial data to LoansForm
              income={income}
              fixedExpenses={fixedExpenses}
              variableExpenses={variableExpenses}
              investments={investments}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default FinanceInput;