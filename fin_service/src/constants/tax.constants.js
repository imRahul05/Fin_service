/**
 * Official Indian Income Tax Slabs & Parameters for FY 2024-25 & FY 2025-26
 */

export const TAX_CONSTANTS = {
  // New Tax Regime (Section 115BAC)
  NEW_REGIME: {
    name: "New Tax Regime (Default)",
    standardDeduction: 75000, // Budget 2024 revised standard deduction
    rebateLimit: 700000, // Section 87A full rebate if taxable income <= 7L
    slabs: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 0.05 },
      { min: 700000, max: 1000000, rate: 0.10 },
      { min: 1000000, max: 1200000, rate: 0.15 },
      { min: 1200000, max: 1500000, rate: 0.20 },
      { min: 1500000, max: Infinity, rate: 0.30 },
    ],
  },

  // Old Tax Regime (With itemized exemptions & Chapter VI-A deductions)
  OLD_REGIME: {
    name: "Old Tax Regime",
    standardDeduction: 50000,
    rebateLimit: 500000, // Section 87A rebate if taxable income <= 5L
    slabs: [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 0.05 },
      { min: 500000, max: 1000000, rate: 0.20 },
      { min: 1000000, max: Infinity, rate: 0.30 },
    ],
    limits: {
      section80C: 150000,     // PPF, EPF, ELSS, Life Insurance, Principal on Home Loan
      section80D_self: 25000, // Health Insurance (Self & Family)
      section80D_parents: 50000, // Senior Citizen Parents Health Insurance
      section80CCD_1B: 50000, // NPS Additional Deduction
      section24_home_loan: 200000, // Interest on Housing Loan (Self-occupied)
    },
  },

  HEALTH_AND_EDUCATION_CESS: 0.04, // 4% Cess on income tax
};
