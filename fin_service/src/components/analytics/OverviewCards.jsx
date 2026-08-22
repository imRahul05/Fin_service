import { formatCurrency } from "../../utils/financialUtils";

const OverviewCards = ({ financeAnalytics }) => {
  return (
    <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Monthly Income</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(financeAnalytics.income)}
          </dd>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Monthly Expenses</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(financeAnalytics.expenses)}
          </dd>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Monthly Savings</dt>
          <dd className={`mt-1 text-3xl font-semibold ${financeAnalytics.savings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(financeAnalytics.savings)}
          </dd>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-950/40 rounded-xl transition-colors">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Savings Rate</dt>
          <dd className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">
            {financeAnalytics.savingsRate.toFixed(1)}%
          </dd>
        </div>
      </div>
    </div>
  );
};

export default OverviewCards;