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
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
      >
        ← Back to startups
      </Link>
      <div className="rounded-xl border border-white/5 bg-[#111] p-6 sm:p-8">
        <h1 className="text-2xl font-bold">{startup.name}</h1>
        <p className="mt-2 text-slate-400">{startup.description}</p>
        <p className="mt-2 text-sm text-slate-500">
          by {startup.founder.name}
        </p>

        <div className="mt-8 flex items-center gap-4 text-sm">
          <span className="text-slate-400">
            Valuation: ${startup.valuation.toLocaleString()}
          </span>
          <span
            className={
              isFundingOpen ? "text-[#1b7f53] font-medium" : "text-amber-500 font-medium"
            }
          >
            {countdown}
          </span>
        </div>

        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-[#1a1a1a]">
            <div
              className="h-full rounded-full bg-[#1b7f53] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            ${startup.totalRaised.toFixed(0)} / ${VALUATION.toLocaleString()} (
            {progress.toFixed(0)}%)
          </p>
        </div>

        {isFundingOpen && user && (
          <div className="mt-8 rounded-xl border border-white/5 bg-[#1a1a1a] p-5 sm:p-6">
            <h3 className="font-semibold text-white">Invest with SOL</h3>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">
              1 SOL = $100 • Stake = (amount × 100) / $20,000
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount in SOL"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="w-48 rounded-lg border border-white/10 bg-[#111] px-4 py-2.5 text-sm text-slate-100 placeholder-[#666] focus:border-[#444] focus:bg-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#444] transition-all"
              />
              <button
                onClick={handleInvestClick}
                disabled={investing}
                className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-slate-200 disabled:opacity-50 transition-colors shadow-lg"
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
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-bold text-white tracking-wide">Investors</h2>
          <ul className="space-y-3">
            {startup.investments.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center rounded-lg border border-white/5 bg-[#111] px-5 py-3.5 text-sm transition-colors hover:border-white/10"
              >
                <span className="font-medium text-slate-300">{inv.investor.name}</span>
                <span className="mx-3 text-slate-700">•</span>
                <span className="font-semibold text-[#1b7f53]">{inv.amountSol} SOL</span>
                <span className="mx-3 text-slate-700">•</span>
                <span className="text-slate-500 font-medium">
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
