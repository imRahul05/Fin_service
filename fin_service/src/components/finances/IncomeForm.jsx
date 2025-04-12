import React from 'react';
import InputField from './InputField';
import { formatCurrency } from '../../utils/financialUtils';

const IncomeForm = ({ income, handleIncomeChange, totalIncome, setActiveTab }) => {
  return (
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Income</h3>
      <p className="mt-1 text-sm text-gray-500">Enter all your sources of monthly income</p>
      
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <InputField label="Salary" name="salary" value={income.salary} onChange={handleIncomeChange} />
        <InputField label="Business Income" name="business" value={income.business} onChange={handleIncomeChange} />
        <InputField label="Rental Income" name="rental" value={income.rental} onChange={handleIncomeChange} />
        <InputField label="Investment Income" name="investments" value={income.investments} onChange={handleIncomeChange} />
        <InputField label="Other Income" name="other" value={income.other} onChange={handleIncomeChange} />
      </div>
      
      <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-900">Total Monthly Income: <span className="font-bold">{formatCurrency(totalIncome)}</span></p>
        <button
          type="button"
          onClick={() => setActiveTab("fixed-expenses")}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Next: Fixed Expenses
        </button>
      </div>
    </div>
  );
};

export default IncomeForm;