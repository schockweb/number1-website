"use client";

import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://number1.studio';

export default function AdminHomePage() {
  return (
    <>
      <div style={{ paddingTop: 40, paddingBottom: 32, position: "relative", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", fontSize: 11, fontWeight: 700, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
          ✦ Admin Dashboard
        </div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 700, color: "var(--adm-text-primary)", marginBottom: 8, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
          Number1 Control Centre
        </h1>
        <p style={{ fontSize: 15, color: "var(--adm-text-secondary)", maxWidth: 480, lineHeight: 1.6 }}>
          Manage data, monitor services, and configure your platform.
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { href: "/admin/clients", icon: "◉", label: "Clients", desc: "Manage client accounts" },
          { href: "/admin/build-requests", icon: "◈", label: "Build Requests", desc: "Website & makeover requests" },
          { href: "/admin/subscriptions", icon: "⬢", label: "Subscriptions", desc: "Manage client plans & billing" },
          { href: "/admin/integrations", icon: "⬡", label: "Integrations", desc: "Connect external platforms" },
          { href: "/admin/ai-services", icon: "⬡", label: "AI Services", desc: "Configure agent tiers" },
          { href: SITE_URL, icon: "🌍", label: "Client Site", desc: "View the live portal" },
        ].map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <div className="intro-quick-card" style={{ background: "var(--adm-bg-surface)", border: "1px solid var(--adm-border)", borderRadius: 14, padding: "20px 24px", transition: "all 0.25s", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--adm-text-primary)", marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "var(--adm-text-tertiary)" }}>{item.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
