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

function StartupCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/5 bg-[#101010] p-6 pb-15 animate-pulse" data-testid="startup-card-skeleton">
      <div className="h-5 w-3/4 rounded bg-white/10" />
      <div className="mt-2 space-y-1">
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-5/6 rounded bg-white/10" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-white/10" />
        <div className="h-3 w-16 rounded bg-white/10" />
      </div>
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10" />
        <div className="mt-1 h-3 w-28 rounded bg-white/10" />
      </div>
    </div>
  );
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
      to={`/app/startup/${s.id}`}
      className="block rounded-xl border border-white/5 bg-[#101010] p-6 transition-all hover:border-white/10 hover:shadow-lg hover:shadow-[#1b7f53]/5 group relative overflow-hidden"
      data-testid="startup-card"
    >
      <h3 className="text-lg font-medium text-white" data-testid="startup-card-name">{s.name}</h3>
      <p className="mt-1 line-clamp-2 text-slate-400" data-testid="startup-card-description">{s.description}</p>
      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
        <span data-testid="valuation">${s.valuation.toLocaleString()} valuation</span>
        <span
          data-testid="countdown"
          className={
            isOpen
              ? "text-[#1b7f53] font-medium"
              : "text-amber-500 font-medium"
          }
        >
          {countdown}
        </span>
      </div>
      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full border border-white/5 bg-[#1a1a1a]" data-testid="progress-bar" aria-label="progress bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full bg-[#1b7f53] transition-all"
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
      <div className="w-full">
        <h1 className="mb-8 text-2xl font-medium text-white tracking-tight">Recent Startups</h1>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="loading-skeleton">
          {Array.from({ length: 6 }).map((_, i) => (
            <StartupCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="w-full">
      <h1 className="mb-8 text-2xl font-medium text-white tracking-tight">Recent Startups</h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="startup-cards-grid">
        {list.map((s) => (
          <StartupCard key={s.id} s={s} />
        ))}
      </div>
      {list.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 bg-[#111] p-12 text-center">
          <p className="text-slate-500">
            No startups yet. Be the first to build one.
          </p>
        </div>
      )}
    </div>
  );
}
