import React from 'react';
import InputField from './InputField';
import { formatCurrency } from '../../utils/financialUtils';

const FixedExpensesForm = ({ fixedExpenses, handleFixedExpensesChange, totalFixedExpenses, setActiveTab }) => {
  return (
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Fixed Expenses</h3>
      <p className="mt-1 text-sm text-gray-500">Enter your recurring monthly expenses</p>
      
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <InputField label="Rent" name="rent" value={fixedExpenses.rent} onChange={handleFixedExpensesChange} />
        <InputField label="Mortgage EMI" name="mortgage" value={fixedExpenses.mortgage} onChange={handleFixedExpensesChange} />
        <InputField label="Utilities (Electricity, Water, etc.)" name="utilities" value={fixedExpenses.utilities} onChange={handleFixedExpensesChange} />
        <InputField label="Insurance Premiums" name="insurance" value={fixedExpenses.insurance} onChange={handleFixedExpensesChange} />
        <InputField label="Subscriptions (OTT, etc.)" name="subscriptions" value={fixedExpenses.subscriptions} onChange={handleFixedExpensesChange} />
        <InputField label="Education (School/Tuition Fees)" name="education" value={fixedExpenses.education} onChange={handleFixedExpensesChange} />
        <InputField label="Other Fixed Expenses" name="other" value={fixedExpenses.other} onChange={handleFixedExpensesChange} />
      </div>
      
      <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-900">Total Fixed Expenses: <span className="font-bold">{formatCurrency(totalFixedExpenses)}</span></p>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("variable-expenses")}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Next: Variable Expenses
          </button>
        </div>
      </div>
    </div>
  );
};

export default FixedExpensesForm;