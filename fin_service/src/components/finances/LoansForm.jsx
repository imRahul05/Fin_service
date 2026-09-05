import InputField from './InputField';
import { formatCurrency } from '../../utils/financialUtils';

const LoansForm = ({ 
  loans, 
  handleLoansChange, 
  totalLoans, 
  setActiveTab, 
  saving = false
}) => {
  return (
    <div className="p-6">
      <h3 className="text-base font-bold text-foreground">Monthly Loan Repayments</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Enter your monthly EMIs and other debt payments</p>
      
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <InputField label="Home Loan EMI" name="home" value={loans.home} onChange={handleLoansChange} />
        <InputField label="Car Loan EMI" name="car" value={loans.car} onChange={handleLoansChange} />
        <InputField label="Education Loan EMI" name="education" value={loans.education} onChange={handleLoansChange} />
        <InputField label="Personal Loan EMI" name="personal" value={loans.personal} onChange={handleLoansChange} />
        <InputField label="Credit Card Payments" name="credit_card" value={loans.credit_card} onChange={handleLoansChange} />
        <InputField label="Other Loan Payments" name="other" value={loans.other} onChange={handleLoansChange} />
      </div>
      
      <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
        <p className="text-xs font-semibold text-muted-foreground">
          Total Monthly Loan Payments: <span className="font-bold text-foreground">{formatCurrency(totalLoans)}</span>
        </p>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("investments")}
            className="inline-flex items-center px-5 py-2.5 border border-border text-xs font-semibold rounded-full text-foreground bg-card hover:bg-muted transition cursor-pointer"
          >
            Previous
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-5 py-2.5 shadow-xs text-xs font-semibold rounded-full text-background bg-foreground hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save and Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoansForm;