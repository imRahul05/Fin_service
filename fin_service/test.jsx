
{/* Debt-to-Income Ratio */}
{financeAnalytics.income > 0 && (
    <div className={`bg-white overflow-hidden shadow rounded-lg border ${
      (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 20 ? 'border-green-200' : 
      (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 36 ? 'border-yellow-200' : 'border-red-200'
    }`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${
            (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 20 ? 'bg-green-100' : 
            (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 36 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <svg className={`h-6 w-6 ${
              (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 20 ? 'text-green-600' : 
              (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 36 ? 'text-yellow-600' : 'text-red-600'
            }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Debt-to-Income Ratio
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {((financeAnalytics.loansTotal / financeAnalytics.income) * 100).toFixed(1)}%
                </div>
              </dd>
              <dd className="mt-1 text-sm text-gray-500">
                {(financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 20 ? 'Excellent' : 
                 (financeAnalytics.loansTotal / financeAnalytics.income) * 100 <= 36 ? 'Good' : 'High'}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )}

{/* Investment Rate */}
{financeAnalytics.income > 0 && (
    <div className={`bg-white overflow-hidden shadow rounded-lg border ${
      (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 15 ? 'border-green-200' : 
      (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 5 ? 'border-yellow-200' : 'border-red-200'
    }`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${
            (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 15 ? 'bg-green-100' : 
            (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 5 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <svg className={`h-6 w-6 ${
              (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 15 ? 'text-green-600' : 
              (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 5 ? 'text-yellow-600' : 'text-red-600'
            }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Investment Rate
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {((financeAnalytics.investmentsTotal / financeAnalytics.income) * 100).toFixed(1)}%
                </div>
              </dd>
              <dd className="mt-1 text-sm text-gray-500">
                {(financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 15 ? 'Excellent' : 
                 (financeAnalytics.investmentsTotal / financeAnalytics.income) * 100 >= 5 ? 'Good' : 'Needs improvement'}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )}