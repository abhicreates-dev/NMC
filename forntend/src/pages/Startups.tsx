import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { startups } from "../lib/api";

const VALUATION = 20_000;

interface StartupItem {
  id: string;
  name: string;
  description: string;
  valuation: number;
  totalRaised: number;
  fundingOpenAt: string;
}

function formatCountdown(dateStr: string) {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return "Funding open";

  const mins = Math.floor(diff / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  return `${mins}m ${secs}s`;
}

function StartupCard({ s }: { s: StartupItem }) {
  const [countdown, setCountdown] = useState(formatCountdown(s.fundingOpenAt));
  const isOpen = new Date(s.fundingOpenAt) <= new Date();
  const progress = Math.min(100, (s.totalRaised / VALUATION) * 100);

  useEffect(() => {
    if (isOpen) {
      setCountdown("Funding open");
      return;
    }
    const t = setInterval(
      () => setCountdown(formatCountdown(s.fundingOpenAt)),
      1000
    );
    return () => clearInterval(t);
  }, [s.fundingOpenAt, isOpen]);

  return (
    <Link
      to={`/startup/${s.id}`}
      className="block rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-slate-700 hover:bg-slate-900"
    >
      <h3 className="text-lg font-semibold text-white">{s.name}</h3>
      <p className="mt-1 line-clamp-2 text-slate-400">{s.description}</p>
      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
        <span>${s.valuation.toLocaleString()} valuation</span>
        <span
          className={
            isOpen
              ? "text-emerald-400"
              : "text-amber-400"
          }
        >
          {countdown}
        </span>
      </div>
      <div className="mt-3">
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          ${s.totalRaised.toFixed(0)} / ${VALUATION.toLocaleString()} (
          {progress.toFixed(0)}%)
        </p>
      </div>
    </Link>
  );
}

export function Startups() {
  const [list, setList] = useState<StartupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    startups
      .list()
      .then(({ data }) => setList(data))
      .catch(() => setError("Failed to load startups"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Startups</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <StartupCard key={s.id} s={s} />
        ))}
      </div>
      {list.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-500">
          No startups yet. Be the first to submit one.
        </p>
      )}
    </div>
  );
}
