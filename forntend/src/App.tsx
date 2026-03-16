import { useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
  LedgerWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { Startups } from "./pages/Startups";
import { StartupDetail } from "./pages/StartupDetail";
import { Build } from "./pages/Build";
import { Portfolio } from "./pages/Portfolio";
import { ProjectDev } from "./pages/ProjectDev";
import Landing from "./pages/Landing";

const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC ?? "https://api.devnet.solana.com";

function App() {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
      new LedgerWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={SOLANA_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/landing" element={<Landing />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/startups" replace />} />
                  <Route path="startups" element={<Startups />} />
                  <Route path="startup/:id" element={<StartupDetail />} />
                  <Route
                    path="build"
                    element={
                      <ProtectedRoute>
                        <Build />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="portfolio"
                    element={
                      <ProtectedRoute>
                        <Portfolio />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="chat/:id"
                    element={
                      <ProtectedRoute>
                        <ProjectDev />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                <Route path="*" element={<Navigate to="/startups" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
