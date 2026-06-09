import React, { useState } from "react";
import {
  Search, Check, AlertTriangle, RefreshCw,
  ShieldCheck, Globe, Server, Copy,
  Lock
} from "lucide-react";

type CheckStatus = "idle" | "checking" | "done";

interface DomainResult {
  domain: string;
  available: boolean;
  price?: string;
}

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: string;
}

interface WhoisData {
  registrar: string;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
  nameservers: string[];
  status: string;
}

interface SslData {
  issuer: string;
  validFrom: string;
  validTo: string;
  daysLeft: number;
  protocol: string;
  grade: string;
}

const TLDS = [".com", ".io", ".dev", ".app", ".co", ".net", ".org", ".vn", ".ai", ".tech"];

const MOCK_DNS: Record<string, DnsRecord[]> = {
  default: [
    { type: "A",     name: "@",      value: "76.76.21.21",                             ttl: "300"   },
    { type: "AAAA",  name: "@",      value: "2606:4700::6810:1515",                    ttl: "300"   },
    { type: "CNAME", name: "www",    value: "cname.vercel-dns.com",                    ttl: "300"   },
    { type: "MX",    name: "@",      value: "10 aspmx.l.google.com",                   ttl: "3600"  },
    { type: "MX",    name: "@",      value: "20 alt1.aspmx.l.google.com",              ttl: "3600"  },
    { type: "TXT",   name: "@",      value: "v=spf1 include:_spf.google.com ~all",     ttl: "3600"  },
    { type: "TXT",   name: "_dmarc", value: "v=DMARC1; p=reject; rua=mailto:d@d.com", ttl: "3600"  },
    { type: "NS",    name: "@",      value: "ns1.cloudflare.com",                      ttl: "86400" },
    { type: "NS",    name: "@",      value: "ns2.cloudflare.com",                      ttl: "86400" },
  ]
};

const MOCK_WHOIS: WhoisData = {
  registrar: "Cloudflare, Inc.",
  createdAt: "2020-03-15",
  expiresAt: "2026-03-15",
  updatedAt: "2024-01-10",
  nameservers: ["ns1.cloudflare.com", "ns2.cloudflare.com"],
  status: "clientTransferProhibited",
};

const MOCK_SSL: SslData = {
  issuer: "Let's Encrypt Authority X3",
  validFrom: "2025-01-01",
  validTo: "2025-04-01",
  daysLeft: 42,
  protocol: "TLS 1.3",
  grade: "A+",
};

const DNS_TYPE_COLORS: Record<string, string> = {
  A: "#4B7FFF", AAAA: "#7BA3FF", CNAME: "#888888",
  MX: "#4B7FFF", TXT: "#555555", NS: "#888888",
};

type ActiveTool = "checker" | "dns" | "whois" | "ssl";

const TOOLS: { id: ActiveTool; label: string; short: string; Icon: typeof Search }[] = [
  { id: "checker", label: "Domain Checker", short: "Checker", Icon: Search },
  { id: "dns",     label: "DNS Lookup",     short: "DNS",     Icon: Server },
  { id: "whois",   label: "WHOIS",          short: "WHOIS",   Icon: Globe },
  { id: "ssl",     label: "SSL Checker",    short: "SSL",     Icon: ShieldCheck },
];

function useDomainQuery() {
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<CheckStatus>("idle");
  const run = (cb: () => void) => {
    if (!domain) return;
    setStatus("checking");
    setTimeout(() => { setStatus("done"); cb(); }, 900);
  };
  return { domain, setDomain, status, run };
}

