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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">Reset Your Password</h2>
        <p className="mt-1 text-xs text-muted-foreground">Enter your email address to receive password recovery instructions</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-6 sm:px-10 shadow-card border border-border/80 rounded-3xl transition-colors">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl relative mb-4 text-xs font-medium" role="alert">
              <span>{error}</span>
            </div>
          )}
          
          {message && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-2xl relative mb-4 text-xs font-medium" role="alert">
              <span>{message}</span>
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                ref={emailRef}
                className="appearance-none block w-full px-3.5 py-2.5 border border-border rounded-2xl shadow-2xs placeholder-muted-foreground bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground text-xs transition"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex justify-center py-3 px-5 shadow-xs text-xs font-semibold rounded-full text-background bg-foreground hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? "Processing..." : "Reset Password"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center space-y-2">
            <div>
              <Link to="/login" className="text-xs font-semibold text-foreground hover:underline">
                Back to Login
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Need an account?{" "}
              <Link to="/register" className="font-semibold text-foreground hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;