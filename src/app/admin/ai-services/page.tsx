"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Agent Data ──────────────────────────────────────────────────────────────
const AGENTS = [
  { tier: 1, name: "Revenue Optimizer", desc: "Maximizes revenue through dynamic pricing and upsell strategies", status: "online", tasks: 47, accuracy: "96.2%" },
  { tier: 2, name: "Cost Analyst", desc: "Identifies cost-reduction opportunities across departments", status: "online", tasks: 32, accuracy: "94.8%" },
  { tier: 3, name: "Talent Scout", desc: "AI-powered recruitment matching and candidate scoring", status: "online", tasks: 28, accuracy: "91.5%" },
  { tier: 4, name: "Compliance Monitor", desc: "Real-time regulatory compliance tracking and alerting", status: "online", tasks: 63, accuracy: "99.1%" },
  { tier: 5, name: "Stock Analyzer", desc: "High-margin inventory detection and stale-stock identification", status: "busy", tasks: 51, accuracy: "93.7%" },
  { tier: 6, name: "Ad Strategist", desc: "Campaign optimization using inventory and margin data", status: "online", tasks: 19, accuracy: "88.4%" },
  { tier: 7, name: "Churn Predictor", desc: "Early-warning system for at-risk customer accounts", status: "online", tasks: 22, accuracy: "90.6%" },
  { tier: 8, name: "Supply Chain Agent", desc: "Logistics optimization and vendor performance scoring", status: "online", tasks: 38, accuracy: "95.3%" },
  { tier: 9, name: "Payroll Automator", desc: "Automated payroll processing with anomaly detection", status: "online", tasks: 15, accuracy: "99.8%" },
  { tier: 10, name: "Sentiment Analyzer", desc: "Employee and customer sentiment analysis from feedback", status: "busy", tasks: 44, accuracy: "87.2%" },
  { tier: 11, name: "Forecast Engine", desc: "Demand forecasting using historical and market data", status: "online", tasks: 33, accuracy: "92.1%" },
  { tier: 12, name: "Risk Assessor", desc: "Financial risk scoring and mitigation recommendations", status: "online", tasks: 26, accuracy: "94.4%" },
  { tier: 13, name: "Report Generator", desc: "Automated executive reporting with natural language summaries", status: "online", tasks: 57, accuracy: "97.6%" },
  { tier: 14, name: "Onboarding Agent", desc: "New employee onboarding workflow automation", status: "offline", tasks: 0, accuracy: "—" },
  { tier: 15, name: "Data Steward", desc: "Data quality monitoring and governance enforcement", status: "online", tasks: 41, accuracy: "96.9%" },
];

const METRICS = [
  { label: "Active Agents", value: "13/15", change: "+2 this week", positive: true, icon: "⚡" },
  { label: "Tasks Processed", value: "12,847", change: "+18.3%", positive: true, icon: "📊" },
  { label: "Revenue Impact", value: "$2.4M", change: "+24.1%", positive: true, icon: "💰" },
  { label: "Avg. Accuracy", value: "94.6%", change: "+1.2%", positive: true, icon: "🎯" },
];

const ACTIVITIES = [
  { icon: "gold", emoji: "⚡", text: "<strong>Stock Analyzer</strong> flagged 23 high-margin stale SKUs", time: "2 min ago" },
  { icon: "green", emoji: "✓", text: "<strong>Revenue Optimizer</strong> completed pricing update for Q2", time: "8 min ago" },
  { icon: "blue", emoji: "📋", text: "<strong>Report Generator</strong> delivered weekly executive brief", time: "15 min ago" },
  { icon: "gold", emoji: "⚡", text: "<strong>Ad Strategist</strong> launched 3 new campaigns from SKU data", time: "22 min ago" },
  { icon: "green", emoji: "✓", text: "<strong>Compliance Monitor</strong> cleared all regulatory flags", time: "34 min ago" },
  { icon: "blue", emoji: "📋", text: "<strong>Forecast Engine</strong> updated demand models for 847 items", time: "41 min ago" },
];

