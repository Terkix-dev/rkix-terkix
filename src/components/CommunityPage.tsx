import React, { useState } from "react";
import {
  Star, GitFork, TrendingUp, Users, MessageSquare,
  Search, Clock, Globe, ArrowUpRight, Heart, Share2,
  Code2, Zap, Award, GitBranch, Activity, Filter
} from "lucide-react";

const LANGS = [
  { name: "TypeScript", color: "#3178c6" },
  { name: "JavaScript", color: "#f7df1e" },
  { name: "Python", color: "#3572A5" },
  { name: "Rust", color: "#dea584" },
  { name: "Go", color: "#00ADD8" },
  { name: "CSS", color: "#563d7c" },
];

const TRENDING_REPOS = [
  { rank: 1, org: "vercel", repo: "next.js", desc: "The React Framework for the Web. Used by some of the world's largest companies.", lang: "TypeScript", langColor: "#3178c6", stars: "126k", forks: "26.9k", today: "+847", topics: ["react","framework","ssr"], avatar: "https://github.com/vercel.png" },
  { rank: 2, org: "tailwindlabs", repo: "tailwindcss", desc: "A utility-first CSS framework for rapid UI development.", lang: "CSS", langColor: "#563d7c", stars: "84.2k", forks: "4.3k", today: "+612", topics: ["css","design","utility"], avatar: "https://github.com/tailwindlabs.png" },
  { rank: 3, org: "vitejs", repo: "vite", desc: "Next generation frontend tooling. It's fast!", lang: "TypeScript", langColor: "#3178c6", stars: "69.4k", forks: "6.2k", today: "+534", topics: ["bundler","frontend","build-tool"], avatar: "https://github.com/vitejs.png" },
  { rank: 4, org: "facebook", repo: "react", desc: "The library for web and native user interfaces.", lang: "JavaScript", langColor: "#f7df1e", stars: "230k", forks: "47.1k", today: "+491", topics: ["javascript","ui","frontend"], avatar: "https://github.com/facebook.png" },
  { rank: 5, org: "supabase", repo: "supabase", desc: "The open source Firebase alternative. Build in a weekend, scale to millions.", lang: "TypeScript", langColor: "#3178c6", stars: "73.8k", forks: "7.1k", today: "+463", topics: ["database","backend","postgres"], avatar: "https://github.com/supabase.png" },
  { rank: 6, org: "microsoft", repo: "TypeScript", desc: "TypeScript is a superset of JavaScript that compiles to clean JavaScript output.", lang: "TypeScript", langColor: "#3178c6", stars: "101k", forks: "12.5k", today: "+402", topics: ["language","compiler","types"], avatar: "https://github.com/microsoft.png" },
  { rank: 7, org: "prisma", repo: "prisma", desc: "Next-generation Node.js and TypeScript ORM for PostgreSQL, MySQL, MongoDB.", lang: "TypeScript", langColor: "#3178c6", stars: "39.8k", forks: "1.6k", today: "+378", topics: ["orm","database","nodejs"], avatar: "https://github.com/prisma.png" },
  { rank: 8, org: "shadcn-ui", repo: "ui", desc: "Beautifully designed components that you can copy and paste into your apps.", lang: "TypeScript", langColor: "#3178c6", stars: "83.5k", forks: "5.8k", today: "+921", topics: ["ui","components","radix"], avatar: "https://github.com/shadcn-ui.png" },
];

