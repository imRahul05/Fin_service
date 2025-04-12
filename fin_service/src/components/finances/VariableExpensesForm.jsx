import React from 'react';
import InputField from './InputField';
import { formatCurrency } from '../../utils/financialUtils';

const VariableExpensesForm = ({ variableExpenses, handleVariableExpensesChange, totalVariableExpenses, setActiveTab }) => {
  return (
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Variable Expenses</h3>
      <p className="mt-1 text-sm text-gray-500">Enter your average monthly spending in each category</p>
      
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <InputField label="Groceries" name="groceries" value={variableExpenses.groceries} onChange={handleVariableExpensesChange} />
        <InputField label="Dining Out" name="dining" value={variableExpenses.dining} onChange={handleVariableExpensesChange} />
        <InputField label="Entertainment" name="entertainment" value={variableExpenses.entertainment} onChange={handleVariableExpensesChange} />
        <InputField label="Shopping (Clothing, etc.)" name="shopping" value={variableExpenses.shopping} onChange={handleVariableExpensesChange} />
        <InputField label="Transportation (Fuel, Taxi, etc.)" name="transportation" value={variableExpenses.transportation} onChange={handleVariableExpensesChange} />
        <InputField label="Healthcare (Medical, Medicine)" name="healthcare" value={variableExpenses.healthcare} onChange={handleVariableExpensesChange} />
        <InputField label="Travel" name="travel" value={variableExpenses.travel} onChange={handleVariableExpensesChange} />
        <InputField label="Other Variable Expenses" name="other" value={variableExpenses.other} onChange={handleVariableExpensesChange} />
      </div>
      
      <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-900">Total Variable Expenses: <span className="font-bold">{formatCurrency(totalVariableExpenses)}</span></p>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setActiveTab("fixed-expenses")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("investments")}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Next: Investments
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariableExpensesForm;