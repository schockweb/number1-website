"use client";

import React, { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BuildReport {
  id: string;
  createdAt: string;
  status: "pending" | "viewed" | "approved";
  notes?: string;
  palette: {
    name: string;
    emotion: string;
    bg: string;
    surface: string;
    accent: string;
    text: string;
    muted: string;
  };
  spacing: string;
  sections: { order: number; id: string; label: string }[];
  prompts: { title: string; prompt: string }[];
}

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  pending:  { label: "Pending Review", bg: "#F59E0B22", text: "#F59E0B" },
  viewed:   { label: "Viewed",         bg: "#3B82F622", text: "#3B82F6" },
  approved: { label: "Approved",       bg: "#10B98122", text: "#10B981" },
};

const SECTION_ICONS: Record<string, string> = {
  navbar: "≡", hero: "◈", stats: "◎", features: "▦", split: "◫",
  testimonial: "❝", pricing: "⬡", cta: "▷", gallery: "▣",
  faq: "?", team: "◉", contact: "✉", footer: "▬",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BuildReportsPage() {
  const [reports, setReports] = useState<BuildReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BuildReport | null>(null);
  const [notes, setNotes] = useState("");
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 10_000);
    return () => clearInterval(interval);
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/build-report");
      if (res.ok) setReports(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    setSavingStatus("saving");
    await fetch("http://localhost:3000/api/build-report", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, notes }),
    });
    setSavingStatus("saved");
    setTimeout(() => setSavingStatus("idle"), 2000);
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: status as BuildReport["status"], notes } : r));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as BuildReport["status"], notes } : prev);
  };

  const copyPrompt = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const accColor = selected?.palette.accent ?? "#C8A97E";

  // The root layout already provides sidebar + main-content wrapper.
  // This page renders inside that main-content, so we use a flex layout
  // that fills the full available height.
  return (
    <div style={{ display: "flex", height: "100%", margin: "-32px -40px", overflow: "hidden" }}>

      {/* ── LEFT: Reports list ── */}
      <div style={{
        width: selected ? "360px" : "100%",
        borderRight: selected ? "1px solid rgba(255,255,255,0.06)" : "none",
        display: "flex", flexDirection: "column",
        transition: "width 0.35s ease",
        overflow: "hidden",
        flexShrink: 0,
        minHeight: "100vh",
      }}>
        {/* Header */}
        <div style={{
          padding: "28px 28px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
              Build Reports
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              Client Briefs
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{reports.length} reports</div>
            <button onClick={fetchReports} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "6px 12px", color: "rgba(255,255,255,0.5)",
              fontSize: 11, cursor: "pointer",
            }}>↻ Refresh</button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
              Loading reports…
            </div>
          )}
          {!loading && reports.length === 0 && (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.2 }}>✦</div>
              <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>No build reports yet.</div>
              <div style={{ color: "rgba(255,255,255,0.1)", fontSize: 11, marginTop: 6 }}>
                They&apos;ll appear here when clients finish the Canvas builder.
              </div>
            </div>
          )}
          {reports.map(r => {
            const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending;
            const isActive = selected?.id === r.id;
            return (
              <button
                key={r.id}
                onClick={() => { setSelected(r); setNotes(r.notes ?? ""); }}
                style={{
                  width: "100%", textAlign: "left", padding: "14px 16px",
                  borderRadius: 14, border: `1px solid ${isActive ? `${r.palette.accent}44` : "rgba(255,255,255,0.06)"}`,
                  background: isActive ? `${r.palette.accent}10` : "rgba(255,255,255,0.02)",
                  cursor: "pointer", marginBottom: 8, transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {[r.palette.bg, r.palette.surface, r.palette.accent].map((c, i) => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, border: "1px solid rgba(255,255,255,0.1)" }} />
                    ))}
                    <span style={{ fontSize: 11, fontWeight: 700, color: r.palette.accent, marginLeft: 4 }}>{r.palette.name}</span>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: s.bg, color: s.text }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                  {r.sections.length} sections · {r.spacing} spacing · {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Report detail ── */}
      {selected && (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {/* Sticky header */}
          <div style={{
            padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 10,
            background: "rgba(10,10,11,0.9)", backdropFilter: "blur(20px)",
          }}>
            <button onClick={() => setSelected(null)} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "6px 12px", color: "rgba(255,255,255,0.5)",
              fontSize: 11, cursor: "pointer",
            }}>← Back</button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", marginBottom: 2 }}>#{selected.id}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{selected.palette.name} — {selected.sections.length} sections</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["pending", "viewed", "approved"] as const).map(s => {
                const st = STATUS_STYLES[s];
                return (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} style={{
                    fontSize: 11, fontWeight: 700, padding: "6px 14px", borderRadius: 10,
                    border: `1px solid ${selected.status === s ? st.text + "66" : "rgba(255,255,255,0.08)"}`,
                    background: selected.status === s ? st.bg : "transparent",
                    color: selected.status === s ? st.text : "rgba(255,255,255,0.3)",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>{st.label}</button>
                );
              })}
            </div>
            {savingStatus !== "idle" && (
              <div style={{ fontSize: 11, color: savingStatus === "saved" ? "#10B981" : "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                {savingStatus === "saving" ? "Saving…" : "✓ Saved"}
              </div>
            )}
          </div>

          <div style={{ padding: 32, flex: 1 }}>
            {/* Design Brief */}
            <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>Design Brief</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)", padding: 16 }}>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>Colour Palette</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: selected.palette.accent }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{selected.palette.name}</span>
                  </div>
                  {[
                    { l: "Background", v: selected.palette.bg },
                    { l: "Surface",    v: selected.palette.surface },
                    { l: "Accent",     v: selected.palette.accent },
                    { l: "Text",       v: selected.palette.text },
                    { l: "Muted",      v: selected.palette.muted },
                    { l: "Mood",       v: selected.palette.emotion },
                  ].map(row => (
                    <div key={row.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 6, marginBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{row.l}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {row.l !== "Mood" && <div style={{ width: 10, height: 10, borderRadius: "50%", background: row.v, border: "1px solid rgba(255,255,255,0.1)" }} />}
                        <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.6)" }}>{row.v}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)", padding: 16 }}>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>Layout</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{selected.sections.length} sections</span>
                    <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>{selected.spacing} spacing</span>
                  </div>
                  {selected.sections.map(sec => (
                    <div key={sec.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.2)", width: 16 }}>{sec.order}</span>
                      <span style={{ fontSize: 12, color: accColor }}>{SECTION_ICONS[sec.id] ?? "▸"}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{sec.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Prompts */}
            <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>AI Prompts</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>{selected.prompts.length} build instructions — paste into Antigravity</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {selected.prompts.map((p, i) => (
                  <div key={i} style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.04)", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: `${accColor}0A` }}>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>#{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: accColor }}>{p.title}</span>
                      <button onClick={() => copyPrompt(p.prompt, `${selected.id}-${i}`)} style={{
                        marginLeft: "auto", fontSize: 10, fontFamily: "monospace",
                        padding: "3px 10px", borderRadius: 8, cursor: "pointer",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: copied === `${selected.id}-${i}` ? `${accColor}30` : "transparent",
                        color: copied === `${selected.id}-${i}` ? accColor : "rgba(255,255,255,0.3)",
                        transition: "all 0.2s",
                      }}>
                        {copied === `${selected.id}-${i}` ? "✓ copied" : "copy"}
                      </button>
                    </div>
                    <div style={{ padding: "12px 14px", background: "rgba(0,0,0,0.2)" }}>
                      <p style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>{p.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: 24 }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Your Notes</div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes about this build report, client feedback, edits needed…"
                rows={5}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
                  padding: "12px 14px", color: "#fff", fontSize: 13, lineHeight: 1.6,
                  resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                }}
              />
              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["approved", "viewed", "pending"] as const).map(s => {
                  const st = STATUS_STYLES[s];
                  return (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} style={{
                      fontSize: 11, fontWeight: 700, padding: "8px 18px", borderRadius: 10,
                      border: `1px solid ${st.text}44`, background: st.bg, color: st.text, cursor: "pointer",
                    }}>Mark as {st.label}</button>
                  );
                })}
                <button onClick={() => updateStatus(selected.id, selected.status)} style={{
                  marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "8px 18px", borderRadius: 10,
                  border: `1px solid ${accColor}44`, background: `${accColor}18`, color: accColor, cursor: "pointer",
                }}>
                  {savingStatus === "saving" ? "Saving…" : savingStatus === "saved" ? "✓ Saved" : "Save Notes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
