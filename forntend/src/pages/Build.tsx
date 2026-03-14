import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startups } from "../lib/api";
import { Plus, Boxes } from "lucide-react";

export function Build() {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await startups.create({ name, description });
            navigate(`/startups`);
        } catch (err: unknown) {
            const data =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { error?: string; details?: string } } })
                        .response?.data
                    : null;
            setError(data?.details ?? data?.error ?? "Failed to create startup");
        } finally {
            setLoading(false);
        }
    }

    if (isCreating) {
        return (
            <div className="mx-auto max-w-2xl bg-[#0f1115] border border-white/5 rounded-xl p-8 shadow-2xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-white">Create a new Startup</h1>
                    <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <Plus className="rotate-45" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Startup Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Acme Corp"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-md border border-white/5 bg-[#1f2229]/50 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 shadow-inner focus:border-white/10 focus:bg-[#1f2229]/70 focus:outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
                        <textarea
                            placeholder="Describe your startup vision..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={3}
                            className="w-full rounded-md border border-white/5 bg-[#1f2229]/50 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 shadow-inner focus:border-white/10 focus:bg-[#1f2229]/70 focus:outline-none transition-all"
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 flex items-center gap-2">
                            <span className="font-semibold text-red-500">Error:</span> {error}
                        </div>
                    )}

                    <div className="mt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="rounded-md border border-white/5 bg-[#1f2229]/50 px-5 py-2 text-sm font-medium text-slate-300 hover:bg-[#1f2229] hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-[#1b7f53] px-5 py-2 text-sm font-medium text-white hover:bg-[#1b7f53]/90 disabled:opacity-50 transition-colors"
                        >
                            {loading ? "Adding…" : "Add"}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h1 className="mb-6 text-xl font-medium text-white tracking-tight">Create a new Startup</h1>

            <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-[#12141a]/50 py-24 text-center">
                <div className="mb-5 text-slate-600 opacity-60">
                    <div className="relative h-24 w-24 mx-auto">
                        <Boxes strokeWidth={1} className="w-full h-full text-slate-500" />
                    </div>
                </div>
                <h3 className="mb-3 tracking-tight text-slate-500 text-sm">No Startups</h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <Plus size={16} />
                    Create Startup
                </button>
            </div>
        </div>
    );
}
