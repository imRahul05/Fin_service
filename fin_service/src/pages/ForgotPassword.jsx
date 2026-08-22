import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const emailRef = useRef(null);
  const { resetPassword } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(emailRef.current?.value);
      setMessage("Check your inbox for further instructions");
    } catch (err) {
      setError("Failed to reset password: " + (err.message || "Please check your email"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">Reset Your Password</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-md dark:shadow-gray-950/40 border border-gray-200 dark:border-gray-700 sm:rounded-xl sm:px-10 transition-colors">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4 text-sm" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-md relative mb-4 text-sm" role="alert">
              <span className="block sm:inline">{message}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  ref={emailRef}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-colors"
              >
                {loading ? "Processing..." : "Reset Password"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <div className="flex flex-col space-y-2">
              <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 text-sm">
                Back to Login
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need an account?{" "}
                <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;