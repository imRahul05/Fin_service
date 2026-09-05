import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordConfirmRef = useRef(null);
  const nameRef = useRef(null);
  const { signup, updateUserProfile } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current?.value !== passwordConfirmRef.current?.value) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      await signup(emailRef.current?.value, passwordRef.current?.value);
      
      await updateUserProfile(nameRef.current?.value || "", "");
      
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create an account: " + (err.message || "Please try again"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">Create a new account</h2>
        <p className="mt-1 text-xs text-muted-foreground">Start your personalized wealth intelligence journey</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-6 sm:px-10 shadow-card border border-border/80 rounded-3xl transition-colors">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl relative mb-4 text-xs font-medium" role="alert">
              <span>{error}</span>
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                ref={nameRef}
                className="appearance-none block w-full px-3.5 py-2.5 border border-border rounded-2xl shadow-2xs placeholder-muted-foreground bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground text-xs transition"
              />
            </div>
            
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
              <label htmlFor="password" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                ref={passwordRef}
                className="appearance-none block w-full px-3.5 py-2.5 border border-border rounded-2xl shadow-2xs placeholder-muted-foreground bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground text-xs transition"
              />
            </div>

            <div>
              <label htmlFor="password-confirm" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                Confirm Password
              </label>
              <input
                id="password-confirm"
                name="password-confirm"
                type="password"
                autoComplete="new-password"
                required
                ref={passwordConfirmRef}
                className="appearance-none block w-full px-3.5 py-2.5 border border-border rounded-2xl shadow-2xs placeholder-muted-foreground bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground text-xs transition"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-5 rounded-full shadow-xs text-xs font-semibold text-background bg-foreground hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? "Creating Account..." : "Sign up"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;