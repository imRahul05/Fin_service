import React from "react";
import { formatCurrency } from "../../utils/financialUtils";

const OverviewCards = ({ financeAnalytics }) => {
  return (
    <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Monthly Income</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {formatCurrency(financeAnalytics.income)}
          </dd>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Monthly Expenses</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {formatCurrency(financeAnalytics.expenses)}
          </dd>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Monthly Savings</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {formatCurrency(financeAnalytics.savings)}
          </dd>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Savings Rate</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {financeAnalytics.savingsRate.toFixed(1)}%
          </dd>
        </div>
      </div>
    </div>
  );
};

export default OverviewCards;