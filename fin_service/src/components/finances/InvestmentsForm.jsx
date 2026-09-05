import InputField from './InputField';
import { formatCurrency } from '../../utils/financialUtils';

const InvestmentsForm = ({ investments, handleInvestmentsChange, totalInvestments, setActiveTab }) => {
  return (
    <div className="p-6">
      <h3 className="text-base font-bold text-foreground">Monthly Investments</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Enter your monthly contribution to each investment type</p>
      
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
      
      <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
        <p className="text-xs font-semibold text-muted-foreground">
          Total Monthly Investments: <span className="font-bold text-foreground">{formatCurrency(totalInvestments)}</span>
        </p>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("variable-expenses")}
            className="inline-flex items-center px-5 py-2.5 border border-border text-xs font-semibold rounded-full text-foreground bg-card hover:bg-muted transition cursor-pointer"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("loans")}
            className="inline-flex items-center px-5 py-2.5 shadow-xs text-xs font-semibold rounded-full text-background bg-foreground hover:opacity-90 transition cursor-pointer"
          >
            Next: Loans
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentsForm;