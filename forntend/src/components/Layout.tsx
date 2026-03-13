import { Link, Outlet } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/startups" className="text-xl font-semibold text-emerald-400">
            Startup Launchpad
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/startups"
              className="text-slate-300 hover:text-white"
            >
              Startups
            </Link>
            {user ? (
              <>
                <Link to="/submit" className="text-slate-300 hover:text-white">
                  Submit
                </Link>
                <Link to="/portfolio" className="text-slate-300 hover:text-white">
                  Portfolio
                </Link>
                <WalletMultiButton
                  style={{
                    height: "32px",
                    fontSize: "13px",
                    padding: "0 12px",
                    borderRadius: "6px",
                    backgroundColor: "#059669",
                  }}
                />
                <span className="text-slate-400">{user.name}</span>
                <button
                  onClick={logout}
                  className="rounded bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium hover:bg-emerald-500"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
