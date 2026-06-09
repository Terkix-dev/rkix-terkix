import React, { useState } from "react";
import {
  Check, ExternalLink, RefreshCw, AlertTriangle, Plus,
  Search, Zap, Shield, Database, Code2, Globe, GitBranch,
  Lock, ChevronRight
} from "lucide-react";

type IntegrationStatus = "connected" | "available" | "error";

interface Integration {
  id: string;
  name: string;
  category: string;
  desc: string;
  status: IntegrationStatus;
  icon: string;
  docs: string;
  tags: string[];
  connectedAt?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "github",      name: "GitHub",      category: "Source Control",     desc: "Connect repos, trigger actions on push, and sync code across projects.",            status: "connected", icon: "GH", docs: "https://github.com",       tags: ["git","ci","repos"],              connectedAt: "2 ngày trước" },
  { id: "vercel",      name: "Vercel",       category: "Deployment",         desc: "Deploy frontends automatically on git push with preview URLs.",                     status: "connected", icon: "VC", docs: "https://vercel.com",        tags: ["deploy","cdn","preview"],        connectedAt: "5 ngày trước" },
  { id: "supabase",    name: "Supabase",     category: "Database",           desc: "Open source Firebase alternative — Postgres, Auth, Realtime, Storage.",            status: "available", icon: "SB", docs: "https://supabase.com",      tags: ["postgres","realtime","auth"] },
  { id: "openai",      name: "OpenAI",       category: "AI / ML",            desc: "Access GPT-4o, embeddings, image generation, and assistants API.",                  status: "available", icon: "OA", docs: "https://openai.com",        tags: ["llm","gpt","embeddings"] },
  { id: "stripe",      name: "Stripe",       category: "Payments",           desc: "Accept payments, manage subscriptions, and run billing workflows.",                  status: "available", icon: "ST", docs: "https://stripe.com",        tags: ["payments","billing","saas"] },
  { id: "cloudflare",  name: "Cloudflare",   category: "Infrastructure",     desc: "DNS management, CDN, DDoS protection, and Workers serverless.",                     status: "connected", icon: "CF", docs: "https://cloudflare.com",    tags: ["dns","cdn","workers"],           connectedAt: "1 tuần trước" },
  { id: "railway",     name: "Railway",      category: "Deployment",         desc: "Deploy backends, databases, and full-stack apps with one click.",                   status: "available", icon: "RW", docs: "https://railway.app",       tags: ["deploy","backend","docker"] },
  { id: "planetscale", name: "PlanetScale",  category: "Database",           desc: "Serverless MySQL with branching, safe migrations, and auto-scaling.",               status: "error",     icon: "PS", docs: "https://planetscale.com",   tags: ["mysql","serverless","scaling"] },
  { id: "resend",      name: "Resend",       category: "Email",              desc: "Developer-first email sending with React templates and delivery analytics.",        status: "available", icon: "RS", docs: "https://resend.com",        tags: ["email","smtp","transactional"] },
  { id: "upstash",     name: "Upstash",      category: "Cache / Queue",      desc: "Serverless Redis and Kafka — pay-per-request, zero config.",                       status: "available", icon: "UP", docs: "https://upstash.com",       tags: ["redis","kafka","queue"] },
  { id: "sentry",      name: "Sentry",       category: "Monitoring",         desc: "Error tracking, performance monitoring, and session replay.",                       status: "connected", icon: "SN", docs: "https://sentry.io",         tags: ["errors","apm","alerting"],       connectedAt: "3 ngày trước" },
  { id: "linear",      name: "Linear",       category: "Project Management", desc: "Issue tracking and project management built for engineering teams.",                status: "available", icon: "LN", docs: "https://linear.app",        tags: ["issues","sprints","teams"] },
];

const CATEGORIES = ["All", "Source Control", "Deployment", "Database", "AI / ML", "Payments", "Infrastructure", "Email", "Cache / Queue", "Monitoring", "Project Management"];

const categoryIcon = (cat: string) => {
  switch (cat) {
    case "Source Control": return GitBranch;
    case "Deployment":     return Globe;
    case "Database":       return Database;
    case "AI / ML":        return Zap;
    case "Payments":       return Shield;
    case "Infrastructure": return Globe;
    case "Email":          return ChevronRight;
    default:               return Code2;
  }
};

function StatusBadge({ status }: { status: IntegrationStatus }) {
  if (status === "connected") return (
    <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#4B7FFF]">
      <span className="w-1.5 h-1.5 bg-[#4B7FFF] animate-pulse shrink-0" />
      Connected
    </span>
  );
  if (status === "error") return (
    <span className="flex items-center gap-1.5 text-[10px] font-mono text-red-400">
      <AlertTriangle size={10} />
      Error
    </span>
  );
  return <span className="text-[10px] font-mono text-[#444444]">Available</span>;
}

