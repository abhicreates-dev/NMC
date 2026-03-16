import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { portfolio } from "../lib/api";

interface InvestmentItem {
  id: string;
  amountSol: number;
  stake: number;
  startup: {
    id: string;
    name: string;
    description: string;
    totalRaised: number;
    valuation: number;
  };
}

export function Portfolio() {
  const [items, setItems] = useState<InvestmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    portfolio
      .list()
      .then(({ data }) => setItems(data))
      .catch(() => setError("Failed to load portfolio"))
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

  const totalStake = items.reduce((a, i) => a + i.stake, 0);
  const totalSol = items.reduce((a, i) => a + i.amountSol, 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Your portfolio</h1>
      <div className="mb-6 flex gap-6 rounded-lg border border-white/5 bg-[#0c0c0c] p-4">
        <div>
          <p className="text-sm text-slate-500">Total invested</p>
          <p className="text-xl font-semibold text-emerald-400">
            {totalSol.toFixed(2)} SOL
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Total stake</p>
          <p className="text-xl font-semibold">
            {(totalStake * 100).toFixed(2)}%
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((inv) => (
          <Link
            key={inv.id}
            to={`/startup/${inv.startup.id}`}
            className="block rounded-xl border border-white/5 bg-[#0c0c0c] p-4 transition hover:border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{inv.startup.name}</h3>
                <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">
                  {inv.startup.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400">{inv.amountSol} SOL</p>
                <p className="text-sm text-slate-500 truncate">
                  {(inv.stake * 100).toFixed(2)}% stake
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-500">
          No investments yet. Browse startups to invest.
        </p>
      )}
    </div>
  );
}
