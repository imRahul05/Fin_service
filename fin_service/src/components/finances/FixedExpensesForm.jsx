import InputField from './InputField';
import { formatCurrency } from '../../utils/financialUtils';

const FixedExpensesForm = ({ fixedExpenses, handleFixedExpensesChange, totalFixedExpenses, setActiveTab }) => {
  return (
    <div className="p-6">
      <h3 className="text-base font-bold text-foreground">Monthly Fixed Expenses</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Enter your recurring monthly expenses</p>
      
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <InputField label="Rent" name="rent" value={fixedExpenses.rent} onChange={handleFixedExpensesChange} />
        <InputField label="Mortgage EMI" name="mortgage" value={fixedExpenses.mortgage} onChange={handleFixedExpensesChange} />
        <InputField label="Utilities (Electricity, Water, etc.)" name="utilities" value={fixedExpenses.utilities} onChange={handleFixedExpensesChange} />
        <InputField label="Insurance Premiums" name="insurance" value={fixedExpenses.insurance} onChange={handleFixedExpensesChange} />
        <InputField label="Subscriptions (OTT, etc.)" name="subscriptions" value={fixedExpenses.subscriptions} onChange={handleFixedExpensesChange} />
        <InputField label="Education (School/Tuition Fees)" name="education" value={fixedExpenses.education} onChange={handleFixedExpensesChange} />
        <InputField label="Other Fixed Expenses" name="other" value={fixedExpenses.other} onChange={handleFixedExpensesChange} />
      </div>
      
      <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
        <p className="text-xs font-semibold text-muted-foreground">
          Total Fixed Expenses: <span className="font-bold text-foreground">{formatCurrency(totalFixedExpenses)}</span>
        </p>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className="inline-flex items-center px-5 py-2.5 border border-border text-xs font-semibold rounded-full text-foreground bg-card hover:bg-muted transition cursor-pointer"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("variable-expenses")}
            className="inline-flex items-center px-5 py-2.5 shadow-xs text-xs font-semibold rounded-full text-background bg-foreground hover:opacity-90 transition cursor-pointer"
          >
            Next: Variable Expenses
          </button>
        </div>
      </div>
    </div>
  );
};

export default FixedExpensesForm;