export default function IntegrationsPage() {
  const [category, setCategory] = useState("All");
  const [search,   setSearch]   = useState("");
  const [connected, setConnected] = useState<Set<string>>(
    new Set(INTEGRATIONS.filter(i => i.status === "connected").map(i => i.id))
  );

  const filtered = INTEGRATIONS.filter(i => {
    const matchCat    = category === "All" || i.category === category;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const connectedList = INTEGRATIONS.filter(i => connected.has(i.id));

  const toggle = (id: string) =>
    setConnected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#080808]">

      {/* ── Header ── */}
      <div className="border-b border-[#1e1e1e] px-4 sm:px-8 py-4 sm:py-6 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Integrations</h1>
            <p className="text-xs sm:text-sm text-[#555555] mt-1">Kết nối dịch vụ bên ngoài với TerKix workspace.</p>
          </div>
          {/* Search */}
          <div className="relative shrink-0 w-full sm:w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444444]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm integration…"
              className="w-full bg-[#0f0f0f] border border-[#1e1e1e] text-sm font-mono text-white placeholder-[#333333] pl-9 pr-4 py-2 focus:outline-none focus:border-[#2a2a2a] transition-colors"
            />
          </div>
        </div>

        {/* Connected chips */}
        {connectedList.length > 0 && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-[10px] font-mono text-[#444444] shrink-0">{connectedList.length} connected:</span>
            {connectedList.map(i => (
              <span key={i.id} className="flex items-center gap-1.5 text-[10px] font-mono text-[#4B7FFF] border border-[#4B7FFF]/20 bg-[#4B7FFF]/5 px-2 py-0.5">
                <span className="w-1 h-1 bg-[#4B7FFF] shrink-0" />
                {i.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* ── Category nav — horizontal scroll on mobile, sidebar on md+ ── */}
        <div className="md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-[#1e1e1e]">
          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:h-full py-1.5 md:py-4 px-2 md:px-0 gap-0.5 md:gap-0">
            {/* Section label — desktop only */}
            <div className="hidden md:block px-4 mb-2">
              <span className="text-[10px] font-mono text-[#333333] uppercase tracking-wider">Category</span>
            </div>
            {CATEGORIES.map(cat => {
              const Icon = cat === "All" ? Zap : categoryIcon(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs font-medium whitespace-nowrap shrink-0 md:w-full md:text-left transition-colors cursor-pointer ${
                    category === cat
                      ? "bg-[#0f0f0f] text-white border border-[#1e1e1e] md:border-0"
                      : "text-[#555555] hover:text-[#888888] hover:bg-[#0a0a0a]"
                  }`}
                >
                  <Icon size={11} className={`shrink-0 ${category === cat ? "text-[#4B7FFF]" : ""}`} />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Integration grid ── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          {filtered.length === 0 ? (
            <div className="py-20 text-center border border-[#1e1e1e] flex flex-col items-center gap-3">
              <Lock size={22} className="text-[#333333]" />
              <p className="text-sm text-[#555555]">Không tìm thấy integration</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-[#1e1e1e]">
              {filtered.map(integration => {
                const isConnected = connected.has(integration.id);
                const effStatus: IntegrationStatus = isConnected ? "connected" : integration.status === "error" ? "error" : "available";

                return (
                  <div key={integration.id} className="bg-[#080808] p-4 sm:p-5 hover:bg-[#0a0a0a] transition-colors flex flex-col">

                    {/* Card header */}
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#0f0f0f] border border-[#1e1e1e] flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs text-[#888888] shrink-0">
                          {integration.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{integration.name}</div>
                          <div className="text-[10px] font-mono text-[#444444] mt-0.5 truncate">{integration.category}</div>
                        </div>
                      </div>
                      <StatusBadge status={effStatus} />
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#555555] leading-relaxed mb-3 flex-1">{integration.desc}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {integration.tags.map(t => (
                        <span key={t} className="text-[10px] font-mono border border-[#1e1e1e] text-[#333333] px-1.5 py-0.5">{t}</span>
                      ))}
                    </div>

                    {/* Connected at */}
                    {isConnected && integration.connectedAt && (
                      <div className="text-[10px] font-mono text-[#333333] mb-3">
                        Kết nối {integration.connectedAt}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-auto">
                      {isConnected ? (
                        <>
                          <button className="flex items-center gap-1.5 text-xs font-mono text-[#444444] hover:text-[#888888] transition cursor-pointer border border-[#1e1e1e] px-2.5 py-1.5">
                            <RefreshCw size={11} /> Sync
                          </button>
                          <button
                            onClick={() => toggle(integration.id)}
                            className="flex items-center gap-1.5 text-xs font-mono text-[#444444] hover:text-red-400 transition cursor-pointer border border-[#1e1e1e] hover:border-red-500/30 px-2.5 py-1.5 ml-auto"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : effStatus === "error" ? (
                        <button
                          onClick={() => toggle(integration.id)}
                          className="flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-white border border-red-500/30 hover:border-red-500/60 px-2.5 py-1.5 transition cursor-pointer"
                        >
                          <RefreshCw size={11} /> Reconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => toggle(integration.id)}
                          className="flex items-center gap-1.5 text-xs font-mono text-white bg-[#4B7FFF] hover:bg-[#6B9FFF] active:bg-[#3A6FEF] px-2.5 py-1.5 transition cursor-pointer"
                        >
                          <Plus size={11} /> Connect
                        </button>
                      )}
                      <a
                        href={integration.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 text-[10px] font-mono text-[#333333] hover:text-[#888888] transition"
                      >
                        <ExternalLink size={10} /> Docs
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
