import InputField from './InputField';
import { formatCurrency } from '../../utils/financialUtils';

const IncomeForm = ({ income, handleIncomeChange, totalIncome, setActiveTab }) => {
  return (
    <div className="p-6">
      <h3 className="text-base font-bold text-foreground">Monthly Income</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Enter all your sources of monthly income</p>
      
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <InputField label="Salary" name="salary" value={income.salary} onChange={handleIncomeChange} />
        <InputField label="Business Income" name="business" value={income.business} onChange={handleIncomeChange} />
        <InputField label="Rental Income" name="rental" value={income.rental} onChange={handleIncomeChange} />
        <InputField label="Investment Income" name="investments" value={income.investments} onChange={handleIncomeChange} />
        <InputField label="Other Income" name="other" value={income.other} onChange={handleIncomeChange} />
      </div>
      
      <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
        <p className="text-xs font-semibold text-muted-foreground">
          Total Monthly Income: <span className="font-bold text-foreground">{formatCurrency(totalIncome)}</span>
        </p>
        <button
          type="button"
          onClick={() => setActiveTab("fixed-expenses")}
          className="inline-flex items-center px-5 py-2.5 shadow-xs text-xs font-semibold rounded-full text-background bg-foreground hover:opacity-90 transition cursor-pointer"
        >
          Next: Fixed Expenses
        </button>
      </div>
    </div>
  );
};

export default IncomeForm;