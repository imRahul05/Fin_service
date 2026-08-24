import { TAX_CONSTANTS } from "../constants/tax.constants";

/**
 * Calculates Income Tax under the New Tax Regime (Section 115BAC)
 * 
 * @param {number} grossIncome - Annual gross taxable income
 * @returns {Object} Tax calculation details
 */
export function calculateNewRegimeTax(grossIncome) {
  const standardDeduction = TAX_CONSTANTS.NEW_REGIME.standardDeduction;
  const taxableIncome = Math.max(0, grossIncome - standardDeduction);

  // Section 87A rebate if taxable income <= 7 Lakhs
  if (taxableIncome <= TAX_CONSTANTS.NEW_REGIME.rebateLimit) {
    return {
      grossIncome,
      standardDeduction,
      taxableIncome,
      baseTax: 0,
      cess: 0,
      totalTax: 0,
      effectiveRate: 0,
      slabBreakdown: [],
    };
  }

  let baseTax = 0;
  const slabBreakdown = [];

  for (const slab of TAX_CONSTANTS.NEW_REGIME.slabs) {
    if (taxableIncome > slab.min) {
      const slabTaxableAmount = Math.min(taxableIncome, slab.max) - slab.min;
      const slabTax = slabTaxableAmount * slab.rate;
      baseTax += slabTax;

      if (slabTax > 0) {
        slabBreakdown.push({
          range: `₹${(slab.min / 100000).toFixed(1)}L - ${slab.max === Infinity ? "Above" : "₹" + (slab.max / 100000).toFixed(1) + "L"}`,
          rate: `${(slab.rate * 100).toFixed(0)}%`,
          taxableAmount: Math.round(slabTaxableAmount),
          tax: Math.round(slabTax),
        });
      }
    }
  }

  const cess = baseTax * TAX_CONSTANTS.HEALTH_AND_EDUCATION_CESS;
  const totalTax = Math.round(baseTax + cess);
  const effectiveRate = grossIncome > 0 ? Number(((totalTax / grossIncome) * 100).toFixed(2)) : 0;

  return {
    grossIncome,
    standardDeduction,
    taxableIncome: Math.round(taxableIncome),
    baseTax: Math.round(baseTax),
    cess: Math.round(cess),
    totalTax,
    effectiveRate,
    slabBreakdown,
  };
}

/**
 * Calculates Income Tax under the Old Tax Regime with itemized deductions
 * 
 * @param {number} grossIncome - Annual gross taxable income
 * @param {Object} deductions - Itemized deductions (80C, 80D, NPS, HRA, Home Loan Interest)
 * @returns {Object} Tax calculation details
 */
export function calculateOldRegimeTax(grossIncome, deductions = {}) {
  const limits = TAX_CONSTANTS.OLD_REGIME.limits;
  const standardDeduction = TAX_CONSTANTS.OLD_REGIME.standardDeduction;

  const sec80C = Math.min(limits.section80C, Number(deductions.section80C || 0));
  const sec80D = Math.min(limits.section80D_self + limits.section80D_parents, Number(deductions.section80D || 0));
  const sec80CCD1B = Math.min(limits.section80CCD_1B, Number(deductions.section80CCD1B || 0));
  const sec24HomeLoan = Math.min(limits.section24_home_loan, Number(deductions.homeLoanInterest || 0));
  const hra = Number(deductions.hra || 0);

  const totalDeductions = standardDeduction + sec80C + sec80D + sec80CCD1B + sec24HomeLoan + hra;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  // Section 87A rebate under Old Regime if taxable income <= 5 Lakhs
  if (taxableIncome <= TAX_CONSTANTS.OLD_REGIME.rebateLimit) {
    return {
      grossIncome,
      standardDeduction,
      deductions: {
        section80C: sec80C,
        section80D: sec80D,
        section80CCD1B: sec80CCD1B,
        homeLoanInterest: sec24HomeLoan,
        hra,
      },
      totalDeductions,
      taxableIncome,
      baseTax: 0,
      cess: 0,
      totalTax: 0,
      effectiveRate: 0,
      slabBreakdown: [],
    };
  }

  let baseTax = 0;
  const slabBreakdown = [];

  for (const slab of TAX_CONSTANTS.OLD_REGIME.slabs) {
    if (taxableIncome > slab.min) {
      const slabTaxableAmount = Math.min(taxableIncome, slab.max) - slab.min;
      const slabTax = slabTaxableAmount * slab.rate;
      baseTax += slabTax;

      if (slabTax > 0) {
        slabBreakdown.push({
          range: `₹${(slab.min / 100000).toFixed(1)}L - ${slab.max === Infinity ? "Above" : "₹" + (slab.max / 100000).toFixed(1) + "L"}`,
          rate: `${(slab.rate * 100).toFixed(0)}%`,
          taxableAmount: Math.round(slabTaxableAmount),
          tax: Math.round(slabTax),
        });
      }
    }
  }

  const cess = baseTax * TAX_CONSTANTS.HEALTH_AND_EDUCATION_CESS;
  const totalTax = Math.round(baseTax + cess);
  const effectiveRate = grossIncome > 0 ? Number(((totalTax / grossIncome) * 100).toFixed(2)) : 0;

  return {
    grossIncome,
    standardDeduction,
    deductions: {
      section80C: sec80C,
      section80D: sec80D,
      section80CCD1B: sec80CCD1B,
      homeLoanInterest: sec24HomeLoan,
      hra,
    },
    totalDeductions: Math.round(totalDeductions),
    taxableIncome: Math.round(taxableIncome),
    baseTax: Math.round(baseTax),
    cess: Math.round(cess),
    totalTax,
    effectiveRate,
    slabBreakdown,
  };
}

/**
 * Compares New vs Old Regime and generates recommendations
 * 
 * @param {number} grossIncome 
 * @param {Object} deductions 
 * @returns {Object} Comparison report
 */
export function compareTaxRegimes(grossIncome, deductions = {}) {
  const newRegime = calculateNewRegimeTax(grossIncome);
  const oldRegime = calculateOldRegimeTax(grossIncome, deductions);

  const diff = oldRegime.totalTax - newRegime.totalTax;
  const recommendedRegime = diff > 0 ? "New Regime" : diff < 0 ? "Old Regime" : "Either Regime (Same Tax)";
  const savings = Math.abs(diff);

  return {
    grossIncome,
    newRegime,
    oldRegime,
    diff,
    savings,
    recommendedRegime,
  };
}