const COMMUNITY_POSTS = [
  { id: 1, user: "terkix_dev", avatar: "https://github.com/sindresorhus.png", time: "2 giờ trước", title: "Build real-time dashboard với TerKix AI + Supabase trong 20 phút", desc: "Dùng TerKix để generate toàn bộ React components, setup Supabase realtime subscriptions, deploy lên Vercel. AI hoàn toàn hiểu context của project.", lang: "TypeScript", stars: 48, comments: 12, forks: 7, tags: ["TerKix","Supabase","React"], snippet: `const { data } = useRealtimeSubscription(\n  'messages',\n  (payload) => setMessages(p => [...p, payload.new])\n);` },
  { id: 2, user: "nguyen_code", avatar: "https://github.com/gaearon.png", time: "5 giờ trước", title: "Hướng dẫn: Build CLI tool bằng Node.js với AI agent tự gen code", desc: "Chia sẻ workflow của tôi khi dùng TerKix để scaffold một CLI tool hoàn chỉnh với argument parsing, config file, và colored output.", lang: "JavaScript", stars: 31, comments: 8, forks: 4, tags: ["CLI","Node.js","AI"], snippet: `#!/usr/bin/env node\nconst { program } = require('commander');\nprogram.version('1.0.0').parse();` },
  { id: 3, user: "ai_builder_vn", avatar: "https://github.com/rauchg.png", time: "8 giờ trước", title: "Tối ưu bundle size Next.js từ 2.4MB xuống 340KB với AI code review", desc: "AI phát hiện 15 dependencies không cần thiết, suggest tree-shaking, dynamic imports và giúp tôi viết lại 3 components cồng kềnh.", lang: "TypeScript", stars: 87, comments: 23, forks: 14, tags: ["Next.js","Optimization","Bundle"], snippet: `const HeavyChart = dynamic(\n  () => import('./Chart'),\n  { loading: () => <Skeleton /> }\n);` },
  { id: 4, user: "rustacean_dev", avatar: "https://github.com/dtolnay.png", time: "1 ngày trước", title: "Viết REST API bằng Rust Axum — AI gen toàn bộ boilerplate trong 3 phút", desc: "TerKix tự scaffold Axum server với middleware auth, error handling, database layer với SQLx và unit tests đầy đủ.", lang: "Rust", stars: 62, comments: 19, forks: 11, tags: ["Rust","Axum","API"], snippet: `async fn create_user(\n  State(db): State<PgPool>,\n  Json(payload): Json<CreateUser>\n) -> impl IntoResponse { ... }` },
];

const LEADERBOARD = [
  { rank: 1, name: "shadcn", avatar: "https://github.com/shadcn.png", stars: "12.4k", medal: "1" },
  { rank: 2, name: "antfu", avatar: "https://github.com/antfu.png", stars: "9.8k", medal: "2" },
  { rank: 3, name: "sindresorhus", avatar: "https://github.com/sindresorhus.png", stars: "8.3k", medal: "3" },
  { rank: 4, name: "tj", avatar: "https://github.com/tj.png", stars: "6.1k", medal: "" },
  { rank: 5, name: "yyx990803", avatar: "https://github.com/yyx990803.png", stars: "5.7k", medal: "" },
];

const TOPICS = ["react","typescript","nextjs","tailwind","nodejs","api","fullstack","open-source","ai","tools","css","rust","python","go","vue","svelte"];

const TABS = [
  { id: "trending" as const, label: "Trending", Icon: TrendingUp },
  { id: "feed" as const, label: "Feed", Icon: MessageSquare },
  { id: "explore" as const, label: "Khám phá", Icon: Globe },
];

