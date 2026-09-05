/**
 * Financial utility functions for calculations
 */

// Calculate monthly savings
export const calculateMonthlySavings = (income, expenses) => {
  const inc = Number(income);
  const exp = Number(expenses);
  return (Number.isFinite(inc) ? inc : 0) - (Number.isFinite(exp) ? exp : 0);
};

// Calculate debt-to-income ratio
export const calculateDebtToIncomeRatio = (monthlyDebtPayments, grossMonthlyIncome) => {
  const income = Number(grossMonthlyIncome);
  if (!Number.isFinite(income) || income <= 0) return 0;
  const debt = Number(monthlyDebtPayments);
  if (!Number.isFinite(debt) || debt <= 0) return 0;
  return (debt / income) * 100;
};

// Calculate net worth
export const calculateNetWorth = (assets = {}, liabilities = {}) => {
  const totalAssets = Object.values(assets || {}).reduce((sum, value) => {
    const num = Number(value);
    return sum + (Number.isFinite(num) ? num : 0);
  }, 0);
  const totalLiabilities = Object.values(liabilities || {}).reduce((sum, value) => {
    const num = Number(value);
    return sum + (Number.isFinite(num) ? num : 0);
  }, 0);
  return totalAssets - totalLiabilities;
};

/**
 * Universal Financial Aggregator
 * Centralizes aggregation calculations across the entire application (DRY compliance).
 */
export const aggregateFinancials = (finances) => {
  if (!finances || typeof finances !== "object") {
    return {
      totalIncome: 0,
      income: 0,
      totalFixedExpenses: 0,
      totalVariableExpenses: 0,
      totalExpenses: 0,
      expenses: 0,
      totalInvestments: 0,
      investmentsTotal: 0,
      totalLoans: 0,
      loansTotal: 0,
      monthlySavings: 0,
      savings: 0,
      savingsRate: 0,
      debtToIncomeRatio: 0,
      netWorth: 0,
      incomeSources: {},
      expenseCategories: {},
      expenseBreakdown: {
        'Fixed Expenses': 0,
        'Variable Expenses': 0,
        'Loan Payments': 0,
      },
    };
  }

  const sumSafe = (obj) => {
    if (!obj || typeof obj !== "object") return 0;
    return Object.values(obj).reduce((sum, val) => {
      const num = Number(val);
      return sum + (Number.isFinite(num) ? num : 0);
    }, 0);
  };

  const totalIncome = sumSafe(finances.income);
  const totalFixedExpenses = sumSafe(finances.fixedExpenses);
  const totalVariableExpenses = sumSafe(finances.variableExpenses);
  const totalInvestments = sumSafe(finances.investments);
  const totalLoans = sumSafe(finances.loans);
  
  const totalExpenses = totalFixedExpenses + totalVariableExpenses;
  const monthlySavings = calculateMonthlySavings(totalIncome, totalExpenses);
  const savingsRate = totalIncome > 0 ? (monthlySavings / totalIncome) * 100 : 0;
  const debtToIncomeRatio = calculateDebtToIncomeRatio(totalLoans, totalIncome);
  const netWorth = totalInvestments - totalLoans;

  const incomeSources = finances.income || {};
  const expenseCategories = {};

  if (finances.fixedExpenses && typeof finances.fixedExpenses === "object") {
    Object.entries(finances.fixedExpenses).forEach(([category, amount]) => {
      const num = Number(amount);
      if (Number.isFinite(num) && num > 0) expenseCategories[`Fixed: ${category}`] = num;
    });
  }

  if (finances.variableExpenses && typeof finances.variableExpenses === "object") {
    Object.entries(finances.variableExpenses).forEach(([category, amount]) => {
      const num = Number(amount);
      if (Number.isFinite(num) && num > 0) expenseCategories[`Variable: ${category}`] = num;
    });
  }

  return {
    totalIncome,
    income: totalIncome,
    totalFixedExpenses,
    totalVariableExpenses,
    totalExpenses,
    expenses: totalExpenses,
    totalInvestments,
    investmentsTotal: totalInvestments,
    totalLoans,
    loansTotal: totalLoans,
    monthlySavings,
    savings: monthlySavings,
    savingsRate: Number.isFinite(savingsRate) ? savingsRate : 0,
    debtToIncomeRatio: Number.isFinite(debtToIncomeRatio) ? debtToIncomeRatio : 0,
    netWorth: Number.isFinite(netWorth) ? netWorth : 0,
    incomeSources,
    expenseCategories,
    expenseBreakdown: {
      'Fixed Expenses': totalFixedExpenses,
      'Variable Expenses': totalVariableExpenses,
      'Loan Payments': totalLoans,
    },
  };
};

// Format currency in INR
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num) || amount === null || amount === undefined) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

// Calculate future value of investment
export const calculateFutureValue = (principal, monthlyContribution, annualRate, years) => {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  
  let futureValue = principal;
  
  for (let i = 0; i < months; i++) {
    futureValue = (futureValue + monthlyContribution) * (1 + monthlyRate);
  }
  
  return Math.round(futureValue);
};

// Calculate EMI
export const calculateEMI = (principal, annualInterestRate, tenureInMonths) => {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const emi = principal * monthlyInterestRate * 
              Math.pow(1 + monthlyInterestRate, tenureInMonths) / 
              (Math.pow(1 + monthlyInterestRate, tenureInMonths) - 1);
  
  return Math.round(emi);
};

// Calculate tax benefits for Indian investments
export const calculateSection80CTaxBenefits = (investments, taxSlab) => {
  // Sum of all eligible 80C investments (up to 1.5 lakhs)
  const totalEligibleInvestments = Math.min(
    150000,
    (investments.ppf || 0) + 
    (investments.elss || 0) + 
    (investments.lifeInsurance || 0) + 
    (investments.epf || 0) + 
    (investments.nps || 0)
  );
  
  // Tax rates based on slabs (simplified)
  let taxRate;
  switch(taxSlab) {
    case "0-2.5L": taxRate = 0; break;
    case "2.5-5L": taxRate = 5; break;
    case "5-7.5L": taxRate = 10; break;
    case "7.5-10L": taxRate = 15; break;
    case "10-12.5L": taxRate = 20; break;
    case "12.5-15L": taxRate = 25; break;
    case "15L+": taxRate = 30; break;
    default: taxRate = 20;
  }
  
  return Math.round(totalEligibleInvestments * taxRate / 100);
};