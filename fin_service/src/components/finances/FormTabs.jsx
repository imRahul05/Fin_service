const FormTabs = ({ activeTab, setActiveTab }) => {
  const tabButtonClass = (tabName) =>
    `${
      activeTab === tabName
        ? "border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700"
    } w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors`;

  return (
    <>
      <div className="sm:hidden mb-4">
        <label htmlFor="tabs" className="sr-only">Select a tab</label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm rounded-md"
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
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("income")}
              className={tabButtonClass("income")}
            >
              Income
            </button>
            <button
              onClick={() => setActiveTab("fixed-expenses")}
              className={tabButtonClass("fixed-expenses")}
            >
              Fixed Expenses
            </button>
            <button
              onClick={() => setActiveTab("variable-expenses")}
              className={tabButtonClass("variable-expenses")}
            >
              Variable Expenses
            </button>
            <button
              onClick={() => setActiveTab("investments")}
              className={tabButtonClass("investments")}
            >
              Investments
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={tabButtonClass("loans")}
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