function InputRow({
  value, onChange, onEnter, placeholder, disabled, onSubmit, loading, icon: Icon, label: btnLabel,
}: {
  value: string; onChange: (v: string) => void; onEnter: () => void;
  placeholder: string; disabled: boolean; onSubmit: () => void; loading: boolean;
  icon: typeof Search; label: string;
}) {
  return (
    <div className="flex gap-0">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onEnter()}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 min-w-0 bg-[#0f0f0f] border border-r-0 border-[#1e1e1e] text-sm font-mono text-white placeholder-[#333333] px-3 sm:px-4 py-2.5 focus:outline-none focus:border-[#2a2a2a] transition-colors"
      />
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="shrink-0 bg-[#4B7FFF] hover:bg-[#6B9FFF] active:bg-[#3A6FEF] text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-2.5 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
      >
        {loading ? <RefreshCw size={13} className="animate-spin" /> : <Icon size={13} />}
        <span className="hidden xs:inline">{btnLabel}</span>
      </button>
    </div>
  );
}

export default function DomainToolsPage() {
  const [activeTool, setActiveTool] = useState<ActiveTool>("checker");
  const [copied, setCopied] = useState<string | null>(null);

  const checker  = useDomainQuery();
  const dnsLookup = useDomainQuery();
  const whoisQ   = useDomainQuery();
  const sslQ     = useDomainQuery();

  const [checkerResults, setCheckerResults] = useState<DomainResult[]>([]);
  const [dnsResults,     setDnsResults]     = useState<DnsRecord[]>([]);
  const [whoisResult,    setWhoisResult]    = useState<WhoisData | null>(null);
  const [sslResult,      setSslResult]      = useState<SslData | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  const baseDomain = (raw: string) =>
    raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

  const runChecker = () =>
    checker.run(() => {
      const base = baseDomain(checker.domain);
      setCheckerResults(TLDS.map((tld, i) => ({
        domain: base + tld,
        available: [0, 2, 4, 5, 7, 9].includes(i),
        price: [0, 2, 4, 5, 7, 9].includes(i)
          ? ["$12/yr","$25/yr","$15/yr","$18/yr","$9/yr","$8/yr","$22/yr"][i % 7]
          : undefined,
      })));
    });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#080808]">

      {/* ── Header ── */}
      <div className="border-b border-[#1e1e1e] px-4 sm:px-8 py-4 sm:py-6 shrink-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Domain Tools</h1>
        <p className="text-xs sm:text-sm text-[#555555] mt-1">Kiểm tra domain, DNS, WHOIS và SSL certificate.</p>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* ── Tool tabs — horizontal on mobile, vertical sidebar on md+ ── */}
        <div className="md:w-44 shrink-0 border-b md:border-b-0 md:border-r border-[#1e1e1e]">
          {/* Mobile: horizontal scroll */}
          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible py-1.5 md:py-4 px-2 md:px-0 gap-1 md:gap-0">
            {TOOLS.map(({ id, label, short, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTool(id)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 text-xs font-medium whitespace-nowrap shrink-0 md:w-full md:text-left transition-colors cursor-pointer ${
                  activeTool === id
                    ? "bg-[#0f0f0f] text-white border border-[#1e1e1e] md:border-0"
                    : "text-[#555555] hover:text-[#888888] hover:bg-[#0a0a0a]"
                }`}
              >
                <Icon size={12} className={activeTool === id ? "text-[#4B7FFF] shrink-0" : "shrink-0"} />
                <span className="md:hidden">{short}</span>
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tool content ── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">

          {/* DOMAIN CHECKER */}
          {activeTool === "checker" && (
            <div className="max-w-2xl space-y-5">
              <div>
                <label className="text-xs font-mono text-[#555555] mb-2 block">Tên miền cần kiểm tra</label>
                <InputRow
                  value={checker.domain} onChange={checker.setDomain}
                  onEnter={runChecker} onSubmit={runChecker}
                  placeholder="myproject" disabled={checker.status === "checking"}
                  loading={checker.status === "checking"} icon={Search} label="Kiểm tra"
                />
              </div>

              {checker.status === "done" && checkerResults.length > 0 && (
                <div className="border border-[#1e1e1e] divide-y divide-[#1e1e1e]">
                  {checkerResults.map(r => (
                    <div key={r.domain} className="px-3 sm:px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#0f0f0f] transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-1.5 h-1.5 shrink-0 ${r.available ? "bg-[#4B7FFF]" : "bg-[#333333]"}`} />
                        <span className="text-xs sm:text-sm font-mono text-[#eeeeee] truncate">{r.domain}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        {r.available ? (
                          <>
                            <span className="text-[10px] sm:text-xs font-mono text-[#555555] hidden sm:inline">{r.price}</span>
                            <button className="text-[10px] sm:text-xs font-mono text-white bg-[#4B7FFF] hover:bg-[#6B9FFF] px-2 sm:px-3 py-1 transition-colors cursor-pointer">
                              Register
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] sm:text-xs font-mono text-[#333333]">Unavailable</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DNS LOOKUP */}
          {activeTool === "dns" && (
            <div className="max-w-3xl space-y-5">
              <div>
                <label className="text-xs font-mono text-[#555555] mb-2 block">Domain cần tra cứu DNS</label>
                <InputRow
                  value={dnsLookup.domain} onChange={dnsLookup.setDomain}
                  onEnter={() => dnsLookup.run(() => setDnsResults(MOCK_DNS.default))}
                  onSubmit={() => dnsLookup.run(() => setDnsResults(MOCK_DNS.default))}
                  placeholder="example.com" disabled={dnsLookup.status === "checking"}
                  loading={dnsLookup.status === "checking"} icon={Server} label="Lookup"
                />
              </div>

              {dnsLookup.status === "done" && dnsResults.length > 0 && (
                <div className="border border-[#1e1e1e]">
                  <div className="px-4 py-3 border-b border-[#1e1e1e] flex items-center justify-between">
                    <span className="text-xs font-mono text-[#555555]">{dnsResults.length} records</span>
                    <button
                      onClick={() => handleCopy(dnsResults.map(r => `${r.type}\t${r.name}\t${r.value}`).join("\n"))}
                      className="text-xs font-mono text-[#444444] hover:text-[#888888] transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy size={11} /> {copied ? "Copied!" : "Copy all"}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono min-w-[480px]">
                      <thead>
                        <tr className="border-b border-[#1e1e1e]">
                          {["Type", "Name", "Value", "TTL"].map(h => (
                            <th key={h} className="text-left px-4 py-2.5 text-[#333333] font-medium">{h}</th>
                          ))}
                          <th className="px-4 py-2.5 w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e1e1e]">
                        {dnsResults.map((r, i) => (
                          <tr key={i} className="hover:bg-[#0f0f0f] transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-bold" style={{ color: DNS_TYPE_COLORS[r.type] || "#888888" }}>{r.type}</span>
                            </td>
                            <td className="px-4 py-3 text-[#888888]">{r.name}</td>
                            <td className="px-4 py-3 text-[#cccccc] max-w-[200px] truncate">{r.value}</td>
                            <td className="px-4 py-3 text-[#444444]">{r.ttl}s</td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleCopy(r.value)} className="text-[#333333] hover:text-[#888888] transition cursor-pointer">
                                {copied === r.value ? <Check size={11} className="text-[#4B7FFF]" /> : <Copy size={11} />}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WHOIS */}
          {activeTool === "whois" && (
            <div className="max-w-2xl space-y-5">
              <div>
                <label className="text-xs font-mono text-[#555555] mb-2 block">Domain WHOIS lookup</label>
                <InputRow
                  value={whoisQ.domain} onChange={whoisQ.setDomain}
                  onEnter={() => whoisQ.run(() => setWhoisResult(MOCK_WHOIS))}
                  onSubmit={() => whoisQ.run(() => setWhoisResult(MOCK_WHOIS))}
                  placeholder="example.com" disabled={whoisQ.status === "checking"}
                  loading={whoisQ.status === "checking"} icon={Globe} label="Lookup"
                />
              </div>

              {whoisQ.status === "done" && whoisResult && (
                <div className="border border-[#1e1e1e]">
                  <div className="px-4 py-4 border-b border-[#1e1e1e] flex items-center gap-2">
                    <Lock size={13} className="text-[#4B7FFF] shrink-0" />
                    <span className="text-sm font-medium text-white truncate">{whoisQ.domain}</span>
                  </div>
                  <div className="divide-y divide-[#1e1e1e]">
                    {[
                      { label: "Registrar", value: whoisResult.registrar },
                      { label: "Created",   value: whoisResult.createdAt },
                      { label: "Expires",   value: whoisResult.expiresAt },
                      { label: "Updated",   value: whoisResult.updatedAt },
                      { label: "Status",    value: whoisResult.status },
                    ].map(row => (
                      <div key={row.label} className="px-4 py-3 flex items-start sm:items-center justify-between gap-3">
                        <span className="text-xs font-mono text-[#444444] shrink-0">{row.label}</span>
                        <span className="text-xs font-mono text-[#cccccc] text-right break-all sm:break-normal">{row.value}</span>
                      </div>
                    ))}
                    <div className="px-4 py-3">
                      <span className="text-xs font-mono text-[#444444] block mb-2">Nameservers</span>
                      <div className="space-y-1">
                        {whoisResult.nameservers.map(ns => (
                          <div key={ns} className="text-xs font-mono text-[#cccccc] break-all">{ns}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SSL CHECKER */}
          {activeTool === "ssl" && (
            <div className="max-w-2xl space-y-5">
              <div>
                <label className="text-xs font-mono text-[#555555] mb-2 block">Kiểm tra SSL certificate</label>
                <InputRow
                  value={sslQ.domain} onChange={sslQ.setDomain}
                  onEnter={() => sslQ.run(() => setSslResult(MOCK_SSL))}
                  onSubmit={() => sslQ.run(() => setSslResult(MOCK_SSL))}
                  placeholder="example.com" disabled={sslQ.status === "checking"}
                  loading={sslQ.status === "checking"} icon={ShieldCheck} label="Check SSL"
                />
              </div>

              {sslQ.status === "done" && sslResult && (
                <div className="space-y-4">
                  {/* Grade card */}
                  <div className="border border-[#1e1e1e] px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-mono text-[#444444] mb-1">SSL Grade</div>
                      <div className="text-3xl sm:text-4xl font-bold text-[#4B7FFF] font-mono">{sslResult.grade}</div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-2 text-sm font-medium ${sslResult.daysLeft > 30 ? "text-[#4B7FFF]" : "text-yellow-400"}`}>
                        {sslResult.daysLeft > 30 ? <ShieldCheck size={15} /> : <AlertTriangle size={15} />}
                        <span>{sslResult.daysLeft} ngày còn lại</span>
                      </div>
                      <div className="text-xs font-mono text-[#444444] mt-1">{sslResult.protocol}</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="border border-[#1e1e1e] divide-y divide-[#1e1e1e]">
                    {[
                      { label: "Issuer",    value: sslResult.issuer },
                      { label: "Valid from", value: sslResult.validFrom },
                      { label: "Valid to",   value: sslResult.validTo },
                      { label: "Protocol",   value: sslResult.protocol },
                    ].map(row => (
                      <div key={row.label} className="px-4 py-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-mono text-[#444444] shrink-0">{row.label}</span>
                        <span className="text-xs font-mono text-[#cccccc] text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {sslResult.daysLeft <= 30 && (
                    <div className="border border-yellow-600/30 bg-yellow-600/5 px-4 py-4 flex items-start gap-3">
                      <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-yellow-400">Certificate sắp hết hạn</p>
                        <p className="text-xs text-[#555555] mt-1">Renew trước ngày {sslResult.validTo} để tránh gián đoạn.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