const NAV_ITEMS = [
  { label: "Home", active: false, icon: "◻", section: "overview", href: "/" },
  { label: "Website Building", active: false, icon: "◈", section: "overview", href: "/website-building" },
  { label: "AI Services", active: true, icon: "⬡", section: "overview", href: "/ai-services" },
  { label: "Subscriptions", active: false, icon: "⬢", section: "management", href: "/subscriptions" },
  { label: "Integrations", active: false, icon: "⬡", section: "management", href: "/integrations" },
  { label: "Settings", active: false, icon: "⚙", section: "system", href: "/" },
];

const CURRENT_CLIENT_ID = "client-demo-001";

// ─── Agent Configuration Modal ───────────────────────────────────────────────

interface AgentConfigModalProps {
  agent: (typeof AGENTS)[number];
  onClose: () => void;
}

function AgentConfigModal({ agent, onClose }: AgentConfigModalProps) {
  const [promptText, setPromptText] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing instructions from database
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/agent-rules?clientId=${CURRENT_CLIENT_ID}&tier=${agent.tier}`
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPromptText(data[0].customPromptText || "");
          setStatus(data[0].status || "active");
        }
      } catch (err) {
        console.error("Failed to load agent rules:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [agent.tier]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/agent-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: CURRENT_CLIENT_ID,
          agentTierId: agent.tier,
          customPromptText: promptText,
          status,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  }, [agent.tier, promptText, status]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="agent-tier" style={{ marginBottom: 4, display: "block" }}>
              Tier {agent.tier}
            </span>
            <h2 className="modal-title">Configure {agent.name}</h2>
            <p className="modal-subtitle">{agent.desc}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <label className="modal-label" htmlFor="system-prompt">
            Custom AI Instructions (System Prompt)
          </label>
          <p className="modal-hint">
            These instructions are injected into the Gemini system prompt before each task execution.
            Max 10,000 characters.
          </p>
          {loading ? (
            <div className="skeleton" style={{ height: 200, width: "100%" }} />
          ) : (
            <textarea
              id="system-prompt"
              className="prompt-textarea"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Enter custom AI instructions for this agent..."
              maxLength={10000}
              rows={10}
            />
          )}
          <div className="prompt-meta">
            <span>{promptText.length.toLocaleString()} / 10,000 chars</span>
            <div className="status-selector">
              <label className="modal-label-sm">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="status-select"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save Instructions"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Competitor Report AI Instructions Card ───────────────────────────────────

function CompetitorInstructionsCard() {
  const API_URL = 'http://localhost:3000/api/admin/instructions?key=competitor';

  const DEFAULT_INSTRUCTIONS = `You are an expert competitive intelligence analyst. When given a competitor's website URL or name, produce a comprehensive report covering:

1. **Brand Positioning** – How they present their value proposition, tone, and target market.
2. **Key Offerings** – Products, services, pricing tiers (if visible), and unique selling points.
3. **Website UX & Design** – Strengths and weaknesses of their digital presence.
4. **SEO & Content Strategy** – Keywords, content types, and estimated traffic signals.
5. **Social Proof** – Testimonials, case studies, awards, and trust indicators.
6. **Weaknesses & Gaps** – Areas where we can differentiate and outperform.
7. **Actionable Recommendations** – 3–5 specific steps our team can take to win market share from this competitor.

Keep the tone professional but direct. Prioritise insights that are actionable within 30 days.`;

  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_INSTRUCTIONS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState('');

  // Load from shared API on mount
  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        const text = data.instructions || DEFAULT_INSTRUCTIONS;
        setInstructions(text);
        setDraft(text);
      })
      .catch(() => { /* use default */ })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaveError('');
    try {
      const res = await fetch('http://localhost:3000/api/admin/instructions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'competitor', instructions: draft }),
      });
      if (!res.ok) throw new Error(await res.text());
      setInstructions(draft);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(`Save failed: ${String(err)}`);
    }
  };

  const handleCancel = () => {
    setDraft(instructions);
    setIsEditing(false);
    setSaveError('');
  };

  return (
    <div className="card" id="competitor-instructions-card" style={{ marginBottom: 24 }}>
      <div className="card-header" style={{ marginBottom: 12 }}>
        <div>
          <span className="card-title" style={{ fontSize: 15 }}>🔍 Competitor Report AI Instructions</span>
          <p style={{ fontSize: 12, color: "var(--text-muted, #888)", marginTop: 4 }}>
            These instructions are injected into the AI when generating competitor analysis reports for clients.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {saved && (
            <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>✓ Saved to server</span>
          )}
          {saveError && (
            <span style={{ fontSize: 11, color: "#f87171", maxWidth: 200 }}>{saveError}</span>
          )}
          {!isEditing ? (
            <button
              className="btn btn-primary"
              id="btn-edit-competitor-instructions"
              onClick={() => { setDraft(instructions); setIsEditing(true); }}
              style={{ fontSize: 12, padding: "6px 14px" }}
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Edit Instructions'}
            </button>
          ) : (
            <>
              <button
                className="btn btn-ghost"
                onClick={handleCancel}
                style={{ fontSize: 12, padding: "6px 14px" }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                style={{ fontSize: 12, padding: "6px 14px" }}
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "20px 0", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading saved instructions…</div>
      ) : isEditing ? (
        <textarea
          id="competitor-instructions-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="prompt-textarea"
          rows={14}
          style={{ width: "100%", marginTop: 8 }}
          placeholder="Enter AI instructions for competitor report generation..."
        />
      ) : (
        <pre style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "14px 16px",
          fontSize: 12,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color: "var(--text-secondary, #aaa)",
          maxHeight: 260,
          overflowY: "auto",
          marginTop: 8,
        }}>
          {instructions}
        </pre>
      )}

      <p style={{ fontSize: 11, color: "var(--text-muted, #666)", marginTop: 10 }}>
        <strong>Live:</strong> Changes saved here are stored on the server and applied immediately to all future competitor reports.
      </p>
    </div>
  );
}


// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [selectedAgent, setSelectedAgent] = useState<(typeof AGENTS)[number] | null>(null);
  
  // Real metrics state
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    totalRevenue: "$0.0M",
    avgAccuracy: "0.0%",
    activeAgents: 0,
    tasksByTier: {} as Record<number, number>
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Poll metrics every 5 seconds for a real-time feel
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch(`/api/metrics?clientId=${CURRENT_CLIENT_ID}`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
      } finally {
        setLoadingMetrics(false);
      }
    }
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);


  // Dynamic top-level metrics
  const displayMetrics = [
    { label: "Active Agents", value: `${metrics.activeAgents || 0}/15`, change: "Real-time", positive: true, icon: "⚡" },
    { label: "Tasks Processed", value: loadingMetrics ? "..." : (metrics.totalTasks || 0).toLocaleString(), change: "Live", positive: true, icon: "📊" },
    { label: "Revenue Impact", value: metrics.totalRevenue || "$0.0M", change: "Live", positive: true, icon: "💰" },
    { label: "Avg. Accuracy", value: metrics.avgAccuracy || "0.0%", change: "Live", positive: true, icon: "🎯" },
  ];

  return (
    <>
      {/* Agent Config Modal */}
      {selectedAgent && (
        <AgentConfigModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {/* Main Content */}
      <>
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <h1>AI Services</h1>
            <p>Configure and deploy intelligent AI agents — tweak rules, monitor performance</p>
          </div>
          <div className="top-bar-right">
            {/* View Switcher */}
            <div className="view-switcher" id="view-switcher">
              <a
                href="http://localhost:3001"
                className="view-btn view-btn-admin"
                id="btn-admin-view"
                title="Admin Dashboard"
              >
                ⬡ Admin
              </a>
              <a
                href="http://localhost:3000"
                className="view-btn view-btn-client"
                id="btn-client-view"
                title="Client Site"
              >
                ◎ Client Site
              </a>
            </div>

            <button className="btn-icon" id="btn-notifications" aria-label="Notifications">
              🔔
            </button>
            <button className="btn-icon" id="btn-refresh" aria-label="Refresh data">
              ↻
            </button>
            <button className="btn btn-primary" id="btn-deploy-agent">
              + Deploy Agent
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="metric-grid" id="metric-grid">
          {displayMetrics.map((m) => (
            <div className="card" key={m.label} id={`metric-${m.label.toLowerCase().replace(/\s/g, "-")}`}>
              <div className="card-header">
                <span className="card-title">{m.label}</span>
                <span style={{ fontSize: 20 }}>{m.icon}</span>
              </div>
              <div className="card-value">{m.value}</div>
              <span className={`card-change ${m.positive ? "positive" : "negative"}`}>
                {m.change}
              </span>
            </div>
          ))}
        </div>

        {/* Agent Grid Section */}
        <div className="section-header">
          <div>
            <div className="section-title">Agent Fleet</div>
            <div className="section-subtitle">
              Click any agent to configure its AI instructions
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="badge badge-success">
              <span className="status-dot online" /> {metrics.activeAgents} Online
            </span>
          </div>
        </div>

        <div className="agent-grid" id="agent-grid">
          {AGENTS.map((agent) => {
            // Mix static descriptions with REAL database metrics
            const taskCount = metrics.tasksByTier[agent.tier] || 0;
            const isConfigured = metrics.activeAgents >= agent.tier || agent.tier <= 2; // Rough demo fallback
            const realStatus = isConfigured ? (taskCount > 0 ? "busy" : "online") : "offline";
            const accuracyStr = isConfigured ? metrics.avgAccuracy : "—";

            return (
              <div
                className="agent-card"
                key={agent.tier}
                id={`agent-tier-${agent.tier}`}
                onClick={() => setSelectedAgent(agent)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedAgent(agent);
                }}
              >
                <div className="agent-card-header">
                  <span className="agent-tier">Tier {agent.tier}</span>
                  <span
                    className={`status-dot ${realStatus}`}
                    title={realStatus}
                  />
                </div>
                <div className="agent-name">{agent.name}</div>
                <div className="agent-desc">{agent.desc}</div>
                <div className="agent-stats">
                  <span className="agent-stat">
                    <strong>{taskCount.toLocaleString()}</strong> tasks
                  </span>
                  <span className="agent-stat">
                    <strong>{accuracyStr}</strong> accuracy
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Competitor Report AI Instructions */}
        <CompetitorInstructionsCard />

        {/* Activity Feed + Quick Stats */}
        <div className="content-split" id="content-split">
          <div className="activity-feed" id="activity-feed">
            <div className="activity-feed-header">
              <span className="activity-feed-title">Live Activity</span>
              <span className="badge badge-gold pulse">● Live</span>
            </div>
            {ACTIVITIES.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className={`activity-icon ${a.icon}`}>{a.emoji}</div>
                <div className="activity-content">
                  <div
                    className="activity-text"
                    dangerouslySetInnerHTML={{ __html: a.text }}
                  />
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="quick-stats" id="quick-stats">
            <div className="quick-stats-title">System Health</div>
            {[
              { label: "Orchestrator", value: "Active" },
              { label: "BigQuery MCP", value: "Connected" },
              { label: "Uptime", value: "99.97%" },
              { label: "Latency", value: "42ms" },
              { label: "Queue Depth", value: "7" },
              { label: "Last Sync", value: "< 1 min" },
            ].map((s) => (
              <div className="quick-stat-item" key={s.label}>
                <span className="quick-stat-label">{s.label}</span>
                <span className="quick-stat-value">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    </>
  );
}

