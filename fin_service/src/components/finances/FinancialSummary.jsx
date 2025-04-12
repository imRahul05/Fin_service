import React from 'react';
import { formatCurrency } from '../../utils/financialUtils';

const FinancialSummary = ({ 
  totalIncome, 
  totalExpenses, 
  totalFixedExpenses, 
  totalVariableExpenses, 
  monthlySavings, 
  monthlyTax, 
  afterTaxSavings, 
  savingsRate, 
  afterTaxSavingsRate 
}) => {
  return (
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
  );
};

export default FinancialSummary;