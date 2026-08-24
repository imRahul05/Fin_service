/**
 * Financial utility functions for calculations
 */

// Calculate monthly savings
export const calculateMonthlySavings = (income, expenses) => {
  return income - expenses;
};

// Calculate debt-to-income ratio
export const calculateDebtToIncomeRatio = (monthlyDebtPayments, grossMonthlyIncome) => {
  return (monthlyDebtPayments / grossMonthlyIncome) * 100;
};

// Calculate net worth
export const calculateNetWorth = (assets, liabilities) => {
  const totalAssets = Object.values(assets).reduce((sum, value) => sum + value, 0);
  const totalLiabilities = Object.values(liabilities).reduce((sum, value) => sum + value, 0);
  return totalAssets - totalLiabilities;
};

/**
 * Universal Financial Aggregator
 * Centralizes aggregation calculations across the entire application (DRY compliance).
 */
export const aggregateFinancials = (finances) => {
  if (!finances) {
    return {
      totalIncome: 0,
      totalFixedExpenses: 0,
      totalVariableExpenses: 0,
      totalExpenses: 0,
      totalInvestments: 0,
      totalLoans: 0,
      monthlySavings: 0,
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

  const totalIncome = Object.values(finances.income || {}).reduce((sum, val) => sum + Number(val || 0), 0);
  const totalFixedExpenses = Object.values(finances.fixedExpenses || {}).reduce((sum, val) => sum + Number(val || 0), 0);
  const totalVariableExpenses = Object.values(finances.variableExpenses || {}).reduce((sum, val) => sum + Number(val || 0), 0);
  const totalInvestments = Object.values(finances.investments || {}).reduce((sum, val) => sum + Number(val || 0), 0);
  const totalLoans = Object.values(finances.loans || {}).reduce((sum, val) => sum + Number(val || 0), 0);
  
  const totalExpenses = totalFixedExpenses + totalVariableExpenses;
  const monthlySavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (monthlySavings / totalIncome) * 100 : 0;
  const debtToIncomeRatio = totalIncome > 0 ? (totalLoans / totalIncome) * 100 : 0;
  const netWorth = totalInvestments - totalLoans;

  const incomeSources = finances.income || {};
  const expenseCategories = {};

  if (finances.fixedExpenses) {
    Object.entries(finances.fixedExpenses).forEach(([category, amount]) => {
      if (Number(amount) > 0) expenseCategories[`Fixed: ${category}`] = Number(amount);
    });
  }

  if (finances.variableExpenses) {
    Object.entries(finances.variableExpenses).forEach(([category, amount]) => {
      if (Number(amount) > 0) expenseCategories[`Variable: ${category}`] = Number(amount);
    });
  }

  return {
    totalIncome,
    totalFixedExpenses,
    totalVariableExpenses,
    totalExpenses,
    totalInvestments,
    totalLoans,
    monthlySavings,
    savingsRate,
    debtToIncomeRatio,
    netWorth,
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
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
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