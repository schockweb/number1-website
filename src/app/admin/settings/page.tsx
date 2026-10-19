"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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
  timezone: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessWebsite: string;
  calendarStartHour: number;
  calendarEndHour: number;
  meetingDuration: number;
}

const DEFAULTS: DashboardSettings = {
  accent: "rose",
  theme: "dark",
  density: "comfortable",
  fontSize: "md",
  defaultPage: "/admin",
  showMetrics: true,
  showAgents: true,
  showActivity: true,
  showQuickStats: true,
  notifyNewClient: true,
  notifyBuildRequest: true,
  notifyAgentAlert: true,
  notifyEmail: false,
  notifyInApp: true,
  timezone: "CAT",
  businessName: "Number1",
  businessEmail: "",
  businessPhone: "",
  businessWebsite: "https://number1.studio",
  calendarStartHour: 9,
  calendarEndHour: 17,
  meetingDuration: 30,
};

const ACCENT_OPTIONS = [
  { id: "rose",   label: "Rose",    color: "#c48b9a", glow: "rgba(196,139,154,0.2)" },
  { id: "lavender", label: "Lavender", color: "#9b8ec4", glow: "rgba(155,142,196,0.2)" },
  { id: "gold",   label: "Gold",    color: "#d4b87a", glow: "rgba(212,184,122,0.2)" },
  { id: "emerald",label: "Emerald", color: "#7dd3a8", glow: "rgba(125,211,168,0.2)" },
  { id: "blue",   label: "Blue",    color: "#89aed4", glow: "rgba(137,174,212,0.2)" },
];

const PAGES = [
  { href: "/admin",            label: "Home (Dashboard)" },
  { href: "/admin/clients",    label: "Clients" },
  { href: "/admin/leads",      label: "Leads" },
  { href: "/admin/calendar",   label: "Calendar" },
  { href: "/admin/build-requests", label: "Build Requests" },
  { href: "/admin/business-scanner", label: "Business Scanner" },
];

const TIMEZONES = [
  { id: "CAT",  label: "CAT — Central Africa Time (UTC+2)" },
  { id: "SAST", label: "SAST — South Africa Standard Time (UTC+2)" },
  { id: "EAT",  label: "EAT — East Africa Time (UTC+3)" },
  { id: "WAT",  label: "WAT — West Africa Time (UTC+1)" },
  { id: "GMT",  label: "GMT — Greenwich Mean Time (UTC+0)" },
  { id: "CET",  label: "CET — Central European Time (UTC+1)" },
  { id: "EST",  label: "EST — Eastern Standard Time (UTC-5)" },
  { id: "PST",  label: "PST — Pacific Standard Time (UTC-8)" },
];

const TABS = ["Appearance", "Dashboard", "Business", "Calendar", "Notifications", "AI Config", "Account", "Advanced"] as const;
type Tab = typeof TABS[number];

