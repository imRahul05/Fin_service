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