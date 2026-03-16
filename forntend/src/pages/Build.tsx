import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startups } from "../lib/api";
import { Plus, Boxes } from "lucide-react";

const CATEGORY_OPTIONS = [
  "AI",
  "SaaS",
  "FinTech",
  "Web3 / Crypto",
  "E-commerce",
  "EdTech",
  "HealthTech",
  "Creator Economy",
  "Gaming",
  "DevTools",
  "ClimateTech",
  "AgriTech",
  "Logistics",
  "PropTech",
  "Cybersecurity",
  "Robotics",
  "SpaceTech",
] as const;

const MAX_TAGS = 4;

export function Build() {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function toggleCategory(tag: string) {
    setCategories((prev) => {
      if (prev.includes(tag)) return prev.filter((c) => c !== tag);
      if (prev.length >= MAX_TAGS) return prev;
      return [...prev, tag];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (categories.length === 0) {
      setError("Choose at least one category (max 4).");
      return;
    }
    setLoading(true);
    try {
      await startups.create({
        name,
        description,
        categories,
        linkedinUrl: linkedinUrl.trim() || undefined,
        xUrl: xUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
      });
      navigate("/startups");
    } catch (err: unknown) {
      const data =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string; details?: string } } }).response?.data
          : null;
      setError(data?.details ?? data?.error ?? "Failed to create startup");
    } finally {
      setLoading(false);
    }
  }

  const labelW = "w-36 shrink-0";
  const rowClass = "flex items-center gap-6 py-4 border-b border-dashed border-white/10 first:pt-0";
  const labelClass = `text-sm text-slate-400 ${labelW}`;
  const inputClass = "flex-1 min-w-0 rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#4ade80] transition-colors";
  const inputClassTall = "flex-1 min-w-0 rounded-md border border-white/10 bg-transparent px-3 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-[#4ade80] focus:outline-none focus:ring-1 focus:ring-[#4ade80] transition-colors resize-none";

  if (isCreating) {
    return (
      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} className="rounded-xl   p-6 md:p-8">
          {/* Header row: title and subtitle aligned with label column */}
          <div className="flex gap-6 pb-4 mb-4  flex-col md:flex-row  items-start justify-between">
            <div className="">
              <h1 className="text-xl text-white tracking-tight" style={{ fontWeight: 500 }}>Create startup</h1>
              <p className="text-sm text-slate-500">Confirm your startup details and founder links.</p>
            </div>
            <div className="flex items-start justify-between gap-4">
            
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors shrink-0"
                style={{ fontWeight: 500 }}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Startup */}
          <div>
            <div className={rowClass}>
              <label className={labelClass} style={{ fontWeight: 500 }}>Startup name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Acme Corp"
                className={inputClass}
              />
            </div>

            <div className={rowClass}>
              <label className={labelClass} style={{ fontWeight: 500 }}>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Describe your startup vision..."
                className={inputClassTall}
              />
            </div>

            <div className={`${rowClass} items-start`}>
              <label className={labelClass} style={{ fontWeight: 500 }}>Category *</label>
              <div className="flex-1 min-w-0">
                <p className="mb-2 text-xs text-slate-500">Choose up to 4 tags.</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((tag) => {
                    const selected = categories.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleCategory(tag)}
                        className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                          selected
                            ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]"
                            : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
                        }`}
                        style={{ fontWeight: 500 }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                {categories.length > 0 && (
                  <p className="mt-1.5 text-xs text-slate-500">{categories.length} of {MAX_TAGS} selected</p>
                )}
              </div>
            </div>
          </div>

          {/* Founder */}
          <div className="pt-8 ">
            <div className="flex gap-6 mb-3">
              <div className={labelW}>
                <h2 className="text-sm text-white" style={{ fontWeight: 500 }}>Founder</h2>
              </div>
              <p className="text-xs text-slate-500">Optional links.</p>
            </div>

            <div className={rowClass}>
              <label className={labelClass} style={{ fontWeight: 500 }}>LinkedIn</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className={inputClass}
              />
            </div>

            <div className={rowClass}>
              <label className={labelClass} style={{ fontWeight: 500 }}>X</label>
              <input
                type="url"
                value={xUrl}
                onChange={(e) => setXUrl(e.target.value)}
                placeholder="https://x.com/..."
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-6 py-4">
              <label className={labelClass} style={{ fontWeight: 500 }}>Github (product)</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded-md border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              style={{ fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#4ade80] px-4 py-2 text-sm text-[#0d1a10] hover:bg-[#22c55e] disabled:opacity-50 transition-colors"
              style={{ fontWeight: 500 }}
            >
              {loading ? "Creating…" : "Create startup"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="mb-6 text-xl text-white tracking-tight" style={{ fontWeight: 500 }}>Create a new Startup</h1>

      <div className="flex flex-col items-center justify-center rounded-xl border bg-[#12141a]/50 border-white/5 py-24 text-center">
        <div className="mb-5 text-slate-500">
          <Boxes strokeWidth={1} className="w-16 h-16 mx-auto" />
        </div>
        <p className="mb-3 text-sm text-slate-500">No Startups</p>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          style={{ fontWeight: 500 }}
        >
          <Plus size={16} />
          Create Startup
        </button>
      </div>
    </div>
  );
}
