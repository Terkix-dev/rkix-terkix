import React, { useState, useEffect } from "react";
import {
  Terminal, HardDrive, GitBranch, Globe,
  Activity, Zap, Layers, ArrowUpRight,
  CheckCircle2, Clock, TrendingUp, Code2, Rocket
} from "lucide-react";
import { Project, Agent } from "../types";

interface DashboardOverviewProps {
  project: Project;
  agents: Agent[];
  setCurrentSection: (sec: string) => void;
  onRunPresetCommand: (cmd: string) => void;
  totalCommandsRun: number;
}

const presets = [
  { label: "Scaffold Landing Page", cmd: "build a modern feature gallery with beautiful responsive bento grids", icon: Code2 },
  { label: "Refactor Theme Style", cmd: "edit index.html to add a glowing neon violet header and improve branding typography", icon: Zap },
  { label: "Deploy to Production", cmd: "deploy production to Vercel and check route health", icon: Rocket },
  { label: "Run Debug Agent", cmd: "fix all typescript lint warnings inside App.tsx and simplify states", icon: Activity },
];

export default function DashboardOverview({ project, agents, setCurrentSection, onRunPresetCommand, totalCommandsRun }: DashboardOverviewProps) {
  const [systime, setSystime] = useState(() => new Date().toLocaleTimeString());
  const [cpuUsage, setCpuUsage] = useState(12);
  const [memUsed, setMemUsed] = useState(3.15);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => setSystime(new Date().toLocaleTimeString()), 1000);
    const t2 = setInterval(() => setUptime(s => s + 1), 1000);
    const t3 = setInterval(() => {
      setCpuUsage(p => Math.min(Math.max(p + Math.floor(Math.random() * 11) - 5, 4), 72));
      setMemUsed(p => Number(Math.min(Math.max(p + (Math.random() * 0.08) - 0.04, 2.6), 4.4).toFixed(2)));
    }, 3000);
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); };
  }, []);

  const totalLoc = project.files.reduce((acc, f) => acc + f.content.split("\n").length, 0);
  const fmtUptime = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`;
  const liveCount = project.deployments.filter(d => d.status === "live").length;

  const metrics = [
    { label: "Files", value: project.files.length, sub: `${totalLoc} lines`, icon: HardDrive },
    { label: "Commits", value: project.commitHistory.length, sub: project.activeBranch, icon: GitBranch },
    { label: "Live", value: liveCount, sub: "services", icon: Globe },
    { label: "Commands", value: totalCommandsRun, sub: "executed", icon: Terminal },
  ];

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 space-y-8 w-full max-w-6xl mx-auto">

      {/* ── Hero ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#4B7FFF] tracking-wide">
            <span className="w-1.5 h-1.5 bg-[#4B7FFF] animate-pulse" />
            LIVE
          </span>
          <span className="text-[#333333] text-xs">·</span>
          <span className="text-xs font-mono text-[#555555]">{systime}</span>
          <span className="text-[#333333] text-xs">·</span>
          <span className="text-xs font-mono text-[#7BA3FF]">{project.activeBranch}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-[#eeeeee] tracking-tight">
          {project.name}
        </h1>
        <p className="text-sm text-[#888888] mt-1">{project.description}</p>
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={() => setCurrentSection("terminal")}
            className="flex items-center gap-2 px-4 py-2 bg-[#4B7FFF] hover:bg-[#6B9FFF] text-white font-medium text-sm transition-colors cursor-pointer"
          >
            <Terminal size={13} /> Open Terminal
          </button>
          <button
            onClick={() => setCurrentSection("files")}
            className="flex items-center gap-2 px-4 py-2 border border-[#1e1e1e] hover:border-[#2a2a2a] text-[#888888] hover:text-[#eeeeee] font-medium text-sm transition-colors cursor-pointer"
          >
            Browse Files <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      {/* ── System metrics strip ── */}
      <div className="flex items-center gap-5 sm:gap-8 py-4 sm:py-5 border-y border-[#1e1e1e] overflow-x-auto">
        {[
          { label: "CPU",    value: `${cpuUsage}%`,    bar: cpuUsage,              max: 100 },
          { label: "RAM",    value: `${memUsed} GB`,   bar: (memUsed / 8) * 100,  max: 100 },
          { label: "Uptime", value: fmtUptime,          bar: null,                 max: null },
        ].map(m => (
          <div key={m.label} className="flex items-center gap-3 sm:gap-4 min-w-0 shrink-0">
            <div>
              <div className="text-[10px] sm:text-[11px] font-mono text-[#555555] uppercase tracking-widest mb-1">{m.label}</div>
              <div className="text-sm sm:text-base font-mono font-semibold text-[#eeeeee]">{m.value}</div>
            </div>
            {m.bar !== null && (
              <div className="w-12 sm:w-16 h-[2px] bg-[#1e1e1e] shrink-0">
                <div
                  className="h-full bg-[#4B7FFF] transition-all duration-700"
                  style={{ width: `${Math.min(m.bar, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1e1e1e]">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-[#080808] p-4 sm:p-6 hover:bg-[#0f0f0f] transition-colors cursor-default">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-[10px] sm:text-xs font-medium text-[#555555] uppercase tracking-widest">{m.label}</span>
                <Icon size={12} className="text-[#333333]" />
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-[#eeeeee] tabular-nums">{m.value}</div>
              <div className="text-[10px] sm:text-xs text-[#555555] mt-1 font-mono">{m.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left col */}
        <div className="lg:col-span-2 space-y-8">

          {/* Quick Actions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#eeeeee]">Quick Actions</h2>
              <span className="text-xs font-mono text-[#555555]">{presets.length} presets</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map((p, i) => {
                const Icon = p.icon;
                return (
                  <button
                    key={i}
                    onClick={() => { setCurrentSection("terminal"); onRunPresetCommand(p.cmd); }}
                    className="group flex items-start gap-4 p-5 bg-[#0f0f0f] hover:bg-[#141414] border border-[#1e1e1e] hover:border-[#2a2a2a] text-left transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-[#141414] group-hover:bg-[#1e1e1e] flex items-center justify-center shrink-0 transition-colors">
                      <Icon size={14} className="text-[#4B7FFF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#eeeeee] group-hover:text-white transition truncate">{p.label}</div>
                      <div className="text-xs text-[#555555] font-mono truncate mt-1">$ {p.cmd.slice(0, 30)}…</div>
                    </div>
                    <ArrowUpRight size={13} className="text-[#333333] group-hover:text-[#7BA3FF] shrink-0 transition mt-0.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Metadata */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#eeeeee]">Project</h2>
            </div>
            <div className="border border-[#1e1e1e]">
              {[
                { label: "Name", value: project.name },
                { label: "Branch", value: project.activeBranch },
                { label: "Status", value: project.status },
                { label: "Deployments", value: `${project.deployments.length} targets` },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-[#0f0f0f] transition-colors ${i < arr.length - 1 ? "border-b border-[#1e1e1e]" : ""}`}
                >
                  <span className="text-xs font-mono text-[#555555]">{row.label}</span>
                  <span className="text-sm font-medium text-[#eeeeee]">{row.value}</span>
                </div>
              ))}
              <div className={`px-5 py-4 border-t border-[#1e1e1e]`}>
                <span className="text-xs font-mono text-[#555555] block mb-3">Files ({project.files.length})</span>
                <div className="flex flex-wrap gap-2">
                  {project.files.map((f, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 font-mono bg-[#0f0f0f] border border-[#1e1e1e] text-[#7BA3FF]">
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-8">

          {/* Agent Health */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#eeeeee]">Agents</h2>
              <span className="text-xs font-mono text-[#555555]">
                {agents.filter(a => a.status === "running").length}/{agents.length} active
              </span>
            </div>
            <div className="border border-[#1e1e1e] divide-y divide-[#1e1e1e]">
              {agents.map(agent => {
                const isRun = agent.status === "running";
                return (
                  <div key={agent.id} className={`px-5 py-3.5 transition-colors ${isRun ? "bg-[#0f0f0f]" : "hover:bg-[#0a0a0a]"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-1.5 h-1.5 shrink-0 ${isRun ? "bg-[#4B7FFF] animate-pulse" : "bg-[#333333]"}`} />
                        <span className="text-sm font-medium text-[#eeeeee] truncate">{agent.role}</span>
                      </div>
                      <span className={`text-[10px] font-mono shrink-0 ${isRun ? "text-[#7BA3FF]" : "text-[#444444]"}`}>
                        {isRun ? "ACTIVE" : "IDLE"}
                      </span>
                    </div>
                    <p className="text-xs text-[#555555] truncate pl-4">{agent.lastAction}</p>
                    {isRun && (
                      <div className="mt-2.5 h-px bg-[#1e1e1e] overflow-hidden pl-4">
                        <div className="h-full bg-[#4B7FFF] animate-pulse" style={{ width: "65%" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentSection("agents")}
              className="w-full mt-3 text-xs font-medium text-[#555555] hover:text-[#eeeeee] transition-colors flex items-center justify-center gap-1.5 py-2 border border-[#1e1e1e] hover:border-[#2a2a2a] cursor-pointer"
            >
              Configure agents <ArrowUpRight size={11} />
            </button>
          </div>

          {/* Session Stats */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#eeeeee]">Session</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Commands run", value: totalCommandsRun, max: 100 },
                { label: "Files in project", value: project.files.length, max: 20 },
                { label: "Commits tracked", value: project.commitHistory.length, max: 50 },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-[#555555]">{s.label}</span>
                    <span className="text-xs font-mono text-[#888888]">{s.value}</span>
                  </div>
                  <div className="h-px bg-[#1e1e1e] overflow-hidden">
                    <div
                      className="h-full bg-[#4B7FFF] transition-all duration-700"
                      style={{ width: `${Math.min((s.value / s.max) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
