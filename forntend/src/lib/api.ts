import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const details = err.response?.data?.details ?? err.response?.data?.error;
    console.error("API Error:", err.response?.status, details, err.response?.data);
    return Promise.reject(err);
  }
);

export const auth = {
  signup: (data: {
    name: string;
    email: string;
    password: string;
    walletAddress: string;
  }) => api.post("/auth/signup", data),
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
};

export const startups = {
  list: () => api.get("/startups"),
  get: (id: string) => api.get(`/startups/${id}`),
  create: (data: { name: string; description: string }) =>
    api.post("/startups", data),
};

export const invest = {
  create: (data: {
    startupId: string;
    amountSol: number;
    txHash: string;
    senderWallet: string;
  }) => api.post("/invest", data),
};

export const portfolio = {
  list: () => api.get("/portfolio"),
};
