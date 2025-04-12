import React from 'react';

const FormTabs = ({ activeTab, setActiveTab }) => {
  return (
    <>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">Select a tab</label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          <option value="income">Income</option>
          <option value="fixed-expenses">Fixed Expenses</option>
          <option value="variable-expenses">Variable Expenses</option>
          <option value="investments">Investments</option>
          <option value="loans">Loans</option>
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("income")}
              className={`${
                activeTab === "income"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Income
            </button>
            <button
              onClick={() => setActiveTab("fixed-expenses")}
              className={`${
                activeTab === "fixed-expenses"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Fixed Expenses
            </button>
            <button
              onClick={() => setActiveTab("variable-expenses")}
              className={`${
                activeTab === "variable-expenses"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Variable Expenses
            </button>
            <button
              onClick={() => setActiveTab("investments")}
              className={`${
                activeTab === "investments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Investments
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={`${
                activeTab === "loans"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Loans
            </button>
          </nav>
        </div>
      </div>
    </>
  );
};

export default FormTabs;