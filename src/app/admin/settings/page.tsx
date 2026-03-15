"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardSettings {
  accent: string;
  theme: "dark" | "light";
  density: "comfortable" | "compact";
  fontSize: "sm" | "md" | "lg";
  defaultPage: string;
  showMetrics: boolean;
  showAgents: boolean;
  showActivity: boolean;
  showQuickStats: boolean;
  notifyNewClient: boolean;
  notifyBuildRequest: boolean;
  notifyAgentAlert: boolean;
  notifyEmail: boolean;
  notifyInApp: boolean;
}

const DEFAULTS: DashboardSettings = {
  accent: "gold",
  theme: "dark",
  density: "comfortable",
  fontSize: "md",
  defaultPage: "/",
  showMetrics: true,
  showAgents: true,
  showActivity: true,
  showQuickStats: true,
  notifyNewClient: true,
  notifyBuildRequest: true,
  notifyAgentAlert: true,
  notifyEmail: false,
  notifyInApp: true,
};

const ACCENT_OPTIONS = [
  { id: "gold",   label: "Gold",    color: "#c9a84c", glow: "rgba(201,168,76,0.2)"  },
  { id: "blue",   label: "Blue",    color: "#60a5fa", glow: "rgba(96,165,250,0.2)"  },
  { id: "green",  label: "Emerald", color: "#34d399", glow: "rgba(52,211,153,0.2)"  },
  { id: "purple", label: "Violet",  color: "#a78bfa", glow: "rgba(167,139,250,0.2)" },
  { id: "rose",   label: "Rose",    color: "#fb7185", glow: "rgba(251,113,133,0.2)" },
];

const PAGES = [
  { href: "/",                label: "Home (Dashboard)" },
  { href: "/clients",         label: "Clients" },
  { href: "/build-requests",  label: "Build Requests" },
  { href: "/subscriptions",   label: "Subscriptions" },
  { href: "/ai-services",     label: "AI Services" },
];

const TABS = ["Appearance", "Dashboard", "Notifications", "Account", "Advanced"] as const;
type Tab = typeof TABS[number];

// ─── Apply settings to CSS ───────────────────────────────────────────────────

function applySettings(s: DashboardSettings) {
  const a = ACCENT_OPTIONS.find(o => o.id === s.accent) || ACCENT_OPTIONS[0];
  const r = document.documentElement;

  r.style.setProperty("--accent", a.color);
  r.style.setProperty("--accent-hover", a.color);
  r.style.setProperty("--accent-glow", a.glow);
  r.style.setProperty("--accent-subtle", a.glow.replace("0.2", "0.08"));

  const fontMap = { sm: "13px", md: "14px", lg: "15px" };
  r.style.setProperty("--font-size-base", fontMap[s.fontSize]);

  if (s.density === "compact") {
    r.classList.add("density-compact");
  } else {
    r.classList.remove("density-compact");
  }
}

