import { formatCurrency } from '../../utils/financialUtils';

const FinancialSummary = ({ 
  totalIncome, 
  totalExpenses, 
  totalFixedExpenses, 
  totalVariableExpenses, 
  monthlySavings, 
  monthlyTax, 
  afterTaxSavings, 
  savingsRate, 
  afterTaxSavingsRate 
}) => {
  return (
    <div className="bg-card border border-border/80 shadow-card rounded-3xl mb-8 overflow-hidden transition-colors">
      <div className="px-6 py-5 bg-muted/20 border-b border-border">
        <h3 className="text-base font-bold text-foreground">
          Monthly Financial Summary
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Real-time aggregation based on your financial inputs
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/60">
            <p className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">Total Income</p>
            <p className="text-xl font-black text-foreground mt-1">{formatCurrency(totalIncome)}</p>
            <p className="text-2xs text-muted-foreground mt-1">Est. tax: {formatCurrency(monthlyTax)}</p>
          </div>
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/60">
            <p className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">Total Expenses</p>
            <p className="text-xl font-black text-foreground mt-1">{formatCurrency(totalExpenses)}</p>
            <p className="text-2xs text-muted-foreground mt-1">Fixed: {formatCurrency(totalFixedExpenses)}, Var: {formatCurrency(totalVariableExpenses)}</p>
          </div>
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/60">
            <p className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Savings</p>
            <p className="text-xl font-black text-foreground mt-1">
              {formatCurrency(monthlySavings)}
            </p>
            <p className="text-2xs text-muted-foreground mt-1">Savings Rate: {savingsRate.toFixed(1)}%</p>
          </div>
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/60">
            <p className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">After-Tax Savings</p>
            <p className="text-xl font-black text-foreground mt-1">
              {formatCurrency(afterTaxSavings)}
            </p>
            <p className="text-2xs text-muted-foreground mt-1">After-Tax Rate: {afterTaxSavingsRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;