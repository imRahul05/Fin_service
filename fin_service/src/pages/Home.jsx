import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/common/Footer";

function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="bg-gradient-to-b from-blue-800 to-blue-600 dark:from-gray-950 dark:via-blue-950 dark:to-gray-900 h-full w-full opacity-95"></div>
        </div>
        <div className="relative pt-6 pb-16 sm:pb-24">
          <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Take control of your</span>{" "}
                <span className="block text-yellow-400 dark:text-yellow-300 xl:inline">financial future</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-100 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Plan smarter, save faster, and build wealth with our AI-powered financial management platform tailored for the Indian context.
              </p>
              <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
                {currentUser ? (
                  <div className="rounded-md shadow">
                    <Link
                      to="/dashboard"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-lg shadow-blue-600/30 transition-all"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="rounded-md shadow">
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-lg shadow-blue-600/30 transition-all"
                      >
                        Get Started
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10 shadow transition-all"
                      >
                        Log In
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-gray-800/70 border-y border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              A better way to manage your finances
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
              Take control of your financial journey with our comprehensive suite of tools.
            </p>
          </div>

          <div className="mt-12">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative p-6 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white shadow-md">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Input Current Finances</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Track income, expenses, savings, and loans with a focus on Indian financial instruments like PPF, NPS, and LIC policies.
                  </p>
                </div>
              </div>

              <div className="relative p-6 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white shadow-md">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">"What If" Scenarios</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Simulate career changes, investment strategies, and major purchases to visualize their impact on your financial future.
                  </p>
                </div>
              </div>

              <div className="relative p-6 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white shadow-md">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Behavior-Based Analytics</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Detect spending patterns, identify leaks, and receive AI-powered suggestions tailored to Indian context and categories.
                  </p>
                </div>
              </div>

              <div className="relative p-6 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white shadow-md">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">AI Financial Advisor</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Get personalized financial advice based on your goals and current financial situation, updated with real-time information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 dark:bg-blue-950/80 border-y border-blue-600 dark:border-blue-900">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to take control?</span>
            <span className="block">Start your financial journey today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-100 dark:text-blue-200">
            Join thousands of users who have transformed their financial health using our intelligent platform.
          </p>
          <div className="mt-8 flex justify-center">
            {currentUser ? (
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 dark:text-blue-950 bg-white hover:bg-blue-50 font-semibold shadow-md transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 dark:text-blue-950 bg-white hover:bg-blue-50 font-semibold shadow-md transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-gray-50 dark:bg-gray-900 pt-12 pb-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">Privacy First</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Your data belongs to you
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
              We don't sell your data to banks or lenders. Your financial information stays private and secure.
            </p>
            <div className="mt-6">
              <p className="text-base text-gray-500 dark:text-gray-400">
                Compliant with India's Digital Personal Data Protection Act, 2023
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;