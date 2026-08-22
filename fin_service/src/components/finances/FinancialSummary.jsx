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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-gray-950/40 overflow-hidden sm:rounded-lg mb-8 transition-colors">
      <div className="px-4 py-5 sm:px-6 bg-blue-50 dark:bg-blue-950/30 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Monthly Financial Summary
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Based on the information you've provided
        </p>
      </div>
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Before Tax: {formatCurrency(monthlyTax)} in estimated taxes</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
            <p className="text-xl font-semibold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fixed: {formatCurrency(totalFixedExpenses)}, Variable: {formatCurrency(totalVariableExpenses)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Savings</p>
            <p className={`text-xl font-semibold ${monthlySavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(monthlySavings)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Savings Rate: {savingsRate.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">After-Tax Savings</p>
            <p className={`text-xl font-semibold ${afterTaxSavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(afterTaxSavings)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">After-Tax Rate: {afterTaxSavingsRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;