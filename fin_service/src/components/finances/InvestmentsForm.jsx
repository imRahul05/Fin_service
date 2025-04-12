import React from 'react';
import InputField from './InputField';
import { formatCurrency } from '../../utils/financialUtils';

const InvestmentsForm = ({ investments, handleInvestmentsChange, totalInvestments, setActiveTab }) => {
  return (
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Investments</h3>
      <p className="mt-1 text-sm text-gray-500">Enter your monthly contribution to each investment type</p>
      
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <InputField label="Equity/Stocks" name="equity" value={investments.equity} onChange={handleInvestmentsChange} />
        <InputField label="Mutual Funds/SIPs" name="mutual_funds" value={investments.mutual_funds} onChange={handleInvestmentsChange} />
        <InputField label="Fixed Deposits" name="fd" value={investments.fd} onChange={handleInvestmentsChange} />
        <InputField label="PPF (Public Provident Fund)" name="ppf" value={investments.ppf} onChange={handleInvestmentsChange} />
        <InputField label="EPF (Employee Provident Fund)" name="epf" value={investments.epf} onChange={handleInvestmentsChange} />
        <InputField label="NPS (National Pension Scheme)" name="nps" value={investments.nps} onChange={handleInvestmentsChange} />
        <InputField label="Gold/Silver" name="gold" value={investments.gold} onChange={handleInvestmentsChange} />
        <InputField label="Real Estate" name="real_estate" value={investments.real_estate} onChange={handleInvestmentsChange} />
        <InputField label="Cryptocurrency" name="crypto" value={investments.crypto} onChange={handleInvestmentsChange} />
        <InputField label="Other Investments" name="other" value={investments.other} onChange={handleInvestmentsChange} />
      </div>
      
      <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-900">Total Monthly Investments: <span className="font-bold">{formatCurrency(totalInvestments)}</span></p>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setActiveTab("variable-expenses")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("loans")}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Next: Loans
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentsForm;