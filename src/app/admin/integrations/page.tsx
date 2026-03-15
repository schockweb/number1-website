"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const CURRENT_CLIENT_ID = "client-demo-001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://number1.studio';
const CLIENT_OPTIONS = [
  { id: "client-demo-001", name: "Demo Client (N1)" },
  { id: "client-acme-002", name: "Acme Corporation" },
  { id: "client-nova-003", name: "Nova Retail" },
];

interface Integration {
  id: string;
  clientId: string;
  platformName: string;
  encryptedApiToken: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const PLATFORMS = [
  {
    id: "google_ads",
    name: "Google Ads",
    icon: "📊",
    desc: "Connect your Google Ads account to enable automated campaign management, bid optimization, and performance reporting.",
    color: "#4285f4",
  },
  {
    id: "shopify",
    name: "Shopify",
    icon: "🛍️",
    desc: "Link your Shopify store to sync inventory data, analyze sales velocity, and automate product promotions.",
    color: "#96bf48",
  },
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: "◻", section: "overview", href: "/" },
  { label: "Agents", icon: "⬡", section: "overview", href: "/" },
  { label: "Inventory", icon: "▤", badge: "23", section: "overview", href: "/" },
  { label: "Analytics", icon: "◈", section: "intelligence", href: "/" },
  { label: "Campaigns", icon: "◎", section: "intelligence", href: "/" },
  { label: "Forecasts", icon: "◇", section: "intelligence", href: "/" },
  { label: "Integrations", icon: "⬡", section: "intelligence", href: "/integrations", active: true },
  { label: "Employees", icon: "◉", section: "people", href: "/" },
  { label: "Payroll", icon: "▣", section: "people", href: "/" },
  { label: "Settings", icon: "⚙", section: "system", href: "/" },
];

export default function IntegrationsPage() {
  const [clientId, setClientId] = useState(CURRENT_CLIENT_ID);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const loadIntegrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations?clientId=${clientId}`);
      const data = await res.json();
      setIntegrations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load integrations:", err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const getIntegration = (platformId: string) =>
    integrations.find((i) => i.platformName === platformId);

  const handleConnect = (platformId: string) => {
    // In production, this redirects to the real OAuth consent screen.
    // For now, simulate by going through the callback with a mock code.
    const oauthUrls: Record<string, string> = {
      google_ads: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID || "PLACEHOLDER"}&redirect_uri=${encodeURIComponent("http://localhost:3001/api/integrations/callback?platform=google_ads")}&response_type=code&scope=https://www.googleapis.com/auth/adwords&state=${clientId}`,
      shopify: `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "example"}.myshopify.com/admin/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID || "PLACEHOLDER"}&scope=read_products,read_orders&redirect_uri=${encodeURIComponent("http://localhost:3001/api/integrations/callback?platform=shopify")}&state=${clientId}`,
    };
    window.location.href = oauthUrls[platformId] || "/integrations";
  };

  const handleDisconnect = async (platformId: string) => {
    if (!confirm(`Disconnect ${platformId.replace("_", " ")}? This will revoke API access.`)) return;
    setDisconnecting(platformId);
    try {
      await fetch(`/api/integrations?clientId=${clientId}&platform=${platformId}`, {
        method: "DELETE",
      });
      await loadIntegrations();
    } catch (err) {
      console.error("Failed to disconnect:", err);
    } finally {
      setDisconnecting(null);
    }
  };

  const overviewItems = NAV_ITEMS.filter((n) => n.section === "overview");
  const intelItems = NAV_ITEMS.filter((n) => n.section === "intelligence");
  const peopleItems = NAV_ITEMS.filter((n) => n.section === "people");
  const systemItems = NAV_ITEMS.filter((n) => n.section === "system");

  return (
    <>
      {/* Main Content */}
      <>
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <h1>Integrations</h1>
            <p>Connect external platforms for automated agent workflows</p>
          </div>
          <div className="top-bar-right">
            <div className="view-switcher" id="view-switcher">
              <a href="http://localhost:3001" className="view-btn view-btn-admin" title="Admin Dashboard">
                ⬡ Admin
              </a>
              <a href={SITE_URL} className="view-btn view-btn-client" title="Client Site">
                ◎ Client Site
              </a>
            </div>
            <Link href="/" className="btn btn-ghost">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Client Selector */}
        <div className="card" style={{ marginBottom: 24, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="card-title" style={{ marginBottom: 4 }}>Active Client</div>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0 }}>
                All integrations below are scoped to this client (tenant isolation)
              </p>
            </div>
            <select
              className="client-select"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              {CLIENT_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Platform Grid */}
        <div className="section-header">
          <div>
            <div className="section-title">Available Platforms</div>
            <div className="section-subtitle">
              OAuth 2.0 connections for external data and actions
            </div>
          </div>
          <span className="badge badge-success">
            <span className="status-dot online" /> {integrations.length} Connected
          </span>
        </div>

        <div className="integration-grid">
          {PLATFORMS.map((platform) => {
            const existing = getIntegration(platform.id);
            const isConnected = !!existing;
            const isDisconnecting = disconnecting === platform.id;

            return (
              <div
                key={platform.id}
                className={`integration-card ${isConnected ? "connected" : ""}`}
                style={{ "--platform-color": platform.color } as React.CSSProperties}
              >
                <div className="integration-card-header">
                  <div className="integration-icon">{platform.icon}</div>
                  <div>
                    <div className="integration-name">{platform.name}</div>
                    {isConnected && (
                      <span className="badge badge-success" style={{ fontSize: 9, padding: "2px 8px" }}>
                        Connected
                      </span>
                    )}
                  </div>
                </div>
                <p className="integration-desc">{platform.desc}</p>

                {isConnected && existing && (
                  <div className="integration-meta">
                    <span>Secret: …{existing.encryptedApiToken.slice(-20)}</span>
                    <span>Since {new Date(existing.createdAt).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="integration-actions">
                  {isConnected ? (
                    <button
                      className="btn btn-danger-outline"
                      onClick={() => handleDisconnect(platform.id)}
                      disabled={isDisconnecting}
                    >
                      {isDisconnecting ? "Disconnecting…" : "Disconnect"}
                    </button>
                  ) : (
                    <button
                      className="btn connect-btn"
                      style={{ background: platform.color, color: "#fff" }}
                      onClick={() => handleConnect(platform.id)}
                    >
                      Connect {platform.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Note */}
        <div className="card" style={{ marginTop: 32, padding: "20px 24px", borderColor: "var(--border-accent)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <div>
              <div className="card-title" style={{ marginBottom: 4, color: "var(--accent)" }}>
                Security & Tenant Isolation
              </div>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0, lineHeight: 1.6 }}>
                All API tokens are encrypted via <strong>Google Cloud Secret Manager</strong>.
                The database stores only secret references, never plaintext credentials.
                Each client&apos;s data is strictly isolated — agents for Client A cannot access Client B&apos;s integrations or instructions.
              </p>
            </div>
          </div>
        </div>
      </>
    </>
  );
}
