import { useState, useEffect } from "react";
import { useFinances } from "../hooks/useFinances";
import { useNavigate } from "react-router-dom";

// Import components
import IncomeForm from "../components/finances/IncomeForm";
import FixedExpensesForm from "../components/finances/FixedExpensesForm";
import VariableExpensesForm from "../components/finances/VariableExpensesForm";
import InvestmentsForm from "../components/finances/InvestmentsForm";
import LoansForm from "../components/finances/LoansForm";
import FinancialSummary from "../components/finances/FinancialSummary";
import FormTabs from "../components/finances/FormTabs";
import ReceiptScannerModal from "../components/finances/ReceiptScannerModal";
import { SuccessAlert, ErrorAlert } from "../components/finances/Notifications";
import { calculateNewRegimeTax } from "../utils/taxCalculator";
import { Sparkles, Camera, ArrowRight } from "lucide-react";

function FinanceInput() {
  const { finances, loading, saving, saveFinances, addTransaction } = useFinances();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("income");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
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

  // Populate from active finances (Firestore or Guest Sandbox)
  useEffect(() => {
    if (finances) {
      if (finances.income) setIncome(finances.income);
      if (finances.fixedExpenses) setFixedExpenses(finances.fixedExpenses);
      if (finances.variableExpenses) setVariableExpenses(finances.variableExpenses);
      if (finances.investments) setInvestments(finances.investments);
      if (finances.loans) setLoans(finances.loans);
    }
  }, [finances]);
  
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

  const handleReceiptScanned = async (tx) => {
    await addTransaction(tx);
    // Optionally update matching variable expense category
    const cat = (tx.category || "").toLowerCase();
    if (cat.includes("grocer")) {
      setVariableExpenses(prev => ({ ...prev, groceries: prev.groceries + tx.amount }));
    } else if (cat.includes("din") || cat.includes("food")) {
      setVariableExpenses(prev => ({ ...prev, dining: prev.dining + tx.amount }));
    } else if (cat.includes("transport") || cat.includes("fuel") || cat.includes("travel")) {
      setVariableExpenses(prev => ({ ...prev, transportation: prev.transportation + tx.amount }));
    }
    setSuccess(true);
    setFormSubmitted(true);
    setTimeout(() => setSuccess(false), 4000);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setError("");
    setSuccess(false);
    
    try {
      const financialData = {
        income,
        fixedExpenses,
        variableExpenses,
        investments,
        loans,
        goals: finances?.goals || "",
      };
      
      const ok = await saveFinances(financialData);
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      } else {
        setError("Failed to save financial information.");
      }
    } catch (err) {
      console.error("Error saving finances:", err);
      setError("Failed to save financial information: " + (err.message || "Unknown error"));
    }
  };
  
  const totalIncome = Object.values(income).reduce((sum, val) => sum + val, 0);
  const totalFixedExpenses = Object.values(fixedExpenses).reduce((sum, val) => sum + val, 0);
  const totalVariableExpenses = Object.values(variableExpenses).reduce((sum, val) => sum + val, 0);
  const totalInvestments = Object.values(investments).reduce((sum, val) => sum + val, 0);
  const totalLoans = Object.values(loans).reduce((sum, val) => sum + val, 0);
  const totalExpenses = totalFixedExpenses + totalVariableExpenses;
  const monthlySavings = totalIncome - totalExpenses;
  
  const annualSalary = (income.salary || 0) * 12;
  const taxResult = calculateNewRegimeTax(annualSalary);
  const monthlyTax = taxResult.totalTax / 12;
  const afterTaxIncome = totalIncome - monthlyTax;
  const afterTaxSavings = afterTaxIncome - totalExpenses;
  
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
      
      {/* Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddTransaction={handleReceiptScanned}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Financial Information
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter your financial details to get personalized insights and analysis
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition"
        >
          <Camera className="w-4 h-4" />
          <span>Scan Receipt / UPI (AI OCR)</span>
        </button>
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

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-950/40 rounded-xl mb-8 overflow-hidden transition-colors">
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