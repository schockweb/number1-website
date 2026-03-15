"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  email: string;
  companyName: string;
  planTier: string;
  onboardingStatus: string;
  createdAt: string;
  onboarding?: { industry?: string; primaryGoal?: string };
  reports?: { id: string }[];
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: "Pending",       color: "#F59E0B", bg: "#F59E0B18", border: "#F59E0B33" },
  onboarded: { label: "Brief Received",color: "#3B82F6", bg: "#3B82F618", border: "#3B82F633" },
  active:    { label: "Active",        color: "#10B981", bg: "#10B98118", border: "#10B98133" },
  paused:    { label: "Paused",        color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
};

const PLAN_COLOR: Record<string, string> = {
  STANDARD: "#6366f1", PREMIUM: "#a855f7", BUSINESS: "#f59e0b",
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((d) => setClients(d.clients || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) => {
    const matchSearch = [c.name, c.email, c.companyName].some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "all" || c.onboardingStatus === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: clients.length,
    onboarded: clients.filter((c) => c.onboardingStatus === "onboarded").length,
    active: clients.filter((c) => c.onboardingStatus === "active").length,
    pending: clients.filter((c) => c.onboardingStatus === "pending").length,
  };

  const FILTER_TABS = [
    { key: "all", label: "All", count: counts.all },
    { key: "onboarded", label: "Brief", count: counts.onboarded },
    { key: "active", label: "Active", count: counts.active },
    { key: "pending", label: "Pending", count: counts.pending },
  ];

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>Clients</h1>
          <p>{loading ? "Loading…" : `${clients.length} client${clients.length !== 1 ? "s" : ""} registered`}</p>
        </div>
      </div>

      <div className="metric-grid" id="client-metrics" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Clients", value: counts.all, accent: "#c9a84c", icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
          { label: "Brief Received", value: counts.onboarded, accent: "#3B82F6", icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
          { label: "Active", value: counts.active, accent: "#10B981", icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label: "Pending", value: counts.pending, accent: "#F59E0B", icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        ].map((m) => (
          <div className="card" key={m.label}>
            <div className="card-header">
              <span className="card-title">{m.label}</span>
              <span style={{ color: m.accent, opacity: 0.7 }}>{m.icon}</span>
            </div>
            <div className="card-value" style={{ color: m.accent }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or company…"
          style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 16px", color: "#fff", fontSize: 13, outline: "none" }} />
        <div style={{ display: "flex", gap: 6 }}>
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.key;
            return (
              <button key={tab.key} onClick={() => setFilter(tab.key)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${active ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.08)"}`, background: active ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)", color: active ? "#c9a84c" : "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                {tab.label} <span style={{ opacity: 0.6 }}>({tab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 0.9fr 0.7fr 1fr 0.5fr 0.5fr", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
          <span>Client</span><span>Industry</span><span>Plan</span><span>Goal</span><span>Status</span><span style={{ textAlign: "right" }}>Reports</span>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Loading clients…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>{search ? `No clients match "${search}"` : "No clients yet."}</div>
          </div>
        ) : (
          filtered.map((c) => {
            const s = STATUS_STYLES[c.onboardingStatus] ?? STATUS_STYLES.pending;
            const planColor = PLAN_COLOR[c.planTier] ?? "#888";
            return (
              <div key={c.id} className="table-row-hover" style={{ display: "grid", gridTemplateColumns: "1.8fr 0.9fr 0.7fr 1fr 0.5fr 0.5fr", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: 13, transition: "background 0.15s" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#fff", marginBottom: 2 }}>{c.companyName}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{c.name} · {c.email}</div>
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{c.onboarding?.industry || "—"}</div>
                <div>
                  <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", background: `${planColor}20`, color: planColor, border: `1px solid ${planColor}40` }}>{c.planTier}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{c.onboarding?.primaryGoal || "—"}</div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />{s.label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                  {(c.reports?.length ?? 0) > 0 && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{c.reports!.length}</span>}
                  <Link href={`/admin/clients/${c.id}`} style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 8, background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.25)", textDecoration: "none", whiteSpace: "nowrap" }}>View →</Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
