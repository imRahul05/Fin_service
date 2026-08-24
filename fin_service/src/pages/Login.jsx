import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { DEMO_PERSONAS, PERSONA_LIST } from "../constants/personas.constants";
import { Sparkles, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

function Login() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const { login, enterGuestMode } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to sign in: " + (err.message || "Please check your credentials"));
    } finally {
      setLoading(false);
    }
  }

  function handleGuestSandbox(personaId = "bengaluru_techie") {
    const persona = DEMO_PERSONAS[personaId];
    if (persona) {
      localStorage.setItem("finsage_active_persona_id", personaId);
      localStorage.setItem(
        "finsage_guest_sandbox_v1",
        JSON.stringify({
          finances: persona.finances,
          transactions: persona.transactions,
          personaId,
        })
      );
    }
    enterGuestMode();
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen AI Wealth Intelligence</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Sign in to FinSage AI
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Or explore instant sandbox mode with zero credentials.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/80 border border-slate-200 dark:border-slate-800 sm:rounded-2xl sm:px-10 transition-colors">
          
          {/* Instant Sandbox Banner */}
          <div className="mb-6 p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Zero-Friction Guest Demo
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100">
                Instant Access
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Test all AI capabilities, scenarios, and live dashboards instantly:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {PERSONA_LIST.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleGuestSandbox(p.id)}
                  className="flex items-center gap-1.5 px-2.5 py-2 text-left rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-800 dark:text-slate-200 transition shadow-2xs hover:shadow"
                >
                  <span>{p.avatar}</span>
                  <span className="truncate">{p.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium">
                Or Sign in with Email
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-lg relative mb-4 text-xs font-medium" role="alert">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                ref={emailRef}
                className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs placeholder-slate-400 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                ref={passwordRef}
                className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs placeholder-slate-400 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition"
            >
              {loading ? "Signing in..." : "Sign in to Dashboard"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Create free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;