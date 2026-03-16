import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import shelter from "../assets/shelter.jpeg"


const LayersIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#1b7f53" strokeWidth={2.5}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);


const INP = "w-full rounded-md border border-white/[0.08] bg-[#1f2229]/55 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 shadow-inner focus:border-[#1b7f53]/40 focus:bg-[#1f2229]/75 focus:outline-none focus:ring-1 focus:ring-[#1b7f53]/25 transition-all";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/startups";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await auth.login(email, password);
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const d =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string; details?: string } } }).response?.data
          : null;
      setError(d?.details ?? d?.error ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0e1012] font-sans">

      {/* ── LEFT 50% ── */}
      <div className="w-1/2 flex flex-col px-14 py-9 bg-[#0e1012]">

        {/* logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] border border-[#1b7f53] rounded-md flex items-center justify-center">
            <LayersIcon />
          </div>
          <span className="text-[0.9rem] font-bold text-[#f0f4f0] tracking-tight">ZMC</span>
        </div>

        {/* form area */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-[340px]">
            <h1 className="text-[1.55rem] font-medium text-[#f0f4f0] tracking-tight mb-1.5">Welcome back</h1>
            <p className="text-[0.82rem] text-[#6b8b6b] mb-6 leading-relaxed">
              Log in to track your investments and discover new rounds.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label htmlFor="login-email" className="block text-[0.73rem] font-normal text-[#7a9a87] mb-1.5">Email</label>
                <input id="login-email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className={INP} aria-label="Email" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="login-password" className="text-[0.73rem] font-normal text-[#7a9a87]">Password</label>
                  <a href="#" className="text-[0.7rem] text-[#1b7f53] hover:underline">Forgot password?</a>
                </div>
                <input id="login-password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className={INP} aria-label="Password" />
              </div>

              {error && (
                <div className="bg-red-500/[0.07] border border-red-500/20 rounded-lg px-3 py-2.5 text-[0.75rem] text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1.5 w-full py-[11px] rounded-lg bg-gradient-to-r from-[#1b7f53] to-[#22c55e] text-white font-semibold text-[0.85rem] tracking-wide hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "Logging in…" : "Log in →"}
              </button>
            </form>

            <p className="mt-4 text-[0.77rem] text-[#3e5a49]">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#1b7f53] font-medium hover:underline">Sign up free</Link>
            </p>
          </div>
        </div>

        <p className="text-[0.65rem] text-[#253a2e]">© ZMC 2025 · Crowdfunding for builders</p>
      </div>

      {/* ── RIGHT 50% ── */}
      <div
        className="w-1/2 relative overflow-hidden "
        style={{
          backgroundImage: `url(${shelter})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* very subtle green tint at top */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(27,127,83,0.18) 0%, transparent 38%)" }}
        />
        {/* dark vignette at bottom for text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(10,16,12,0.82) 0%, transparent 50%)" }}
        />
        {/* tagline */}
        <div className="absolute bottom-10 left-0 right-0 px-10">
          <p className="text-[1.35rem] font-semibold text-white leading-snug">
            Be a shelter to<br />someone's startup.
          </p>
          <p className="text-[0.72rem] text-white/50 mt-2">
            Back real founders. Fund early. Grow together.
          </p>
        </div>
      </div>
    </div>
  );
}
