"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface BookingPreview {
  id: string;
  name: string;
  email: string;
  date: string;
  topic: string | null;
  status: string;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://number1.studio";
const SUPER_ADMIN = "schockweb@gmail.com";

export default function AdminHomePage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.email === SUPER_ADMIN;
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const [stats, setStats] = useState({
    totalLeads: 0,
    newThisWeek: 0,
    upcomingBookings: 0,
    totalClients: 0,
    leadSources: 0,
  });
  const [recentLeads, setRecentLeads] = useState<
    {
      id: string;
      name: string;
      email: string;
      status: string;
      source: string;
      createdAt: string;
    }[]
  >([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<BookingPreview[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/leads").then((r) => r.json()),
      fetch("/api/admin/bookings").then((r) => r.json()),
    ])
      .then(([leadsData, bookingsData]) => {
        const leads = leadsData.leads || [];
        const bookings = bookingsData.bookings || [];
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const newThisWeek = leads.filter(
          (l: { createdAt: string }) => new Date(l.createdAt) >= weekAgo
        ).length;
        const upcoming = bookings.filter(
          (b: { date: string; status: string }) =>
            new Date(b.date) >= now && b.status === "confirmed"
        );
        setStats({
          totalLeads: leads.length,
          newThisWeek,
          upcomingBookings: upcoming.length,
          totalClients: 0,
          leadSources: new Set(leads.map((l: { source: string }) => l.source)).size,
        });
        setRecentLeads(leads.slice(0, 6));
        setUpcomingMeetings(upcoming.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    new: { bg: "rgba(155,142,196,0.08)", text: "#b8a0d4", border: "rgba(155,142,196,0.15)" },
    contacted: { bg: "rgba(142,184,232,0.08)", text: "#8eb8e8", border: "rgba(142,184,232,0.15)" },
    qualified: { bg: "rgba(125,211,168,0.08)", text: "#7dd3a8", border: "rgba(125,211,168,0.15)" },
    proposal: { bg: "rgba(232,197,103,0.08)", text: "#e8c567", border: "rgba(232,197,103,0.15)" },
    won: { bg: "rgba(125,211,168,0.10)", text: "#7dd3a8", border: "rgba(125,211,168,0.2)" },
    lost: { bg: "rgba(232,124,124,0.08)", text: "#e87c7c", border: "rgba(232,124,124,0.15)" },
  };

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 17
      ? "Good afternoon"
      : "Good evening";

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const QUICK_ACTIONS = [
    { href: "/admin/leads", label: "Leads", desc: "Pipeline & outreach", icon: "👤", accent: "#b8a0d4" },
    { href: "/admin/calendar", label: "Calendar", desc: "Meeting schedule", icon: "📅", accent: "#7dd3a8" },
    { href: "/admin/build-requests", label: "Build Requests", desc: "Website briefs", icon: "🏗️", accent: "#d4a574" },
    { href: "/admin/clients", label: "Clients", desc: "Account management", icon: "🤝", accent: "#8eb8e8" },
    { href: "/admin/business-scanner", label: "Scanner", desc: "AI business audit", icon: "🔍", accent: "#c48b9a" },
    ...(isSuperAdmin ? [
      { href: "/admin/ai-services", label: "AI Services", desc: "Agent config", icon: "🤖", accent: "#e8c567" },
    ] : []),
  ];

  const Shimmer = ({ w = "100%", h = 16 }: { w?: string | number; h?: number }) => (
    <div style={{
      width: w, height: h, borderRadius: 6,
      background: "linear-gradient(90deg, var(--adm-bg-elevated) 25%, var(--adm-bg-hover) 50%, var(--adm-bg-elevated) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.8s ease-in-out infinite",
    }} />
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>

      {/* ── Ambient Glows ── */}
      <div style={{ position: "fixed", top: -200, right: -100, width: 600, height: 600,
        background: "radial-gradient(ellipse, rgba(196,139,154,0.035) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -150, left: -80, width: 500, height: 500,
        background: "radial-gradient(ellipse, rgba(155,142,196,0.03) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0 }} />

      {/* ── Hero / Greeting ── */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 500, color: "var(--adm-text-tertiary)",
            marginBottom: 10, letterSpacing: "0.02em",
          }}>
            {dateStr}
          </div>
          <h1 style={{
            fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 600, color: "var(--adm-text-primary)",
            letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 6,
          }}>
            {greeting},{" "}
            <span style={{
              background: "linear-gradient(120deg, var(--adm-accent) 20%, var(--adm-accent-secondary) 80%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {firstName}
            </span>
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--adm-text-tertiary)", lineHeight: 1.5, maxWidth: 420 }}>
            Here&apos;s your executive overview for today.
          </p>
        </div>
        {isSuperAdmin && (
          <Link href={SITE_URL} target="_blank" style={{
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 18px", borderRadius: 10,
            background: "var(--adm-bg-surface)", border: "1px solid var(--adm-border)",
            fontSize: 12, fontWeight: 500, color: "var(--adm-text-secondary)",
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 13 }}>🌐</span> View Live Site
          </Link>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14,
        marginBottom: 28, position: "relative", zIndex: 1,
      }}>
        {[
          { label: "Total Leads", value: stats.totalLeads, accent: "var(--adm-accent-secondary)", change: null },
          { label: "New This Week", value: stats.newThisWeek, accent: "#7dd3a8", change: stats.newThisWeek > 0 ? `+${stats.newThisWeek}` : null },
          { label: "Upcoming Calls", value: stats.upcomingBookings, accent: "var(--adm-accent)", change: null },
          { label: "Lead Sources", value: stats.leadSources, accent: "#e8c567", change: null },
        ].map((kpi, i) => (
          <div key={i} style={{
            padding: "22px 24px", borderRadius: 16,
            background: "var(--adm-bg-surface)", border: "1px solid var(--adm-border)",
            position: "relative", overflow: "hidden", transition: "all 0.25s",
          }}>
            {/* Top accent glow */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${kpi.accent}40, transparent)`,
              opacity: 0.5,
            }} />
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 14,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 500, color: "var(--adm-text-tertiary)",
                letterSpacing: "0.03em",
              }}>
                {kpi.label}
              </span>
              {kpi.change && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#7dd3a8",
                  background: "rgba(125,211,168,0.08)", padding: "2px 8px",
                  borderRadius: 20, border: "1px solid rgba(125,211,168,0.15)",
                }}>
                  {kpi.change}
                </span>
              )}
            </div>
            <div style={{
              fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
              fontWeight: 700, color: kpi.accent, letterSpacing: "-0.02em",
            }}>
              {loading ? <Shimmer w={48} h={28} /> : kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content: Leads + Meetings ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16,
        marginBottom: 28, position: "relative", zIndex: 1,
      }}>
        {/* Recent Leads */}
        <div style={{
          background: "var(--adm-bg-surface)", border: "1px solid var(--adm-border)",
          borderRadius: 16, overflow: "hidden",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "18px 22px", borderBottom: "1px solid var(--adm-border-subtle)",
          }}>
            <h2 style={{
              fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600,
              color: "var(--adm-text-primary)", letterSpacing: "-0.01em",
            }}>
              Recent Leads
            </h2>
            <Link href="/admin/leads" style={{
              fontSize: 11, color: "var(--adm-accent-secondary)",
              textDecoration: "none", fontWeight: 600,
              padding: "4px 12px", borderRadius: 8,
              background: "var(--adm-accent-secondary-subtle)",
              border: "1px solid rgba(155,142,196,0.12)",
              transition: "all 0.15s",
            }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map(i => <Shimmer key={i} h={42} />)}
            </div>
          ) : recentLeads.length === 0 ? (
            <div style={{
              padding: "48px 22px", textAlign: "center",
              color: "var(--adm-text-tertiary)", fontSize: 13,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>👤</div>
              No leads yet
            </div>
          ) : (
            <div>
              {recentLeads.map((l, idx) => {
                const sc = STATUS_COLORS[l.status] || STATUS_COLORS.new;
                return (
                  <Link
                    key={l.id}
                    href="/admin/leads"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "13px 22px", textDecoration: "none",
                      borderBottom: idx < recentLeads.length - 1 ? "1px solid var(--adm-border-subtle)" : "none",
                      transition: "background 0.12s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: `linear-gradient(145deg, ${sc.bg}, var(--adm-bg-elevated))`,
                        border: `1px solid ${sc.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: sc.text, flexShrink: 0,
                      }}>
                        {l.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600, color: "var(--adm-text-primary)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {l.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--adm-text-tertiary)", marginTop: 1 }}>
                          {l.email}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: sc.bg, color: sc.text,
                      border: `1px solid ${sc.border}`,
                      textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0,
                    }}>
                      {l.status}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div style={{
          background: "var(--adm-bg-surface)", border: "1px solid var(--adm-border)",
          borderRadius: 16, overflow: "hidden",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "18px 22px", borderBottom: "1px solid var(--adm-border-subtle)",
          }}>
            <h2 style={{
              fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600,
              color: "var(--adm-text-primary)", letterSpacing: "-0.01em",
            }}>
              Upcoming Calls
            </h2>
            <Link href="/admin/calendar" style={{
              fontSize: 11, color: "#7dd3a8", textDecoration: "none", fontWeight: 600,
              padding: "4px 12px", borderRadius: 8,
              background: "rgba(125,211,168,0.06)",
              border: "1px solid rgba(125,211,168,0.12)",
              transition: "all 0.15s",
            }}>
              Calendar →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map(i => <Shimmer key={i} h={52} />)}
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <div style={{
              padding: "48px 22px", textAlign: "center",
              color: "var(--adm-text-tertiary)", fontSize: 13,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>📅</div>
              No upcoming meetings
            </div>
          ) : (
            <div>
              {upcomingMeetings.map((b, idx) => {
                const bDate = new Date(b.date);
                const dayStr = bDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
                const timeStr = bDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div
                    key={b.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 22px",
                      borderBottom: idx < upcomingMeetings.length - 1 ? "1px solid var(--adm-border-subtle)" : "none",
                    }}
                  >
                    {/* Date block */}
                    <div style={{
                      width: 48, minHeight: 48, borderRadius: 12, flexShrink: 0,
                      background: "rgba(125,211,168,0.05)", border: "1px solid rgba(125,211,168,0.1)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      padding: "6px 0",
                    }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#7dd3a8", lineHeight: 1 }}>
                        {bDate.getDate()}
                      </span>
                      <span style={{ fontSize: 9, color: "var(--adm-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                        {bDate.toLocaleDateString("en-GB", { month: "short" })}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: "var(--adm-text-primary)",
                        marginBottom: 3,
                      }}>
                        {b.name}
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        fontSize: 11, color: "var(--adm-text-tertiary)",
                      }}>
                        <span>{timeStr} CAT</span>
                        {b.topic && (
                          <>
                            <span style={{ opacity: 0.3 }}>·</span>
                            <span style={{
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              fontStyle: "italic", maxWidth: 140,
                            }}>
                              {b.topic}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--adm-text-tertiary)",
          marginBottom: 12, paddingLeft: 2,
        }}>
          Quick Actions
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
        }}>
          {QUICK_ACTIONS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: "none",
                background: "var(--adm-bg-surface)", border: "1px solid var(--adm-border)",
                borderRadius: 14, padding: "18px 20px",
                display: "flex", alignItems: "center", gap: 14,
                transition: "all 0.2s", cursor: "pointer",
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Hover accent line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${item.accent}35, transparent)`,
                opacity: 0,
                transition: "opacity 0.2s",
              }} />
              <span style={{
                fontSize: 20, width: 42, height: 42, borderRadius: 12,
                background: `${item.accent}0a`, border: `1px solid ${item.accent}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {item.icon}
              </span>
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: "var(--adm-text-primary)", marginBottom: 2,
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 11, color: "var(--adm-text-tertiary)" }}>
                  {item.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        marginTop: 40, paddingTop: 20,
        borderTop: "1px solid var(--adm-border-subtle)",
        textAlign: "center", fontSize: 10, color: "var(--adm-text-tertiary)",
        letterSpacing: "0.08em", opacity: 0.5,
      }}>
        NUMBER1 ADMIN · EXECUTIVE DASHBOARD
      </div>
    </div>
  );
}