type Tab = "trending" | "feed" | "explore";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("trending");
  const [langFilter, setLangFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const filteredRepos = TRENDING_REPOS.filter(r => {
    const matchSearch = !searchQ || r.repo.toLowerCase().includes(searchQ.toLowerCase()) || r.desc.toLowerCase().includes(searchQ.toLowerCase());
    const matchLang = langFilter === "all" || r.lang === langFilter;
    return matchSearch && matchLang;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#080808]">

      {/* Page header */}
      <div className="border-b border-[#1e1e1e] bg-[#080808] px-4 sm:px-8 py-4 sm:py-6 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Community</h1>
            <p className="text-xs sm:text-sm text-[#555555] mt-1">Khám phá · Chia sẻ · Cộng tác cùng developers</p>
          </div>
          <div className="relative shrink-0 w-full sm:w-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444444]" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Tìm repo, dự án…"
              className="w-full sm:w-48 bg-[#0f0f0f] border border-[#1e1e1e] text-sm font-mono text-white placeholder-[#333333] pl-9 pr-4 py-2 focus:outline-none focus:border-[#2a2a2a] transition-colors"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#1e1e1e] -mb-px overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs font-medium transition border-b-2 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === id
                  ? "text-white border-b-[#4B7FFF]"
                  : "text-[#555555] border-b-transparent hover:text-[#888888]"
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row min-h-full">

          {/* Main content */}
          <div className="flex-1 min-w-0 px-4 sm:px-8 py-4 sm:py-6 space-y-4">

            {/* TRENDING */}
            {activeTab === "trending" && (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setLangFilter("all")}
                    className={`px-3 py-1 text-xs font-mono border transition cursor-pointer ${langFilter === "all" ? "bg-[#4B7FFF] border-[#4B7FFF] text-white" : "bg-transparent border-[#1e1e1e] text-[#555555] hover:text-[#888888]"}`}
                  >
                    All
                  </button>
                  {LANGS.map(l => (
                    <button
                      key={l.name}
                      onClick={() => setLangFilter(langFilter === l.name ? "all" : l.name)}
                      className={`px-3 py-1 text-xs font-mono border transition cursor-pointer`}
                      style={langFilter === l.name
                        ? { backgroundColor: l.color + "18", color: l.color, borderColor: l.color + "55" }
                        : { backgroundColor: "transparent", borderColor: "#1e1e1e", color: "#555555" }
                      }
                    >
                      {l.name}
                    </button>
                  ))}
                </div>

                <div className="border border-[#1e1e1e] divide-y divide-[#1e1e1e]">
                  {filteredRepos.map(r => (
                    <div key={r.rank} className="px-5 py-4 hover:bg-[#0f0f0f] transition-colors group">
                      <div className="flex items-start gap-4">
                        <span className="text-xs font-mono text-[#333333] w-5 shrink-0 pt-0.5">#{r.rank}</span>
                        <img
                          src={r.avatar}
                          alt={r.org}
                          className="w-8 h-8 shrink-0 object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${r.org}&background=0f0f0f&color=4B7FFF&size=32`; }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <a href="#" className="text-sm font-mono text-[#4B7FFF] hover:underline flex items-center gap-1">
                              <span className="text-[#555555]">{r.org}/</span>{r.repo}
                              <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition" />
                            </a>
                          </div>
                          <p className="text-xs text-[#555555] mt-1 leading-relaxed">{r.desc}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {r.topics.map(t => (
                              <span key={t} className="text-[10px] px-2 py-0.5 font-mono border border-[#1e1e1e] text-[#444444]">
                                {t}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-5 mt-2.5 text-[11px] font-mono text-[#444444]">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 inline-block" style={{ backgroundColor: r.langColor }} />
                              {r.lang}
                            </span>
                            <span className="flex items-center gap-1"><Star size={10} /> {r.stars}</span>
                            <span className="flex items-center gap-1"><GitFork size={10} /> {r.forks}</span>
                            <span className="text-[#4B7FFF] flex items-center gap-1">
                              <TrendingUp size={10} /> {r.today} today
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* FEED */}
            {activeTab === "feed" && (
              <div className="space-y-4">
                {COMMUNITY_POSTS.map(post => (
                  <div key={post.id} className="border border-[#1e1e1e] hover:border-[#2a2a2a] transition-colors">
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={post.avatar} alt={post.user} className="w-7 h-7 object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${post.user}&background=0f0f0f&color=4B7FFF&size=28`; }} />
                        <div>
                          <span className="text-xs font-medium text-[#4B7FFF] font-mono">@{post.user}</span>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#444444] font-mono mt-0.5">
                            <Clock size={9} />
                            {post.time}
                          </div>
                        </div>
                        <div className="ml-auto flex items-center gap-1 flex-wrap justify-end">
                          {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 font-mono border border-[#1e1e1e] text-[#444444] hidden sm:inline">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1.5 leading-snug">{post.title}</h3>
                      <p className="text-xs text-[#555555] leading-relaxed mb-4">{post.desc}</p>
                      <div className="bg-[#0f0f0f] border-l border-l-[#4B7FFF]/50 border border-[#1e1e1e] p-4 mb-4 overflow-x-auto">
                        <pre className="text-xs font-mono text-[#888888] whitespace-pre leading-relaxed">{post.snippet}</pre>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => setLikedPosts(prev => { const s = new Set(prev); s.has(post.id) ? s.delete(post.id) : s.add(post.id); return s; })}
                          className={`flex items-center gap-1.5 text-xs font-mono transition cursor-pointer px-2.5 py-1 border ${likedPosts.has(post.id) ? "text-red-400 border-red-500/30" : "text-[#444444] border-[#1e1e1e] hover:text-[#888888]"}`}
                        >
                          <Heart size={11} fill={likedPosts.has(post.id) ? "currentColor" : "none"} />
                          {post.stars + (likedPosts.has(post.id) ? 1 : 0)}
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-mono text-[#444444] hover:text-[#888888] transition cursor-pointer border border-[#1e1e1e] px-2.5 py-1">
                          <MessageSquare size={11} /> {post.comments}
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-mono text-[#444444] hover:text-[#888888] transition cursor-pointer border border-[#1e1e1e] px-2.5 py-1">
                          <GitFork size={11} /> {post.forks}
                        </button>
                        <button className="ml-auto flex items-center gap-1.5 text-xs font-mono text-[#444444] hover:text-[#888888] transition cursor-pointer border border-[#1e1e1e] px-2.5 py-1">
                          <Share2 size={11} /> Chia sẻ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EXPLORE */}
            {activeTab === "explore" && (
              <div className="space-y-6">
                <div className="border border-[#1e1e1e]">
                  <div className="px-5 py-3 border-b border-[#1e1e1e] flex items-center gap-2">
                    <Zap size={13} className="text-[#4B7FFF]" />
                    <span className="text-xs font-medium text-white">Topics hot nhất</span>
                  </div>
                  <div className="p-5 flex flex-wrap gap-2">
                    {TOPICS.map(t => (
                      <button key={t} className="px-3 py-1.5 text-xs font-mono border border-[#1e1e1e] text-[#555555] hover:text-[#eeeeee] hover:border-[#2a2a2a] transition cursor-pointer">
                        #{t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border border-[#1e1e1e]">
                  <div className="px-5 py-3 border-b border-[#1e1e1e] flex items-center gap-2">
                    <Code2 size={13} className="text-[#4B7FFF]" />
                    <span className="text-xs font-medium text-white">Ngôn ngữ phổ biến</span>
                  </div>
                  <div className="p-5 space-y-3">
                    {LANGS.map((l, i) => (
                      <div key={l.name} className="flex items-center gap-4">
                        <span className="text-xs font-mono text-[#333333] w-4">{i + 1}</span>
                        <span className="w-2 h-2 shrink-0" style={{ backgroundColor: l.color }} />
                        <span className="text-xs font-mono text-[#888888] w-24">{l.name}</span>
                        <div className="h-px flex-1 bg-[#1e1e1e]">
                          <div className="h-full" style={{ width: `${90 - i * 12}%`, backgroundColor: l.color + "99" }} />
                        </div>
                        <span className="text-xs font-mono text-[#444444]">{90 - i * 12}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-56 shrink-0 border-t lg:border-t-0 lg:border-l border-[#1e1e1e] py-4 sm:py-6 px-4 sm:px-5 space-y-5">

            {/* Leaderboard */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award size={13} className="text-[#4B7FFF]" />
                <span className="text-xs font-medium text-white">Top Contributors</span>
              </div>
              <div className="space-y-1">
                {LEADERBOARD.map(u => (
                  <div key={u.rank} className="flex items-center gap-3 px-2 py-2 hover:bg-[#0f0f0f] transition cursor-pointer">
                    <span className="text-[10px] font-mono text-[#333333] w-4 shrink-0">#{u.rank}</span>
                    <img src={u.avatar} alt={u.name} className="w-6 h-6 object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${u.name}&background=0f0f0f&color=4B7FFF&size=24`; }} />
                    <span className="text-xs font-mono text-[#888888] flex-1 truncate">@{u.name}</span>
                    <span className="text-[10px] font-mono text-[#555555] flex items-center gap-1 shrink-0">
                      <Star size={9} /> {u.stars}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#1e1e1e]" />

            {/* Recent activity */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity size={13} className="text-[#4B7FFF]" />
                <span className="text-xs font-medium text-white">Hoạt động mới</span>
              </div>
              <div className="space-y-2">
                {[
                  "shadcn starred tailwind/tailwindcss",
                  "antfu forked vitejs/vite",
                  "sindresorhus merged PR #842",
                  "gaearon commented on react#29234",
                  "yyx990803 starred vuejs/core",
                ].map((a, i) => (
                  <div key={i} className="text-[11px] font-mono text-[#444444] hover:text-[#888888] transition cursor-pointer truncate py-0.5">{a}</div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#1e1e1e]" />

            {/* Stats */}
            <div className="space-y-3">
              {[
                { label: "Repos trending", value: "1,248", Icon: TrendingUp },
                { label: "Devs active", value: "48.3k", Icon: Users },
                { label: "Commits hôm nay", value: "142k", Icon: GitBranch },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-[#444444] font-mono flex items-center gap-2">
                    <s.Icon size={11} className="text-[#4B7FFF]" /> {s.label}
                  </span>
                  <span className="text-xs font-mono font-medium text-[#eeeeee]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
