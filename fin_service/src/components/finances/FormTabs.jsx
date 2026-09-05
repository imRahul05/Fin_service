const FormTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "income", label: "Income" },
    { id: "fixed-expenses", label: "Fixed Expenses" },
    { id: "variable-expenses", label: "Variable Expenses" },
    { id: "investments", label: "Investments" },
    { id: "loans", label: "Loans" },
  ];

  return (
    <div className="p-4 border-b border-border/80 bg-muted/20">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FormTabs;