// ─── Settings Page ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Appearance");
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("n1-saas-settings");
      if (stored) {
        const parsed = { ...DEFAULTS, ...JSON.parse(stored) };
        setSettings(parsed);
        applySettings(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  const update = <K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      applySettings(next);
      return next;
    });
  };

  const save = () => {
    localStorage.setItem("n1-saas-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    setSettings(DEFAULTS);
    applySettings(DEFAULTS);
    localStorage.removeItem("n1-saas-settings");
  };

  const accentColor = ACCENT_OPTIONS.find(o => o.id === settings.accent)?.color || "#c9a84c";

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>Settings</h1>
          <p>Customize your dashboard experience</p>
        </div>
        <div className="top-bar-right">
          <button onClick={save} className="btn btn-primary">
            {saved ? "✓ Saved" : "Save Changes"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>

        {/* ── Sidebar Tabs ── */}
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          overflow: "hidden",
          position: "sticky",
          top: 32,
        }}>
          {TABS.map((tab) => {
            const icons: Record<Tab, string> = {
              Appearance: "🎨",
              Dashboard: "⬡",
              Notifications: "🔔",
              Account: "👤",
              Advanced: "⚙",
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  background: activeTab === tab ? `${accentColor}12` : "transparent",
                  color: activeTab === tab ? accentColor : "var(--text-secondary)",
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: "1px solid var(--border-subtle)",
                  borderLeft: activeTab === tab ? `3px solid ${accentColor}` : "3px solid transparent",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: activeTab === tab ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{icons[tab]}</span>
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── APPEARANCE ── */}
          {activeTab === "Appearance" && (
            <>
              <Section title="Accent Colour" subtitle="Applied to highlights, active states, and interactive elements">
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {ACCENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => update("accent", opt.id)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        padding: "14px 20px",
                        borderRadius: 12,
                        border: settings.accent === opt.id
                          ? `2px solid ${opt.color}`
                          : "2px solid var(--border)",
                        background: settings.accent === opt.id ? `${opt.color}10` : "var(--bg-elevated)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        minWidth: 80,
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: opt.color,
                        boxShadow: settings.accent === opt.id ? `0 0 12px ${opt.glow}` : "none",
                      }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: settings.accent === opt.id ? opt.color : "var(--text-secondary)" }}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Sidebar Density" subtitle="Controls the spacing and size of navigation elements">
                <div style={{ display: "flex", gap: 12 }}>
                  {(["comfortable", "compact"] as const).map((d) => (
                    <OptionCard
                      key={d}
                      label={d === "comfortable" ? "Comfortable" : "Compact"}
                      description={d === "comfortable" ? "More breathing room, easier scanning" : "More items visible, denser layout"}
                      selected={settings.density === d}
                      accent={accentColor}
                      onClick={() => update("density", d)}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Base Font Size" subtitle="Affects body text across the dashboard">
                <div style={{ display: "flex", gap: 12 }}>
                  {([["sm", "Small", "13px"], ["md", "Medium", "14px"], ["lg", "Large", "15px"]] as const).map(([val, label, size]) => (
                    <OptionCard
                      key={val}
                      label={label}
                      description={`Body text at ${size}`}
                      selected={settings.fontSize === val}
                      accent={accentColor}
                      onClick={() => update("fontSize", val)}
                    />
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* ── DASHBOARD ── */}
          {activeTab === "Dashboard" && (
            <>
              <Section title="Default Landing Page" subtitle="Where you land after signing in">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PAGES.map((page) => (
                    <label key={page.href} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: 10,
                      border: `1px solid ${settings.defaultPage === page.href ? accentColor + "50" : "var(--border)"}`,
                      background: settings.defaultPage === page.href ? `${accentColor}08` : "var(--bg-elevated)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}>
                      <input
                        type="radio"
                        name="defaultPage"
                        checked={settings.defaultPage === page.href}
                        onChange={() => update("defaultPage", page.href)}
                        style={{ accentColor }}
                      />
                      <span style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>{page.label}</span>
                    </label>
                  ))}
                </div>
              </Section>

              <Section title="Dashboard Widgets" subtitle="Toggle visibility of homepage sections">
                {([
                  ["showMetrics",    "Metric Cards",    "Active agents, tasks, revenue, and accuracy stats"],
                  ["showAgents",     "Agent Fleet",     "Live grid of all 15 AI service agents"],
                  ["showActivity",   "Activity Feed",   "Real-time log of agent events"],
                  ["showQuickStats", "Quick Stats Panel","Summary sidebar panel"],
                ] as [keyof DashboardSettings, string, string][]).map(([key, label, desc]) => (
                  <Toggle
                    key={key}
                    label={label}
                    description={desc}
                    checked={settings[key] as boolean}
                    accent={accentColor}
                    onChange={(v) => update(key, v)}
                  />
                ))}
              </Section>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === "Notifications" && (
            <>
              <Section title="Delivery Channels" subtitle="How notifications are delivered to you">
                <Toggle label="In-App Notifications" description="Alerts shown inside the dashboard" checked={settings.notifyInApp} accent={accentColor} onChange={(v) => update("notifyInApp", v)} />
                <Toggle label="Email Notifications" description="Summaries sent to your account email" checked={settings.notifyEmail} accent={accentColor} onChange={(v) => update("notifyEmail", v)} />
              </Section>

              <Section title="Event Triggers" subtitle="Which events send you a notification">
                <Toggle label="New Client Signup" description="When a new client completes onboarding" checked={settings.notifyNewClient} accent={accentColor} onChange={(v) => update("notifyNewClient", v)} />
                <Toggle label="New Build Request" description="When a client submits a website request" checked={settings.notifyBuildRequest} accent={accentColor} onChange={(v) => update("notifyBuildRequest", v)} />
                <Toggle label="Agent Alerts" description="When an AI agent encounters an error or completes a task" checked={settings.notifyAgentAlert} accent={accentColor} onChange={(v) => update("notifyAgentAlert", v)} />
              </Section>
            </>
          )}

          {/* ── ACCOUNT ── */}
          {activeTab === "Account" && (
            <Section title="Account Details" subtitle="Your admin profile information">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Full Name" value="James Director" />
                <Field label="Email Address" value="admin@number1.co.za" />
                <Field label="Role" value="Executive Admin" disabled />
                <div style={{ paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                  <button style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                    onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = "var(--text-primary)"; (e.target as HTMLButtonElement).style.borderColor = accentColor; }}
                    onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = "var(--text-secondary)"; (e.target as HTMLButtonElement).style.borderColor = "var(--border)"; }}
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </Section>
          )}

          {/* ── ADVANCED ── */}
          {activeTab === "Advanced" && (
            <>
              <Section title="Data" subtitle="Export or manage your dashboard data">
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="btn btn-ghost" style={{ fontSize: 13 }}>
                    Export All Settings
                  </button>
                  <button className="btn btn-ghost" style={{ fontSize: 13 }}>
                    Export Client Data CSV
                  </button>
                </div>
              </Section>

              <Section title="Cache" subtitle="Clear cached data if the dashboard shows stale information">
                <button className="btn btn-ghost" style={{ fontSize: 13 }}>
                  Clear Dashboard Cache
                </button>
              </Section>

              <div style={{
                padding: 20,
                borderRadius: 12,
                border: "1px solid rgba(248,113,113,0.25)",
                background: "rgba(248,113,113,0.04)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f87171", marginBottom: 6 }}>Danger Zone</div>
                <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 16, lineHeight: 1.6 }}>
                  Reset all dashboard settings to factory defaults. This cannot be undone.
                </p>
                <button
                  onClick={reset}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 8,
                    border: "1px solid rgba(248,113,113,0.4)",
                    background: "rgba(248,113,113,0.1)",
                    color: "#f87171",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Reset All Settings
                </button>
              </div>
            </>
          )}

          {/* Bottom save bar */}
          <div style={{
            padding: "16px 20px",
            borderRadius: 12,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              Changes are previewed live — save to persist across sessions.
            </span>
            <button onClick={save} className="btn btn-primary" style={{ fontSize: 13 }}>
              {saved ? "✓ Saved" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      overflow: "hidden",
    }}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{subtitle}</div>
      </div>
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function OptionCard({ label, description, selected, accent, onClick }: {
  label: string; description: string; selected: boolean; accent: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "14px 16px",
        borderRadius: 10,
        border: selected ? `2px solid ${accent}` : "2px solid var(--border)",
        background: selected ? `${accent}0d` : "var(--bg-elevated)",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: selected ? accent : "var(--text-primary)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.5 }}>{description}</div>
    </button>
  );
}

function Toggle({ label, description, checked, accent, onChange }: {
  label: string; description: string; checked: boolean; accent: string; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: "none",
          background: checked ? accent : "var(--bg-hover)",
          cursor: "pointer",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.2s ease",
          boxShadow: checked ? `0 0 8px ${accent}50` : "none",
        }}
      >
        <div style={{
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s ease",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }} />
      </button>
    </div>
  );
}

function Field({ label, value, disabled }: { label: string; value: string; disabled?: boolean }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-tertiary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>
      <input
        defaultValue={value}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: disabled ? "var(--bg-primary)" : "var(--bg-elevated)",
          color: disabled ? "var(--text-tertiary)" : "var(--text-primary)",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          outline: "none",
          maxWidth: 420,
        }}
      />
    </div>
  );
}
