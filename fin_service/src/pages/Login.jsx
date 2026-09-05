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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-foreground text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Next-Gen AI Wealth Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">
          Sign in to FinSage AI
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Or explore instant sandbox mode with zero credentials.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-6 sm:px-10 shadow-card border border-border/80 rounded-3xl transition-colors">
          
          {/* Instant Sandbox Banner */}
          <div className="mb-6 p-5 rounded-3xl border border-border bg-muted/20">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-foreground" />
                Zero-Friction Guest Demo
              </span>
              <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-foreground text-background">
                Instant Access
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Test all AI capabilities, scenarios, and live dashboards instantly:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PERSONA_LIST.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleGuestSandbox(p.id)}
                  className="flex items-center gap-2 px-3 py-2 text-left rounded-2xl bg-card border border-border/80 hover:border-foreground/40 text-xs font-semibold text-foreground transition shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <span>{p.avatar}</span>
                  <span className="truncate">{p.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-card text-muted-foreground font-medium text-2xs">
                Or Sign in with Email
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl relative mb-4 text-xs font-medium" role="alert">
              {error}
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-foreground/80">
                  Password
                </label>
                <Link to="/forgot-password" className="text-2xs font-semibold text-muted-foreground hover:text-foreground hover:underline">
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
                className="appearance-none block w-full px-3.5 py-2.5 border border-border rounded-2xl shadow-2xs placeholder-muted-foreground bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground text-xs transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-5 rounded-full shadow-xs text-xs font-semibold text-background bg-foreground hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign in to Dashboard"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-foreground hover:underline">
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