const SUPER_ADMIN = "schockweb@gmail.com";

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
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.email === SUPER_ADMIN;
  const [activeTab, setActiveTab] = useState<Tab>("Appearance");
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [aiInstructions, setAiInstructions] = useState({ competitor: "", makeover: "" });
  const [aiSaving, setAiSaving] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);

  // Availability settings (server-side)
  const [availEnabledDays, setAvailEnabledDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [availStartHour, setAvailStartHour] = useState(9);
  const [availEndHour, setAvailEndHour] = useState(17);
  const [availDuration, setAvailDuration] = useState(30);
  const [adminNotifyEmail, setAdminNotifyEmail] = useState("");
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [availSaving, setAvailSaving] = useState(false);
  const [availSaved, setAvailSaved] = useState(false);
  const [availLoaded, setAvailLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("n1-admin-settings");
      if (stored) {
        const parsed = { ...DEFAULTS, ...JSON.parse(stored) };
        setSettings(parsed);
        applySettings(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  // Load availability from server
  useEffect(() => {
    fetch("/api/admin/availability")
      .then(r => r.json())
      .then(data => {
        setAvailEnabledDays(data.enabledDays || [1, 2, 3, 4, 5]);
        setAvailStartHour(data.startHour ?? 9);
        setAvailEndHour(data.endHour ?? 17);
        setAvailDuration(data.meetingDuration ?? 30);
        setAdminNotifyEmail(data.adminNotifyEmail || "");
        setEmailNotificationsEnabled(data.emailNotificationsEnabled || false);
        setAvailLoaded(true);
      })
      .catch(console.error);
  }, []);

  // Load AI instructions
  useEffect(() => {
    if (activeTab === "AI Config") {
      fetch("/api/admin/instructions")
        .then(r => r.json())
        .then(data => {
          setAiInstructions({
            competitor: data.competitor || "",
            makeover: data.makeover || "",
          });
        })
        .catch(console.error);
    }
  }, [activeTab]);

  const update = <K extends keyof DashboardSettings>(key: K, value: DashboardSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      applySettings(next);
      return next;
    });
  };

  const save = () => {
    localStorage.setItem("n1-admin-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveAvailability = async () => {
    setAvailSaving(true);
    try {
      await fetch("/api/admin/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabledDays: availEnabledDays,
          startHour: availStartHour,
          endHour: availEndHour,
          meetingDuration: availDuration,
          adminNotifyEmail,
          emailNotificationsEnabled,
        }),
      });
      setAvailSaved(true);
      setTimeout(() => setAvailSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save availability:", err);
    } finally {
      setAvailSaving(false);
    }
  };

  const toggleDay = (dayIndex: number) => {
    setAvailEnabledDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const reset = () => {
    setSettings(DEFAULTS);
    applySettings(DEFAULTS);
    localStorage.removeItem("n1-admin-settings");
  };

  const saveAiInstructions = async () => {
    setAiSaving(true);
    try {
      await fetch("/api/admin/instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiInstructions),
      });
      setAiSaved(true);
      setTimeout(() => setAiSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save AI instructions:", err);
    } finally {
      setAiSaving(false);
    }
  };

  const accentColor = ACCENT_OPTIONS.find(o => o.id === settings.accent)?.color || "#c48b9a";

  const filteredTabs = TABS.filter(t => {
    if (t === "AI Config" && !isSuperAdmin) return false;
    return true;
  });

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <h1>Settings</h1>
          <p>Configure your dashboard and business preferences</p>
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
          background: "var(--adm-bg-surface)",
          border: "1px solid var(--adm-border)",
          borderRadius: 16,
          overflow: "hidden",
          position: "sticky",
          top: 32,
        }}>
          {filteredTabs.map((tab) => {
            const icons: Record<Tab, string> = {
              Appearance: "🎨",
              Dashboard: "⬡",
              Business: "🏢",
              Calendar: "📅",
              Notifications: "🔔",
              "AI Config": "🤖",
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
                  padding: "13px 18px",
                  background: activeTab === tab ? `${accentColor}12` : "transparent",
                  color: activeTab === tab ? accentColor : "var(--adm-text-secondary)",
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: "1px solid var(--adm-border-subtle)",
                  borderLeft: activeTab === tab ? `3px solid ${accentColor}` : "3px solid transparent",
                  fontFamily: "var(--font-body)",
                  fontSize: 13.5,
                  fontWeight: activeTab === tab ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 15 }}>{icons[tab]}</span>
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
                          : "2px solid var(--adm-border)",
                        background: settings.accent === opt.id ? `${opt.color}10` : "var(--adm-bg-elevated)",
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
                      <span style={{ fontSize: 12, fontWeight: 500, color: settings.accent === opt.id ? opt.color : "var(--adm-text-secondary)" }}>
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
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", borderRadius: 10,
                      border: `1px solid ${settings.defaultPage === page.href ? accentColor + "50" : "var(--adm-border)"}`,
                      background: settings.defaultPage === page.href ? `${accentColor}08` : "var(--adm-bg-elevated)",
                      cursor: "pointer", transition: "all 0.15s ease",
                    }}>
                      <input
                        type="radio"
                        name="defaultPage"
                        checked={settings.defaultPage === page.href}
                        onChange={() => update("defaultPage", page.href)}
                        style={{ accentColor }}
                      />
                      <span style={{ fontSize: 14, color: "var(--adm-text-primary)", fontWeight: 500 }}>{page.label}</span>
                    </label>
                  ))}
                </div>
              </Section>

              <Section title="Dashboard Widgets" subtitle="Toggle visibility of homepage sections">
                {([
                  ["showMetrics",    "Metric Cards",     "KPI cards showing leads, bookings, and sources"],
                  ["showAgents",     "Agent Fleet",      "Grid of all AI service agents"],
                  ["showActivity",   "Activity Feed",    "Real-time log of events"],
                  ["showQuickStats", "Quick Stats Panel", "Summary sidebar panel"],
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

          {/* ── BUSINESS ── */}
          {activeTab === "Business" && (
            <>
              <Section title="Business Information" subtitle="Your company details used across the platform">
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="Business Name" value={settings.businessName} onChange={(v) => update("businessName", v)} />
                  <Field label="Contact Email" value={settings.businessEmail || session?.user?.email || ""} onChange={(v) => update("businessEmail", v)} />
                  <Field label="Phone Number" value={settings.businessPhone} onChange={(v) => update("businessPhone", v)} placeholder="+27..." />
                  <Field label="Website URL" value={settings.businessWebsite} onChange={(v) => update("businessWebsite", v)} placeholder="https://..." />
                </div>
              </Section>

              <Section title="Timezone" subtitle="All calendar times and booking slots use this timezone">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {TIMEZONES.map((tz) => (
                    <label key={tz.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", borderRadius: 10,
                      border: `1px solid ${settings.timezone === tz.id ? accentColor + "50" : "var(--adm-border)"}`,
                      background: settings.timezone === tz.id ? `${accentColor}08` : "var(--adm-bg-elevated)",
                      cursor: "pointer", transition: "all 0.15s ease",
                    }}>
                      <input
                        type="radio"
                        name="timezone"
                        checked={settings.timezone === tz.id}
                        onChange={() => update("timezone", tz.id)}
                        style={{ accentColor }}
                      />
                      <span style={{ fontSize: 13, color: "var(--adm-text-primary)", fontWeight: 500 }}>{tz.label}</span>
                    </label>
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* ── CALENDAR ── */}
          {activeTab === "Calendar" && (
            <>
              <Section title="Booking Hours" subtitle="Available time window for client bookings">
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: "var(--adm-text-tertiary)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Start Time
                    </label>
                    <select
                      value={availStartHour}
                      onChange={(e) => setAvailStartHour(parseInt(e.target.value))}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 8,
                        border: "1px solid var(--adm-border)", background: "var(--adm-bg-elevated)",
                        color: "var(--adm-text-primary)", fontFamily: "var(--font-body)", fontSize: 14,
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 6).map(h => (
                        <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: "var(--adm-text-tertiary)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      End Time
                    </label>
                    <select
                      value={availEndHour}
                      onChange={(e) => setAvailEndHour(parseInt(e.target.value))}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 8,
                        border: "1px solid var(--adm-border)", background: "var(--adm-bg-elevated)",
                        color: "var(--adm-text-primary)", fontFamily: "var(--font-body)", fontSize: 14,
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 12).map(h => (
                        <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Section>

              <Section title="Meeting Duration" subtitle="Default length for new bookings">
                <div style={{ display: "flex", gap: 12 }}>
                  {[15, 30, 45, 60].map((dur) => (
                    <OptionCard
                      key={dur}
                      label={`${dur} min`}
                      description={dur <= 15 ? "Quick call" : dur <= 30 ? "Standard" : dur <= 45 ? "Extended" : "Full hour"}
                      selected={availDuration === dur}
                      accent={accentColor}
                      onClick={() => setAvailDuration(dur)}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Availability" subtitle="Click a day to toggle it on/off — clients can only book on enabled days">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                    const dayIndex = i + 1 === 7 ? 0 : i + 1; // Convert to JS day (0=Sun, 1=Mon, ...)
                    const isEnabled = availEnabledDays.includes(dayIndex);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(dayIndex)}
                        style={{
                          padding: "12px 20px", borderRadius: 12,
                          border: `2px solid ${isEnabled ? accentColor + "60" : "var(--adm-border)"}`,
                          background: isEnabled ? `${accentColor}12` : "var(--adm-bg-primary)",
                          color: isEnabled ? accentColor : "var(--adm-text-tertiary)",
                          fontSize: 13, fontWeight: 700,
                          cursor: "pointer", transition: "all 0.15s ease",
                          position: "relative",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {day}
                        <div style={{
                          position: "absolute", top: 4, right: 6,
                          width: 6, height: 6, borderRadius: "50%",
                          background: isEnabled ? "#7dd3a8" : "transparent",
                          border: isEnabled ? "none" : "1px solid var(--adm-border)",
                        }} />
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: 12, color: "var(--adm-text-tertiary)", marginTop: 6, lineHeight: 1.5 }}>
                  <span style={{ color: "#7dd3a8", fontWeight: 600 }}>●</span> = enabled.
                  Currently active: {availEnabledDays.length === 0 ? "None" : availEnabledDays
                    .sort()
                    .map(d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                    .join(", ")
                  }
                </p>
              </Section>

              {/* Save bar for calendar settings */}
              <div style={{
                padding: "16px 20px", borderRadius: 14,
                background: "var(--adm-bg-surface)", border: "1px solid var(--adm-border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 13, color: "var(--adm-text-tertiary)" }}>
                  Calendar settings are saved server-side and affect the public booking page.
                </span>
                <button
                  onClick={saveAvailability}
                  disabled={availSaving}
                  className="btn btn-primary"
                  style={{ fontSize: 13 }}
                >
                  {availSaving ? "Saving…" : availSaved ? "✓ Saved" : "Save Calendar Settings"}
                </button>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === "Notifications" && (
            <>
              <Section title="Email Notifications" subtitle="Get notified via email when clients interact with your platform">
                <Toggle
                  label="Enable Email Alerts"
                  description="Receive emails when a client books a call or submits an inquiry"
                  checked={emailNotificationsEnabled}
                  accent={accentColor}
                  onChange={(v) => setEmailNotificationsEnabled(v)}
                />
                {emailNotificationsEnabled && (
                  <div style={{ marginTop: 8 }}>
                    <Field
                      label="Admin Notification Email"
                      value={adminNotifyEmail}
                      onChange={(v) => setAdminNotifyEmail(v)}
                      placeholder="admin@yourdomain.com"
                    />
                    <p style={{ fontSize: 11, color: "var(--adm-text-tertiary)", marginTop: 6, lineHeight: 1.5 }}>
                      This email will receive notifications when a client books a call. Make sure this is a valid, monitored email address.
                    </p>
                  </div>
                )}
              </Section>

              <Section title="In-App Notifications" subtitle="Dashboard alerts and indicators">
                <Toggle label="In-App Alerts" description="Show notification badges inside the admin dashboard" checked={settings.notifyInApp} accent={accentColor} onChange={(v) => update("notifyInApp", v)} />
              </Section>

              <Section title="Event Triggers" subtitle="Which events trigger a notification">
                <Toggle label="New Call Booking" description="When a client books a consultation call" checked={settings.notifyNewClient} accent={accentColor} onChange={(v) => update("notifyNewClient", v)} />
                <Toggle label="New Build Request" description="When a client submits a website build or makeover" checked={settings.notifyBuildRequest} accent={accentColor} onChange={(v) => update("notifyBuildRequest", v)} />
                <Toggle label="AI Brief Submission" description="When a client completes and submits the AI services brief" checked={settings.notifyAgentAlert} accent={accentColor} onChange={(v) => update("notifyAgentAlert", v)} />
              </Section>

              {/* Save bar */}
              <div style={{
                padding: "16px 20px", borderRadius: 14,
                background: "var(--adm-bg-surface)", border: "1px solid var(--adm-border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 13, color: "var(--adm-text-tertiary)" }}>
                  Email settings are saved server-side.
                </span>
                <button
                  onClick={saveAvailability}
                  disabled={availSaving}
                  className="btn btn-primary"
                  style={{ fontSize: 13 }}
                >
                  {availSaving ? "Saving…" : availSaved ? "✓ Saved" : "Save Notification Settings"}
                </button>
              </div>
            </>
          )}

          {/* ── AI CONFIG ── */}
          {activeTab === "AI Config" && isSuperAdmin && (
            <>
              <Section title="Competitor Analysis AI" subtitle="System prompt for the business scanner's competitor analysis feature">
                <textarea
                  value={aiInstructions.competitor}
                  onChange={(e) => setAiInstructions(prev => ({ ...prev, competitor: e.target.value }))}
                  placeholder="Enter custom instructions for the competitor analysis AI..."
                  className="prompt-textarea"
                  style={{ minHeight: 200 }}
                />
                <p style={{ fontSize: 11, color: "var(--adm-text-tertiary)" }}>
                  {aiInstructions.competitor.length} characters · This prompt is sent as the system message when scanning competitors.
                </p>
              </Section>

              <Section title="Website Audit AI" subtitle="System prompt for the business scanner's website makeover analysis">
                <textarea
                  value={aiInstructions.makeover}
                  onChange={(e) => setAiInstructions(prev => ({ ...prev, makeover: e.target.value }))}
                  placeholder="Enter custom instructions for the website audit AI..."
                  className="prompt-textarea"
                  style={{ minHeight: 200 }}
                />
                <p style={{ fontSize: 11, color: "var(--adm-text-tertiary)" }}>
                  {aiInstructions.makeover.length} characters · This prompt is sent as the system message when auditing websites.
                </p>
              </Section>

              <div style={{
                padding: "16px 20px", borderRadius: 12,
                background: "var(--adm-bg-surface)", border: "1px solid var(--adm-border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 13, color: "var(--adm-text-tertiary)" }}>
                  AI instructions are stored server-side and persist across deployments.
                </span>
                <button
                  onClick={saveAiInstructions}
                  disabled={aiSaving}
                  className="btn btn-primary"
                  style={{ fontSize: 13 }}
                >
                  {aiSaving ? "Saving…" : aiSaved ? "✓ Saved" : "Save AI Instructions"}
                </button>
              </div>
            </>
          )}

          {/* ── ACCOUNT ── */}
          {activeTab === "Account" && (
            <Section title="Account Details" subtitle="Your admin profile information">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Full Name" value={session?.user?.name || "Admin"} disabled />
                <Field label="Email Address" value={session?.user?.email || ""} disabled />
                <Field label="Role" value={isSuperAdmin ? "Executive Admin" : "Client Manager"} disabled />
                <div style={{
                  marginTop: 8, padding: "14px 18px", borderRadius: 12,
                  background: `${accentColor}08`, border: `1px solid ${accentColor}20`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: accentColor, marginBottom: 4 }}>
                    {isSuperAdmin ? "Full Access" : "Limited Access"}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--adm-text-tertiary)", lineHeight: 1.6, margin: 0 }}>
                    {isSuperAdmin
                      ? "You have full access to all admin features including AI configuration, system settings, and integrations."
                      : "You have access to client management, leads, calendar, build requests, and business scanner."
                    }
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* ── ADVANCED ── */}
          {activeTab === "Advanced" && (
            <>
              <Section title="Data Export" subtitle="Export your dashboard data for backup or analysis">
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="btn btn-ghost" style={{ fontSize: 13 }}>
                    Export Settings (JSON)
                  </button>
                  <button className="btn btn-ghost" style={{ fontSize: 13 }}>
                    Export Leads (CSV)
                  </button>
                  <button className="btn btn-ghost" style={{ fontSize: 13 }}>
                    Export Clients (CSV)
                  </button>
                </div>
              </Section>

              <Section title="Cache Management" subtitle="Clear cached data if the dashboard shows stale information">
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: 13 }}
                  onClick={() => {
                    localStorage.removeItem("n1-admin-settings");
                    window.location.reload();
                  }}
                >
                  Clear Dashboard Cache
                </button>
              </Section>

              <div style={{
                padding: 20, borderRadius: 14,
                border: "1px solid rgba(217,130,130,0.25)",
                background: "rgba(217,130,130,0.04)",
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#d98282", marginBottom: 6 }}>Danger Zone</div>
                <p style={{ fontSize: 13, color: "var(--adm-text-tertiary)", marginBottom: 16, lineHeight: 1.6 }}>
                  Reset all dashboard settings to factory defaults. This will clear your appearance preferences, widget visibility, and notification settings.
                </p>
                <button
                  onClick={reset}
                  style={{
                    padding: "10px 20px", borderRadius: 10,
                    border: "1px solid rgba(217,130,130,0.4)",
                    background: "rgba(217,130,130,0.1)",
                    color: "#d98282",
                    fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.15s ease",
                  }}
                >
                  Reset All Settings
                </button>
              </div>
            </>
          )}

          {/* Bottom save bar */}
          <div style={{
            padding: "16px 20px", borderRadius: 14,
            background: "var(--adm-bg-surface)", border: "1px solid var(--adm-border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, color: "var(--adm-text-tertiary)" }}>
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
      background: "var(--adm-bg-surface)",
      border: "1px solid var(--adm-border)",
      borderRadius: 16,
      overflow: "hidden",
    }}>
      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--adm-border-subtle)" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--adm-text-primary)", marginBottom: 2, fontFamily: "var(--font-heading)" }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--adm-text-tertiary)" }}>{subtitle}</div>
      </div>
      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
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
        flex: 1, padding: "14px 16px", borderRadius: 12,
        border: selected ? `2px solid ${accent}` : "2px solid var(--adm-border)",
        background: selected ? `${accent}0d` : "var(--adm-bg-elevated)",
        cursor: "pointer", textAlign: "left", transition: "all 0.15s ease",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: selected ? accent : "var(--adm-text-primary)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--adm-text-tertiary)", lineHeight: 1.5 }}>{description}</div>
    </button>
  );
}

function Toggle({ label, description, checked, accent, onChange }: {
  label: string; description: string; checked: boolean; accent: string; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--adm-border-subtle)" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--adm-text-primary)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--adm-text-tertiary)" }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: "none",
          background: checked ? accent : "var(--adm-bg-hover)",
          cursor: "pointer", position: "relative", flexShrink: 0,
          transition: "background 0.2s ease",
          boxShadow: checked ? `0 0 8px ${accent}50` : "none",
        }}
      >
        <div style={{
          position: "absolute", top: 3,
          left: checked ? 23 : 3,
          width: 18, height: 18, borderRadius: "50%",
          background: "#fff", transition: "left 0.2s ease",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }} />
      </button>
    </div>
  );
}

function Field({ label, value, disabled, onChange, placeholder }: {
  label: string; value: string; disabled?: boolean; onChange?: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--adm-text-tertiary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>
      <input
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={disabled}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 10,
          border: "1px solid var(--adm-border)",
          background: disabled ? "var(--adm-bg-primary)" : "var(--adm-bg-elevated)",
          color: disabled ? "var(--adm-text-tertiary)" : "var(--adm-text-primary)",
          fontFamily: "var(--font-body)", fontSize: 14, outline: "none", maxWidth: 480,
        }}
      />
    </div>
  );
}
