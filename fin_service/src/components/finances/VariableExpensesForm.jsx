import InputField from './InputField';
import { formatCurrency } from '../../utils/financialUtils';

const VariableExpensesForm = ({ variableExpenses, handleVariableExpensesChange, totalVariableExpenses, setActiveTab }) => {
  return (
    <div className="p-6">
      <h3 className="text-base font-bold text-foreground">Monthly Variable Expenses</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Enter your average monthly spending in each category</p>
      
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
      
      <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
        <p className="text-xs font-semibold text-muted-foreground">
          Total Variable Expenses: <span className="font-bold text-foreground">{formatCurrency(totalVariableExpenses)}</span>
        </p>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("fixed-expenses")}
            className="inline-flex items-center px-5 py-2.5 border border-border text-xs font-semibold rounded-full text-foreground bg-card hover:bg-muted transition cursor-pointer"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("investments")}
            className="inline-flex items-center px-5 py-2.5 shadow-xs text-xs font-semibold rounded-full text-background bg-foreground hover:opacity-90 transition cursor-pointer"
          >
            Next: Investments
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariableExpensesForm;