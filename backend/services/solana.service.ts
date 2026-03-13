import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { ESCROW_WALLET } from "../config/env.js";

const RPC_URL = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface VerificationResult {
  success: boolean;
  error?: string;
  sender?: string;
  receiver?: string;
  amountSol?: number;
}

export async function verifyTransaction(
  txHash: string,
  expectedSender: string,
  expectedAmountSol: number
): Promise<VerificationResult> {
  if (!ESCROW_WALLET) {
    return { success: false, error: "ESCROW_WALLET not configured" };
  }

  const connection = new Connection(RPC_URL, "confirmed");

  try {
    // Retry up to 5 times with 3s delay — RPC indexing can lag behind confirmation
    let tx = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      tx = await connection.getParsedTransaction(txHash, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });
      if (tx) break;
      console.log(`verifyTransaction: attempt ${attempt}/5 — tx not yet indexed, retrying in 3s…`);
      await sleep(3000);
    }

    if (!tx) {
      return { success: false, error: "Transaction not found after retries. Please try again in a few seconds." };
    }

    if (tx.meta?.err) {
      return { success: false, error: "Transaction failed on-chain" };
    }

    // Find SOL transfer from sender to escrow
    const accountKeys = tx.transaction.message.accountKeys;
    const senderIndex = accountKeys.findIndex(
      (k) => k.pubkey.toBase58() === expectedSender
    );
    const escrowIndex = accountKeys.findIndex(
      (k) => k.pubkey.toBase58() === ESCROW_WALLET
    );

    if (senderIndex < 0) {
      return { success: false, error: "Sender not in transaction" };
    }
    if (escrowIndex < 0) {
      return { success: false, error: "Escrow wallet not in transaction" };
    }

    // Parse balance changes from pre/post
    const preBalances = tx.meta?.preBalances ?? [];
    const postBalances = tx.meta?.postBalances ?? [];
    const lamportsReceived =
      (postBalances[escrowIndex] ?? 0) - (preBalances[escrowIndex] ?? 0);
    const lamportsSent =
      (preBalances[senderIndex] ?? 0) - (postBalances[senderIndex] ?? 0);

    const amountSol = lamportsReceived / LAMPORTS_PER_SOL;

    // Verify sender sent SOL to escrow
    if (lamportsReceived <= 0 || lamportsSent <= 0) {
      return {
        success: false,
        error: "No SOL transfer from sender to escrow found",
      };
    }

    if (Math.abs(amountSol - expectedAmountSol) > 0.0001) {
      return {
        success: false,
        error: `Amount mismatch: expected ${expectedAmountSol} SOL, got ${amountSol}`,
      };
    }

    return {
      success: true,
      sender: expectedSender,
      receiver: ESCROW_WALLET,
      amountSol,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Verification failed";
    return { success: false, error: msg };
  }
}
