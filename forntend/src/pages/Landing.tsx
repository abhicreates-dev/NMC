import { useState, useEffect, useRef } from "react";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap');

    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html { scroll-behavior:smooth; }

    :root {
      --bg:#1a1d1a; --bg-dark:#161916; --bg-panel:#232723; --bg-input:#2a2e2a;
      --green:#4ade80; --green-dark:#22c55e; --green-hl:rgba(74,222,128,0.15);
      --green-bar:rgba(74,222,128,0.2); --border:rgba(255,255,255,0.08);
      --border-mid:rgba(255,255,255,0.12); --text:#e8ece8; --muted:#6b756b;
      --muted2:#4a524a; --white:#f5f8f5; --grid-color:rgba(255,255,255,0.04);
    }

    body {
      background:#1a1d1a;
      color:#e8ece8;
      font-family:'IBM Plex Mono', monospace;
      overflow-x:hidden;
    }

    .root-bg {
      background-image:
        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size:90px 90px;
    }

    @keyframes cursor-blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
    @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.2;} }
    @keyframes ldot-blink { 0%,100%{opacity:1;} 50%{opacity:0.2;} }

    .cursor-blink {
      display:inline-block; width:2px; height:1em;
      background:#f5f8f5; vertical-align:text-bottom;
      margin-left:1px; animation:cursor-blink 1s step-end infinite;
    }
    .ldot {
      width:5px; height:5px; border-radius:50%;
      background:#4ade80; animation:blink 1.4s ease-in-out infinite;
    }

    .reveal { opacity:0; transform:translateY(18px); transition:opacity 0.55s ease, transform 0.55s ease; }
    .reveal.vis { opacity:1; transform:translateY(0); }
    .d1{transition-delay:.07s;} .d2{transition-delay:.14s;}
    .d3{transition-delay:.21s;} .d4{transition-delay:.28s;}

    .fc:hover { background:rgba(74,222,128,0.025); }
    .fc::after { content:''; position:absolute; left:0; bottom:0; right:0; height:1px; background:linear-gradient(90deg,#4ade80,transparent); opacity:0; transition:opacity 0.3s; }
    .fc:hover::after { opacity:0.6; }

    .step:hover { background:rgba(74,222,128,0.02); }

    .trust-cell:hover { background:rgba(255,255,255,0.02); }
    .trust-cell:hover .trust-logo-text { opacity:0.9; }

    .btn-primary-hero:hover { background:#22c55e; border-color:#22c55e; transform:translateX(2px); }
    .btn-secondary-hero:hover { border-color:rgba(255,255,255,0.25); color:#f5f8f5; transform:translateX(2px); }
    .btn-get-started:hover { background:#4ade80; border-color:#4ade80; }
    .btn-sign-in:hover { color:#f5f8f5; }
    .cta-btn-green:hover { background:#22c55e; border-color:#22c55e; transform:translateX(3px); }

    .mkt-outer::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,#4ade80,rgba(74,222,128,0.3),transparent); }
    .mkt-outer::after { content:''; position:absolute; top:-120px; right:-80px; width:400px; height:400px; border-radius:50%; background:radial-gradient(ellipse,rgba(74,222,128,0.06) 0%,transparent 70%); pointer-events:none; }

    .cta-box::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#4ade80,transparent); opacity:0.5; }

    .vision-section::before { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:700px; height:200px; border-radius:50%; background:radial-gradient(ellipse,rgba(74,222,128,0.07) 0%,transparent 70%); pointer-events:none; }

    @media(max-width:1100px){
      .hero-cols { grid-template-columns:1fr !important; }
      .trust-logos { grid-template-columns:repeat(4,1fr) !important; }
      .feat-grid { grid-template-columns:1fr !important; }
      .hiw-row { grid-template-columns:1fr 1fr !important; }
      .mkt-2col,.cta-box { grid-template-columns:1fr !important; }
      .nav-center { display:none !important; }
    }
    @media(max-width:640px){
      .hiw-row { grid-template-columns:1fr !important; }
      .trust-logos { grid-template-columns:repeat(2,1fr) !important; }
      .mock-right-card { display:none !important; }
    }
  `}</style>
);

function useReveal() {
  useEffect(() => {
    const items = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("vis"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useTyping(elRef: React.RefObject<HTMLSpanElement | null>) {
  useEffect(() => {
    const phrases = [
      "Can you launch this startup idea",
      "Build a SaaS in 72 hours",
      "Run market analysis on fintech",
      "Deploy AI agents for growth",
      "Can you fix this proj",
    ];
    let pi = 0, ci = 0, deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    function type() {
      const phrase = phrases[pi];
      if (!deleting) {
        ci++;
        if (elRef.current) elRef.current.textContent = phrase.slice(0, ci);
        if (ci === phrase.length) { deleting = true; timer = setTimeout(type, 2000); return; }
        timer = setTimeout(type, 55 + Math.random() * 30);
      } else {
        ci--;
        if (elRef.current) elRef.current.textContent = phrase.slice(0, ci);
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; timer = setTimeout(type, 400); return; }
        timer = setTimeout(type, 30);
      }
    }
    timer = setTimeout(type, 1000);
    return () => clearTimeout(timer);
  }, []);
}

const ArrowRight = ({ size = 14, stroke = "currentColor", strokeWidth = 2.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const Play = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const ChevDown = () => (
  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const LayersIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

function AnnounceBar() {
  return (
    <div style={{
      position: "relative", zIndex: 200, background: "#4ade80",
      textAlign: "center", padding: "7px 16px", fontSize: "0.75rem",
      fontWeight: 500, color: "#0d1a10", letterSpacing: "0.01em",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      fontFamily: "'IBM Plex Mono', monospace"
    }}>
      For students like us <strong>Launch your startup in 72 hours</strong>  &nbsp;
      <a href="#cta" style={{ color: "#0d1a10", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid rgba(0,0,0,0.3)" }}>
        Learn More →
      </a>
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100, height: 56,
      background: "rgba(26,29,26,0.97)", backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: `1px solid ${scrolled ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.08)"}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px", transition: "border-color 0.3s",
      fontFamily: "'IBM Plex Mono', monospace"
    }}>
      <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, color: "#f5f8f5", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
        <div style={{ width: 28, height: 28, border: "1.5px solid #4ade80", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
          <LayersIcon />
        </div>
        No Man Company
      </a>

      <div className="nav-center" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 28, alignItems: "center" }}>
        {([["#features", "Product", true], ["#hiw", "How it Works", false], ["#marketplace", "Marketplace", false], ["#vision", "Vision", false], ["#", "Docs", false]] as [string, string, boolean][]).map(([href, label, hasChev]) => (
          <a key={label} href={href} style={{ textDecoration: "none", fontSize: "0.8125rem", color: "#6b756b", transition: "color 0.18s", display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#e8ece8"}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#6b756b"}>
            {label} {hasChev && <ChevDown />}
          </a>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a href="/login" className="btn-sign-in" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem", color: "#e8ece8", background: "transparent", border: "none", cursor: "pointer", padding: "6px 14px", transition: "color 0.18s", textDecoration: "none" }}>Sign In</a>
        <a href="/signup" className="btn-get-started" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem", fontWeight: 500, color: "#0d1a10", background: "#f5f8f5", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 5, padding: "7px 16px", cursor: "pointer", textDecoration: "none", transition: "all 0.18s", whiteSpace: "nowrap" }}>Launch AI Startup</a>
      </div>
    </nav>
  );
}

function HeroSection() {
  const typingRef = useRef<HTMLSpanElement>(null);
  useTyping(typingRef);

  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 1380, margin: "0 auto", padding: "0 48px", fontFamily: "'IBM Plex Mono', monospace" }}>
      <div style={{ paddingTop: 52, paddingBottom: 32 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(4.5rem, 8.5vw, 9.5rem)", lineHeight: 0.9, letterSpacing: "0.01em", color: "#f5f8f5", maxWidth: 820 }}>
          <span style={{ color: "#4ade80" }}>Startups</span> that build
          <span style={{ color: "#4ade80" }}> themselves.</span>
        </h1>
      </div>

      <div className="hero-cols" style={{ display: "grid", gridTemplateColumns: "520px 1fr", gap: "3rem", alignItems: "start", paddingBottom: "4rem" }}>
        <div>
          <div style={{ display: "inline-block", background: "rgba(74,222,128,0.2)", borderLeft: "2px solid #4ade80", padding: "4px 12px", fontSize: "0.8125rem", color: "#4ade80", fontWeight: 400, marginBottom: 12, letterSpacing: "0.01em" }}>
            The autonomous startup economy.
          </div>
          <p style={{ fontSize: "0.8125rem", fontWeight: 300, color: "#6b756b", lineHeight: 1.8, maxWidth: 420, marginBottom: 28 }}>
            Autonomous AI agents create, launch, and scale digital companies while communities invest and share profits.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 440 }}>
            <a href="#marketplace" className="btn-primary-hero" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px", background: "#4ade80", border: "1px solid #4ade80", borderRadius: 3, color: "#0d1a10", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", cursor: "pointer", transition: "all 0.18s", letterSpacing: "0.01em" }}>
              Explore Marketplace
              <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(0,0,0,0.15)" }}>
                <ArrowRight />
              </span>
            </a>
            <a href="#hiw" className="btn-secondary-hero" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3, color: "#e8ece8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", fontWeight: 400, textDecoration: "none", cursor: "pointer", transition: "all 0.18s" }}>
              See How It Works
              <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(0,0,0,0.15)" }}>
                <Play />
              </span>
            </a>
          </div>
        </div>

        <div style={{ position: "relative", height: 520 }}>
          <div style={{ position: "absolute", top: 0, right: 0, left: 0, height: 290, background: "#161916", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.7),0 4px 16px rgba(0,0,0,0.5)", zIndex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#1a1d1a", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
              <div style={{ flex: 1, margin: "0 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "3px 10px", fontSize: "0.6rem", color: "#4a524a", letterSpacing: "0.03em" }}>nomancompany.ai/marketplace</div>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#4a524a" strokeWidth={2}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1={10} y1={14} x2={21} y2={3} /></svg>
            </div>
            <div style={{ flex: 1, background: "linear-gradient(135deg,#2d4a3e 0%,#3a5c48 15%,#4a6e54 25%,#5a8060 35%,#6a4a3a 45%,#7a5a4a 55%,#5a4a6a 65%,#4a3a5a 75%,#3a4a5a 85%,#2a3a4a 100%)", position: "relative", overflow: "hidden" }}>
              <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
                <defs>
                  <radialGradient id="g1" cx="30%" cy="40%"><stop offset="0%" stopColor="#4a8c6a" stopOpacity="0.8" /><stop offset="100%" stopColor="transparent" /></radialGradient>
                  <radialGradient id="g2" cx="70%" cy="60%"><stop offset="0%" stopColor="#6a4a8c" stopOpacity="0.6" /><stop offset="100%" stopColor="transparent" /></radialGradient>
                  <radialGradient id="g3" cx="50%" cy="20%"><stop offset="0%" stopColor="#4ade80" stopOpacity="0.15" /><stop offset="100%" stopColor="transparent" /></radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="#1a2e22" />
                <rect width="100%" height="100%" fill="url(#g1)" />
                <rect width="100%" height="100%" fill="url(#g2)" />
                <rect width="100%" height="100%" fill="url(#g3)" />
                <line x1={0} y1={50} x2={600} y2={80} stroke="rgba(74,222,128,0.06)" strokeWidth={1} />
                <line x1={0} y1={100} x2={600} y2={130} stroke="rgba(74,222,128,0.04)" strokeWidth={1} />
                <line x1={0} y1={150} x2={600} y2={170} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
              </svg>
            </div>
          </div>

          <div style={{ position: "absolute", top: 70, left: -30, width: "56%", height: 260, background: "#1e221e", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.7),0 4px 16px rgba(0,0,0,0.5)", zIndex: 3 }}>
            <div style={{ background: "#242824", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
              </div>
              <div style={{ fontSize: "0.7rem", color: "#e8ece8", fontWeight: 500, display: "flex", alignItems: "center", gap: 5, marginLeft: 8 }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2}><circle cx={12} cy={12} r={3} /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4" /></svg>
                AI Agent Console
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#4a524a" strokeWidth={2}><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1={6} y1={1} x2={6} y2={4} /><line x1={10} y1={1} x2={10} y2={4} /><line x1={14} y1={1} x2={14} y2={4} /></svg>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#4a524a" strokeWidth={2}><line x1={12} y1={5} x2={12} y2={19} /><line x1={5} y1={12} x2={19} y2={12} /></svg>
              </div>
            </div>
            <div style={{ display: "flex", gap: 2, padding: "0 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Overview", "Agents", "Logs"].map((tab, i) => (
                <div key={tab} style={{ fontSize: "0.62rem", color: i === 0 ? "#4ade80" : "#4a524a", padding: "6px 12px", borderBottom: i === 0 ? "1px solid #4ade80" : "none", marginBottom: i === 0 ? -1 : 0, cursor: "pointer" }}>{tab}</div>
              ))}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.62rem", color: "#6b756b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "3px 8px", background: "rgba(255,255,255,0.04)", margin: "6px 10px", width: "fit-content" }}>
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1={12} y1={5} x2={12} y2={19} /><line x1={5} y1={12} x2={19} y2={12} /></svg>
              New Task
            </div>
            <div style={{ padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4 }}>
                <div style={{ fontSize: "0.6rem", color: "#4ade80", marginBottom: 3 }}>✓ Verify product-market fit</div>
                <div style={{ fontSize: "0.58rem", color: "#4a524a" }}>CEO Agent · 2min ago</div>
              </div>
              <div style={{ padding: "8px 10px", background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 4 }}>
                <div style={{ fontSize: "0.6rem", color: "#e8ece8", marginBottom: 3 }}>→ Scaffold MVP architecture</div>
                <div style={{ fontSize: "0.58rem", color: "#4a524a" }}>Dev Agent · running...</div>
              </div>
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 175, left: "5%", right: "5%", background: "rgba(26,29,26,0.9)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "12px 14px", zIndex: 4, backdropFilter: "blur(8px)" }}>
            <div style={{ fontSize: "0.62rem", color: "#4a524a", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" /></svg>
              <span style={{ color: "#6b756b" }}>Thought for 1 second</span>
            </div>
            <p style={{ fontSize: "0.65rem", color: "#6b756b", lineHeight: 1.6, marginBottom: 6 }}>I need to validate the market first. Let me run demand analysis and generate a business summary.</p>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "5px 10px", fontSize: "0.62rem", color: "#4ade80", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="4 17 10 11 4 5" /><line x1={12} y1={19} x2={20} y2={19} /></svg>
              cd /workspace/no-man-co &amp;&amp; agent run --mode=ceo --task=validate
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 0, left: "5%", right: "5%", height: 170, background: "#2a2e2a", borderRadius: 12, zIndex: 5, border: "1px solid rgba(74,222,128,0.2)", boxShadow: "0 0 0 1px rgba(74,222,128,0.08),0 20px 60px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", overflow: "visible" }}>
            <div style={{ flex: 1, padding: "14px 16px 8px", fontSize: "0.875rem", color: "#f5f8f5", lineHeight: 1.5, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, overflow: "hidden" }}>
              <span ref={typingRef}>Can you launch this startup idea</span>
              <span className="cursor-blink" />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {["Agent", "Auto"].map((label, i) => (
                  <div key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.68rem", color: "#e8ece8", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "3px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>
                    {i === 0 && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>}
                    {label} <ChevDown />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {[
                  <svg key="mail" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
                  <svg key="globe" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={12} r={10} /><line x1={2} y1={12} x2={22} y2={12} /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
                  <svg key="img" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={3} width={18} height={18} rx={2} /><circle cx={8.5} cy={8.5} r={1.5} /><polyline points="21 15 16 10 5 21" /></svg>
                ].map((icon, i) => (
                  <span key={i} style={{ color: "#6b756b", cursor: "pointer", display: "flex", alignItems: "center", transition: "color 0.15s" }}>{icon}</span>
                ))}
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#4a524a", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1={12} y1={19} x2={12} y2={23} /><line x1={8} y1={23} x2={16} y2={23} /></svg>
                </div>
              </div>
            </div>
            <div style={{ padding: "6px 14px 8px", display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.65rem", color: "#6b756b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "2px 8px", background: "rgba(255,255,255,0.03)", cursor: "pointer" }}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={2} y={3} width={20} height={14} rx={2} /><line x1={8} y1={21} x2={16} y2={21} /><line x1={12} y1={17} x2={12} y2={21} /></svg>
                Local <ChevDown />
              </div>
            </div>
          </div>

          <div className="mock-right-card" style={{ position: "absolute", top: 30, right: -10, width: "46%", background: "#1e221e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden", zIndex: 2, boxShadow: "0 16px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ background: "#222622", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "7px 12px", fontSize: "0.6rem", color: "#4a524a", display: "flex", alignItems: "center", gap: 6 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
              ))}
              <span style={{ marginLeft: 4 }}>nomancompany.ai</span>
            </div>
            <div style={{ padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 12 }}>
              {["Ventures", "Agents", "Portfolio", "Stake"].map((t, i) => (
                <span key={t} style={{ fontSize: "0.58rem", color: i === 0 ? "#4ade80" : "#4a524a", borderBottom: i === 0 ? "1px solid #4ade80" : "none", paddingBottom: 4, cursor: "pointer" }}>{t}</span>
              ))}
            </div>
            <div style={{ padding: "14px 14px 10px" }}>
              <div style={{ fontSize: "0.58rem", color: "#4ade80", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>New Ventures Live</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#f5f8f5", lineHeight: 1.05, marginBottom: 4 }}>Launch your<br /><span style={{ color: "#4ade80" }}>AI economy.</span></div>
              <p style={{ fontSize: "0.62rem", color: "#6b756b", lineHeight: 1.5, marginBottom: 12 }}>The all-in-one platform where AI builds, runs, and scales startups while you earn.</p>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ fontSize: "0.62rem", background: "#4ade80", color: "#0d1a10", padding: "5px 10px", borderRadius: 3, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>Join Early →</button>
                <button style={{ fontSize: "0.62rem", background: "transparent", color: "#6b756b", padding: "5px 10px", borderRadius: 3, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace" }}>View Demo</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustSection() {
  const logos = ["PALOALTO", "BYTEDANCE", "SENTRY", "GOOGLE", "APPLE", "ADOBE", "NEXUS", "STRIPE", "VERCEL", "OPENAI", "FIGMA", "LINEAR"];

  return (
    <div style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", fontFamily: "'IBM Plex Mono', monospace" }}>
      <style>{`
        @keyframes marquee { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
        .marquee-track { display:flex; width:max-content; animation:marquee 28s linear infinite; }
        .marquee-track:hover { animation-play-state:paused; }
        .marquee-item { display:flex; align-items:center; justify-content:center; padding:26px 48px; border-right:1px solid rgba(255,255,255,0.08); cursor:pointer; transition:background 0.2s; white-space:nowrap; flex-shrink:0; }
        .marquee-item:hover { background:rgba(255,255,255,0.02); }
        .marquee-item:hover .mq-logo { opacity:0.9; color:#4ade80; }
        .mq-logo { font-size:0.8rem; font-weight:600; color:#f5f8f5; letter-spacing:0.08em; opacity:0.5; transition:opacity 0.2s, color 0.2s; }
      `}</style>

      <div style={{ padding: "32px 48px 0", maxWidth: 1380, margin: "0 auto", fontSize: "0.8125rem", color: "#6b756b", letterSpacing: "0.01em" }}>
        // Trusted by <span style={{ color: "#4ade80" }}>autonomous investment communities</span> worldwide.
      </div>

      <div style={{ position: "relative", marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(90deg, #1a1d1a 0%, transparent 100%)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(270deg, #1a1d1a 0%, transparent 100%)", zIndex: 2, pointerEvents: "none" }} />
        <div className="marquee-track">
          {[...logos, ...logos].map((logo, i) => (
            <div key={i} className="marquee-item"><span className="mq-logo">{logo}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    { num: "01 / Strategy", icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={1.8}><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>, title: "AI CEO Decision Engine", desc: "A sovereign reasoning model that formulates strategy, allocates resources, and makes high-stakes decisions autonomously — with full accountability trails.", badge: "⬡ Always Active" },
    { num: "02 / Engineering", icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={1.8}><rect x={2} y={3} width={20} height={14} rx={2} /><path d="M8 21h8M12 17v4" /></svg>, title: "Autonomous Product Development", desc: "From architecture to deployment, AI developer agents design, code, test, and iterate on digital products with zero human input — shipping continuously.", badge: "⬡ Self-Deploying" },
    { num: "03 / Growth", icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={1.8}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>, title: "Self-Optimizing Marketing Agents", desc: "Growth agents run experiments across channels, analyze real-time signals, and rewrite campaigns — compounding traction without a human growth team.", badge: "⬡ Growth Loop" },
    { num: "04 / Capital", icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={1.8}><line x1={12} y1={1} x2={12} y2={23} /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>, title: "Community Investment Marketplace", desc: "Stake in AI-built ventures, track real-time KPIs, and receive automated profit distributions — ownership without operations.", badge: "⬡ Earn Passively" },
  ];

  return (
    <section id="features" style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "6rem 48px", maxWidth: 1380, margin: "0 auto", fontFamily: "'IBM Plex Mono', monospace" }}>
      <div className="reveal">
        <div style={{ fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4ade80", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 16, height: 1, background: "#4ade80", display: "inline-block" }} />Core Platform
        </div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem,5vw,5.5rem)", lineHeight: 0.92, letterSpacing: "0.01em", color: "#f5f8f5", marginBottom: "1rem" }}>
          Built Different.<br /><span style={{ color: "#4ade80" }}>By Design.</span>
        </h2>
        <p style={{ fontSize: "0.8125rem", fontWeight: 300, color: "#6b756b", lineHeight: 1.8, maxWidth: 460, marginBottom: "3.5rem" }}>
          Every layer runs on intelligent, adaptive AI agents that never sleep, never guess, and never stop shipping.
        </p>
      </div>
      <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {features.map((f, i) => (
          <div key={i} className={`fc reveal d${i + 1}`} style={{ padding: "2.25rem 2rem", borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.08)" : "none", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none", transition: "background 0.2s", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "0.6rem", color: "#4a524a", letterSpacing: "0.1em", marginBottom: "1rem", textTransform: "uppercase" }}>{f.num}</div>
            <div style={{ width: 38, height: 38, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)", marginBottom: "1.25rem" }}>{f.icon}</div>
            <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#f5f8f5", marginBottom: "0.625rem", letterSpacing: "-0.01em" }}>{f.title}</div>
            <p style={{ fontSize: "0.78rem", fontWeight: 300, color: "#6b756b", lineHeight: 1.75 }}>{f.desc}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: "1.25rem", fontSize: "0.62rem", color: "#4ade80", letterSpacing: "0.06em", textTransform: "uppercase" }}>{f.badge}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { n: "01", h: "AI Validates Startup Ideas", p: "Market agents assess demand signals, competitive landscapes, and monetization viability before any resources are committed." },
    { n: "02", h: "Agents Build & Launch Products", p: "Developer, design, and ops agents collaborate to ship functional digital products end-to-end, without oversight." },
    { n: "03", h: "Products Enter the Marketplace", p: "Launched companies are listed with live metrics, growth trajectories, and investment terms for community review." },
    { n: "04", h: "Community Earns from Growth", p: "Stakeholders receive automated distributions as AI agents continue scaling revenue — a perpetual yield engine." },
  ];

  return (
    <section id="hiw" style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "6rem 48px", maxWidth: 1380, margin: "0 auto", fontFamily: "'IBM Plex Mono', monospace" }}>
      <div className="reveal">
        <div style={{ fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4ade80", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 16, height: 1, background: "#4ade80", display: "inline-block" }} /> Process
        </div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem,5vw,5.5rem)", lineHeight: 0.92, color: "#f5f8f5", marginBottom: "1rem" }}>
          From Idea to<br /><span style={{ color: "#4ade80" }}>Economy.</span>
        </h2>
        <p style={{ fontSize: "0.8125rem", fontWeight: 300, color: "#6b756b", lineHeight: 1.8, maxWidth: 460, marginBottom: 0 }}>
          A fully closed-loop system where AI handles every stage — validation to profit distribution.
        </p>
      </div>
      <div className="hiw-row" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: "1px solid rgba(255,255,255,0.08)", marginTop: "3rem" }}>
        {steps.map((s, i) => (
          <div key={i} className={`step reveal d${i + 1}`} style={{ padding: "1.75rem 1.5rem", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none", position: "relative", transition: "background 0.2s" }}>
            <div style={{ width: 24, height: 24, background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", fontWeight: 600, color: "#4ade80", marginBottom: "1rem" }}>{s.n}</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f5f8f5", marginBottom: "0.6rem", lineHeight: 1.3 }}>{s.h}</div>
            <p style={{ fontSize: "0.75rem", fontWeight: 300, color: "#6b756b", lineHeight: 1.7 }}>{s.p}</p>
            {i < 3 && (
              <div style={{ position: "absolute", top: 24, right: -8, width: 14, height: 14, background: "#1a1d1a", border: "1px solid #4ade80", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <svg width={7} height={7} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function MarketplaceSection() {
  const bars = [30, 45, 38, 60, 52, 72, 65, 80, 76, 90, 84, 100];

  return (
    <section id="marketplace" style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "6rem 48px", maxWidth: 1380, margin: "0 auto", fontFamily: "'IBM Plex Mono', monospace" }}>
      <div className="reveal">
        <div style={{ fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4ade80", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 16, height: 1, background: "#4ade80", display: "inline-block" }} /> Marketplace
        </div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem,5vw,5.5rem)", lineHeight: 0.92, color: "#f5f8f5", marginBottom: "1rem" }}>
          Where <span style={{ color: "#4ade80" }}>AI Companies</span><br />Are the Product.
        </h2>
        <p style={{ fontSize: "0.8125rem", fontWeight: 300, color: "#6b756b", lineHeight: 1.8, maxWidth: 460, marginBottom: "3.5rem" }}>
          Stake in AI-built startups. Track real-time performance. Earn automated profit distributions.
        </p>
      </div>

      <div className="mkt-outer reveal" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(26,29,26,0.6)", padding: "3.5rem", position: "relative", overflow: "hidden" }}>
        <div className="mkt-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>
          <div>
            <div style={{ fontSize: "0.68rem", color: "#6b756b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Platform Features</div>
            {[
              { icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>, title: "Stake in AI-Built Startups", desc: "Browse active AI ventures, review live metrics, and take ownership positions in seconds." },
              { icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>, title: "Track Real-Time Performance", desc: "Live dashboards surface revenue, growth rates, and agent activity for every company on the platform." },
              { icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2}><line x1={12} y1={1} x2={12} y2={23} /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>, title: "Earn Automated Distributions", desc: "Smart contracts execute profit-sharing automatically — no manual claims, no middlemen, no delays." },
            ].map((feat, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "1.25rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", borderTop: i === 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{ width: 30, height: 30, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{feat.icon}</div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f5f8f5", marginBottom: 4 }}>{feat.title}</div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 300, color: "#6b756b", lineHeight: 1.65 }}>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#161916", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.875rem", marginBottom: "0.875rem" }}>
                <div style={{ fontSize: "0.68rem", color: "#6b756b", letterSpacing: "0.06em", textTransform: "uppercase" }}>Portfolio Overview</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.6rem", color: "#4ade80", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  <span className="ldot" /> Live
                </div>
              </div>
              {[
                { n: "Total Ventures", v: "24", d: "+3 this wk" },
                { n: "Combined ARR", v: "$4.2M", d: "↑38%" },
                { n: "Avg Monthly Growth", v: "41.2%", d: null },
                { n: "Distributions Paid", v: "$184k", d: "this mo." },
                { n: "Active AI Agents", v: "1,240", d: "running" },
              ].map((row) => (
                <div key={row.n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: "0.72rem", color: "#6b756b" }}>{row.n}</div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#f5f8f5" }}>
                    {row.v}{row.d && <span style={{ fontSize: "0.62rem", color: "#4ade80", marginLeft: 4 }}>{row.d}</span>}
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 36, paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "0.875rem" }}>
                {bars.map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: i === bars.length - 1 ? "rgba(74,222,128,0.5)" : i === bars.length - 3 ? "rgba(74,222,128,0.3)" : "rgba(74,222,128,0.12)", borderTop: `1px solid ${i === bars.length - 1 ? "#4ade80" : i === bars.length - 3 ? "rgba(74,222,128,0.4)" : "rgba(74,222,128,0.2)"}`, borderRadius: 1 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisionSection() {
  return (
    <section id="vision" className="vision-section" style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8rem 48px", textAlign: "center", maxWidth: 1380, margin: "0 auto", fontFamily: "'IBM Plex Mono', monospace" }}>
      <div className="vis-kicker reveal" style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#4ade80", marginBottom: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span style={{ width: 24, height: 1, background: "#4ade80", display: "inline-block" }} />
        The Paradigm Shift
        <span style={{ width: 24, height: 1, background: "#4ade80", display: "inline-block" }} />
      </div>
      <h2 className="reveal d1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem,7.5vw,8rem)", lineHeight: 0.9, letterSpacing: "0.02em", color: "#f5f8f5", marginBottom: "2rem", position: "relative", zIndex: 1 }}>
        From Human Companies<br /><span style={{ color: "#4ade80" }}>→ Autonomous Economies</span>
      </h2>
      <p className="reveal d2" style={{ fontSize: "0.8125rem", fontWeight: 300, color: "#6b756b", maxWidth: 460, margin: "0 auto", lineHeight: 1.8 }}>
        We are not building better tools for founders. We are replacing the need for founders entirely — and democratizing ownership of what comes next.
      </p>
    </section>
  );
}

function CTASection() {
  return (
    <section id="cta" style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "6rem 48px", maxWidth: 1380, margin: "0 auto", fontFamily: "'IBM Plex Mono', monospace" }}>
      <div className="cta-box reveal" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#232723", padding: "4.5rem", display: "grid", gridTemplateColumns: "1fr 400px", gap: "4rem", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4ade80", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 16, height: 1, background: "#4ade80", display: "inline-block" }} /> Early Access
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem,4.5vw,4.75rem)", lineHeight: 0.92, color: "#f5f8f5", marginBottom: "0.75rem" }}>
            Own a Share in<br /><span style={{ color: "#4ade80" }}>AI-Built Startups</span>
          </h2>
          <p style={{ fontSize: "0.8rem", fontWeight: 300, color: "#6b756b", lineHeight: 1.75 }}>
            Join the first wave of investors in the autonomous startup economy. Stakes are limited.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href="/signup" className="cta-btn-green" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#4ade80", border: "1px solid #4ade80", borderRadius: 3, color: "#0d1a10", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", cursor: "pointer", transition: "all 0.18s", letterSpacing: "0.02em", textTransform: "uppercase" }}>
            Join Early Access
            <ArrowRight size={15} strokeWidth={2.5} />
          </a>
          <div style={{ fontSize: "0.68rem", color: "#4a524a", textAlign: "center", letterSpacing: "0.04em" }}>
            // No management required. AI handles everything.
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "2.25rem 48px", maxWidth: 1380, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", fontFamily: "'IBM Plex Mono', monospace" }}>
      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#f5f8f5" }}>No Man Company</div>
      <ul style={{ display: "flex", gap: "2rem", listStyle: "none" }}>
        {[["#features", "Product"], ["#", "Whitepaper"], ["#", "Community"], ["#", "Contact"]].map(([href, label]) => (
          <li key={label}>
            <a href={href} style={{ fontSize: "0.75rem", color: "#6b756b", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#4ade80"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#6b756b"}>
              {label}
            </a>
          </li>
        ))}
      </ul>
      <div style={{ fontSize: "0.7rem", color: "#4a524a" }}>© No Man Company</div>
    </footer>
  );
}

export default function Landing() {
  useReveal();

  return (
    <>
      <FontLoader />
      <div id="root-" style={{ background: "#1a1d1a", minHeight: "100vh" }}>
        <div className="root-bg">
          <AnnounceBar />
          <Navbar />
          <HeroSection />
        </div>
        <TrustSection />
        <FeaturesSection />
        <HowItWorksSection />
        <MarketplaceSection />
        <VisionSection />
        <CTASection />
        <LandingFooter />
      </div>
    </>
  );
}
