import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/financialUtils";
import { analyzeSpendingBehavior } from "../services/AIService";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Mock transactions data - in a real app, this would come from the database
const MOCK_TRANSACTIONS = [
  { id: 1, date: "2025-04-01", amount: 1200, category: "Groceries", paymentMethod: "UPI", description: "BigBasket monthly shopping" },
  { id: 2, date: "2025-04-02", amount: 899, category: "Entertainment", paymentMethod: "Credit Card", description: "Netflix annual subscription" },
  { id: 3, date: "2025-04-03", amount: 3500, category: "Dining", paymentMethod: "Credit Card", description: "Dinner with family at Taj" },
  { id: 4, date: "2025-04-05", amount: 12000, category: "Rent", paymentMethod: "Bank Transfer", description: "Monthly house rent" },
  { id: 5, date: "2025-04-05", amount: 2500, category: "Utilities", paymentMethod: "UPI", description: "Electricity bill" },
  { id: 6, date: "2025-04-06", amount: 999, category: "Utilities", paymentMethod: "Credit Card", description: "Mobile bill" },
  { id: 7, date: "2025-04-07", amount: 1500, category: "Transportation", paymentMethod: "UPI", description: "Monthly metro pass" },
  { id: 8, date: "2025-04-08", amount: 4500, category: "Shopping", paymentMethod: "Credit Card", description: "New clothes from Myntra" },
  { id: 9, date: "2025-04-10", amount: 2000, category: "Health", paymentMethod: "UPI", description: "Medicine from Apollo" },
  { id: 10, date: "2025-04-12", amount: 1800, category: "Groceries", paymentMethod: "UPI", description: "DMart shopping" },
  { id: 11, date: "2025-04-15", amount: 5000, category: "Entertainment", paymentMethod: "Credit Card", description: "Movie and dinner" },
  { id: 12, date: "2025-04-18", amount: 3000, category: "Transportation", paymentMethod: "UPI", description: "Ola rides" },
  { id: 13, date: "2025-04-20", amount: 1200, category: "Dining", paymentMethod: "Credit Card", description: "Lunch with colleagues" },
  { id: 14, date: "2025-04-22", amount: 15000, category: "Shopping", paymentMethod: "Credit Card", description: "New smartphone" },
  { id: 15, date: "2025-04-25", amount: 2500, category: "Utilities", paymentMethod: "UPI", description: "Internet bill" },
];

function Analytics() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [finances, setFinances] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [spendingAnalysis, setSpendingAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState({});
  const [timeRange, setTimeRange] = useState("month"); // "month", "quarter", or "year"

  // Load user's financial data and transactions
  useEffect(() => {
    async function loadUserData() {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Load financial data
        const docRef = doc(db, "userFinances", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setFinances(docSnap.data().finances);
        }
        
        // In a real app, fetch transactions from database
        // For this demo, we'll use mock data
        // const transactionsRef = collection(db, "transactions");
        // const q = query(transactionsRef, where("userId", "==", currentUser.uid));
        // const querySnapshot = await getDocs(q);
        // const transactionsData = [];
        // querySnapshot.forEach((doc) => {
        //   transactionsData.push({ id: doc.id, ...doc.data() });
        // });
        // setTransactions(transactionsData);
        
        setTransactions(MOCK_TRANSACTIONS);
        
        // Process transactions to calculate category totals
        const categories = {};
        const methods = {};
        const monthly = Array(12).fill(0);
        
        MOCK_TRANSACTIONS.forEach(transaction => {
          // Category totals
          if (categories[transaction.category]) {
            categories[transaction.category] += transaction.amount;
          } else {
            categories[transaction.category] = transaction.amount;
          }
          
          // Payment method breakdown
          if (methods[transaction.paymentMethod]) {
            methods[transaction.paymentMethod] += transaction.amount;
          } else {
            methods[transaction.paymentMethod] = transaction.amount;
          }
          
          // Monthly spending (assuming current year)
          const month = new Date(transaction.date).getMonth();
          monthly[month] += transaction.amount;
        });
        
        setCategoryTotals(categories);
        setPaymentMethodBreakdown(methods);
        setMonthlySpending(monthly);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [currentUser]);

  // Get AI spending analysis when transactions are loaded
  useEffect(() => {
    async function getAnalysis() {
      if (transactions.length === 0) return;
      
      setAiLoading(true);
      try {
        const analysis = await analyzeSpendingBehavior(transactions);
        setSpendingAnalysis(analysis);
      } catch (error) {
        console.error("Error getting spending analysis:", error);
        setSpendingAnalysis("Unable to generate spending analysis at this time. Please try again later.");
      } finally {
        setAiLoading(false);
      }
    }
    
    getAnalysis();
  }, [transactions]);

  // Prepare chart data
  const categoryData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Spending by Category',
        data: Object.values(categoryTotals),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(40, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const paymentMethodData = {
    labels: Object.keys(paymentMethodBreakdown),
    datasets: [
      {
        label: 'Payment Methods',
        data: Object.values(paymentMethodBreakdown),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlySpendingData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Spending',
        data: monthlySpending,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Spending Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Analyze your spending habits and find ways to save
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <div>
            <label htmlFor="timeRange" className="sr-only">Time Range</label>
            <select
              id="timeRange"
              name="timeRange"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Spending</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
            </dd>
            <dd className="mt-2 text-sm text-gray-500">For the selected period</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Average Transaction</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0) / (transactions.length || 1))}
            </dd>
            <dd className="mt-2 text-sm text-gray-500">{transactions.length} transactions</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Largest Expense</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {formatCurrency(Math.max(...transactions.map(t => t.amount), 0))}
            </dd>
            <dd className="mt-2 text-sm text-gray-500">
              {transactions.length > 0 && transactions.reduce((max, t) => max.amount > t.amount ? max : t, { amount: 0 }).category}
            </dd>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Spending by Category */}
        <div className="bg-white rounded-lg shadow px-5 py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>
          <div className="h-64">
            <Pie 
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow px-5 py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
          <div className="h-64">
            <Pie 
              data={paymentMethodData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Monthly Spending Trend */}
        <div className="bg-white rounded-lg shadow px-5 py-6 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Spending Trend</h3>
          <div className="h-64">
            <Bar
              data={monthlySpendingData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(value);
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Transactions
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your spending history
          </p>
        </div>
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="overflow-hidden border-b border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 bg-blue-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            AI Spending Analysis
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personalized insights about your spending habits
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {aiLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <div className="whitespace-pre-line">
                {spendingAnalysis}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights Cards */}
      <div className="mt-8">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-green-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Top Spending Category
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {Object.entries(categoryTotals).reduce((a, b) => a[1] > b[1] ? a : b, [null, 0])[0]}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border border-red-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Potential Savings Area
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        Entertainment
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border border-blue-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Monthly Average
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {formatCurrency(monthlySpending.filter(x => x > 0).reduce((sum, val) => sum + val, 0) / 
                          (monthlySpending.filter(x => x > 0).length || 1))}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;