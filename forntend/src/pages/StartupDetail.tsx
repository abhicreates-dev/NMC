import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { startups, invest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const VALUATION = 20_000;
const ESCROW_WALLET = import.meta.env.VITE_ESCROW_WALLET ?? "";

interface Investment {
  id: string;
  amountSol: number;
  stake: number;
  investor: { name: string; walletAddress: string };
}

interface StartupDetail {
  id: string;
  name: string;
  description: string;
  valuation: number;
  totalRaised: number;
  fundingOpenAt: string;
  founder: { name: string };
  investments: Investment[];
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

export function StartupDetail() {
  const { id } = useParams<{ id: string }>();
  const [startup, setStartup] = useState<StartupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [investAmount, setInvestAmount] = useState("");
  const [investing, setInvesting] = useState(false);
  const [investError, setInvestError] = useState("");
  const [countdown, setCountdown] = useState("");

  const { publicKey, sendTransaction, wallet } = useWallet();
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const { connection } = useConnection();
  const { user } = useAuth();
  const [pendingInvestAmount, setPendingInvestAmount] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!id) return;
    startups
      .get(id)
      .then(({ data }) => {
        setStartup(data);
        setCountdown(formatCountdown(data.fundingOpenAt));
      })
      .catch(() => setError("Startup not found"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!startup) return;
    const isOpen = new Date(startup.fundingOpenAt) <= new Date();
    if (isOpen) {
      setCountdown("Funding open");
      return;
    }
    const t = setInterval(
      () => setCountdown(formatCountdown(startup.fundingOpenAt)),
      1000
    );
    return () => clearInterval(t);
  }, [startup?.fundingOpenAt]);

  const isFundingOpen = startup && new Date(startup.fundingOpenAt) <= new Date();
  const progress = startup
    ? Math.min(100, (startup.totalRaised / VALUATION) * 100)
    : 0;

  // Auto-invest when wallet connects after user clicked Invest
  useEffect(() => {
    if (!publicKey || pendingInvestAmount === null) return;
    const amount = pendingInvestAmount;
    setPendingInvestAmount(null);
    handleInvestWithAmount(amount);
  }, [publicKey, pendingInvestAmount]);

  async function handleInvestWithAmount(amountSol: number) {
    if (!publicKey || !startup || !id) return;

    try {
      setInvesting(true);
      setInvestError("");

      const escrowPubkey = new PublicKey(ESCROW_WALLET);
      const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: escrowPubkey,
        lamports,
      });

      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        data: Buffer.from(`startup:${id}`),
      });

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(transferInstruction, memoInstruction);

      const signature = await sendTransaction(transaction, connection);

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      // Give RPC a moment to index before backend queries it
      await new Promise((r) => setTimeout(r, 2000));

      await invest.create({
        startupId: id,
        amountSol,
        txHash: signature,
        senderWallet: publicKey.toBase58(),
      });

      const { data } = await startups.get(id);
      setStartup(data);
      setInvestAmount("");
    } catch (error: unknown) {
      console.error(error);
      setInvestError(
        error instanceof Error ? error.message : "Investment failed"
      );
    } finally {
      setInvesting(false);
    }
  }

  function handleInvestClick() {
    const amount = parseFloat(investAmount);
    if (!amount || amount <= 0) {
      setInvestError("Enter a valid amount");
      return;
    }
    if (!user) {
      setInvestError("Please log in to invest");
      return;
    }
    if (!ESCROW_WALLET) {
      setInvestError("Escrow wallet not configured");
      return;
    }

    if (!publicKey) {
      // Not connected: store amount, open wallet (Phantom)
      setPendingInvestAmount(amount);
      setInvestError("");
      if (wallet) {
        wallet.adapter.connect();
      } else {
        setWalletModalVisible(true); // Open modal to pick Phantom
      }
    } else {
      // Already connected: send tx directly
      handleInvestWithAmount(amount);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div>
        <p className="text-red-400">{error ?? "Not found"}</p>
        <Link to="/startups" className="mt-4 inline-block text-emerald-400 hover:underline">
          ← Back to startups
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/startups"
        className="mb-4 inline-block text-slate-400 hover:text-white"
      >
        ← Back to startups
      </Link>
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h1 className="text-2xl font-bold">{startup.name}</h1>
        <p className="mt-2 text-slate-400">{startup.description}</p>
        <p className="mt-2 text-sm text-slate-500">
          by {startup.founder.name}
        </p>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-slate-500">
            Valuation: ${startup.valuation.toLocaleString()}
          </span>
          <span
            className={
              isFundingOpen ? "text-emerald-400" : "text-amber-400"
            }
          >
            {countdown}
          </span>
        </div>

        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            ${startup.totalRaised.toFixed(0)} / ${VALUATION.toLocaleString()} (
            {progress.toFixed(0)}%)
          </p>
        </div>

        {isFundingOpen && user && (
          <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            <h3 className="font-medium">Invest with SOL</h3>
            <p className="mt-1 text-xs text-slate-500">
              1 SOL = $100 • Stake = (amount × 100) / $20,000
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount in SOL"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handleInvestClick}
                disabled={investing}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
              >
                {investing ? "Processing…" : "Invest"}
              </button>
            </div>
            {investError && (
              <p className="mt-2 text-sm text-red-400">{investError}</p>
            )}
          </div>
        )}
      </div>

      {startup.investments.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-semibold">Investors</h2>
          <ul className="space-y-2">
            {startup.investments.map((inv) => (
              <li
                key={inv.id}
                className="rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-2 text-sm"
              >
                <span className="text-slate-300">{inv.investor.name}</span>
                <span className="mx-2 text-slate-600">•</span>
                <span className="text-emerald-400">{inv.amountSol} SOL</span>
                <span className="mx-2 text-slate-600">•</span>
                <span className="text-slate-400">
                  {(inv.stake * 100).toFixed(2)}% stake
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
