import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, PlusSquare, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { startups as startupsApi } from "../lib/api";

interface StartupItem {
  id: string;
  name: string;
}

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith("/chat/");
  const [projects, setProjects] = useState<StartupItem[]>([]);

  useEffect(() => {
    if (!user) return;
    startupsApi.list().then(({ data }) => setProjects(data)).catch(() => {});
  }, [user]);

  const avatarInitials = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-slate-100 overflow-hidden font-sans">
      <aside className="w-64 border-r border-[#1a1a1a] bg-[#111] flex flex-col shrink-0">
        <div className="h-16 flex items-center px-4 border-b border-[#1a1a1a] shrink-0">
          <Link to="/startups" className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1b7f53] rounded-md flex items-center justify-center text-white">
              <span className="text-xl font-black italic">Z</span>
            </div>
            ZMC
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-6">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2 px-3 tracking-wider uppercase">Overview</div>
            <nav className="flex flex-col gap-1">
              <NavLink
                to="/build"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-[#1b7f53]/10 text-[#1b7f53] font-medium' : 'text-slate-400 hover:bg-[#1a1a1a] hover:text-slate-200'}`
                }
              >
                <PlusSquare size={18} />
                Build
              </NavLink>
              <NavLink
                to="/startups"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-[#1b7f53]/10 text-[#1b7f53] font-medium' : 'text-slate-400 hover:bg-[#1a1a1a] hover:text-slate-200'}`
                }
              >
                <LayoutDashboard size={18} />
                Startups
              </NavLink>
            </nav>
          </div>

          {user && (
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2 px-3 tracking-wider uppercase flex items-center gap-2">
                <Cpu size={12} />
                Project Dev
              </div>
              <nav className="flex flex-col gap-1">
                {projects.length === 0 ? (
                  <p className="px-3 text-xs text-slate-600 italic">No projects yet</p>
                ) : (
                  projects.map((p) => (
                    <NavLink
                      key={p.id}
                      to={`/chat/${p.id}`}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors truncate ${isActive ? 'bg-violet-500/10 text-violet-400 font-medium' : 'text-slate-400 hover:bg-[#1a1a1a] hover:text-slate-200'}`
                      }
                      title={p.name}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </NavLink>
                  ))
                )}
              </nav>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <nav className="h-16 border-b border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0">
          <div className="font-semibold text-lg text-white">Dashboard</div>
          <div className="flex items-center gap-4">
            {/* Wallet & Auth logic */}
            {user ? (
              <>
                <Link to="/portfolio" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  Portfolio
                </Link>
                <WalletMultiButton
                  style={{
                    height: "32px",
                    fontSize: "13px",
                    padding: "0 14px",
                    borderRadius: "6px",
                    backgroundColor: "#111",
                    border: "1px solid #333",
                    color: "white"
                  }}
                />

                <button
                  onClick={logout}
                  className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Logout
                </button>
                <div className="w-8 h-8 rounded-full bg-[#1b7f53] flex items-center justify-center text-sm font-medium text-white shadow-sm ml-2 ring-2 ring-slate-800">
                  {avatarInitials}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-[#1b7f53] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1b7f53]/90 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>

        <main className={`flex-1 bg-[#0a0a0a] ${isChatRoute ? 'overflow-hidden flex flex-col' : 'overflow-y-auto p-6 lg:p-10'}`}>
          {isChatRoute ? (
            <Outlet />
          ) : (
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
