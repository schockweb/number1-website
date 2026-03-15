"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Subscription {
  id: string;
  planTier: string;
  priceChfCents: number;
  maxAgents: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  refundEligibleUntil: string;
  cancelledAt: string | null;
}

interface Client {
  id: string;
  name: string;
  email: string;
  companyName: string;
  planTier: string;
  status: string;
  createdAt: string;
  subscriptions: Subscription[];
}

// ─── Plan Configuration ──────────────────────────────────────────────────────

const PLANS = [
  { tier: "STANDARD", price: "950", maxAgents: 5, color: "#6366f1" },
  { tier: "PREMIUM", price: "1,499", maxAgents: 10, color: "#a855f7" },
  { tier: "BUSINESS", price: "3,500", maxAgents: 15, color: "#ec4899" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function planColor(tier: string) {
  return PLANS.find((p) => p.tier === tier)?.color || "#6366f1";
}

// ─── New Client Modal ────────────────────────────────────────────────────────

interface NewClientModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function NewClientModal({ onClose, onCreated }: NewClientModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [planTier, setPlanTier] = useState("STANDARD");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, companyName, planTier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create client");
        return;
      }
      onCreated();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [name, email, companyName, planTier, onClose, onCreated]);

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
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Onboard New Client</h2>
            <p className="modal-subtitle">
              Create a new subscription — active immediately, no trial.
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#fca5a5",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <label className="modal-label" htmlFor="client-name">
            Contact Name
          </label>
          <input
            id="client-name"
            className="prompt-textarea"
            style={{ height: 42, resize: "none", marginBottom: 12 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah Miller"
          />

          <label className="modal-label" htmlFor="client-email">
            Email Address
          </label>
          <input
            id="client-email"
            className="prompt-textarea"
            style={{ height: 42, resize: "none", marginBottom: 12 }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. sarah@acme.com"
          />

          <label className="modal-label" htmlFor="client-company">
            Company Name
          </label>
          <input
            id="client-company"
            className="prompt-textarea"
            style={{ height: 42, resize: "none", marginBottom: 12 }}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Corp"
          />

          <label className="modal-label">Select Plan</label>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            {PLANS.map((plan) => (
              <button
                key={plan.tier}
                onClick={() => setPlanTier(plan.tier)}
                style={{
                  flex: 1,
                  padding: "14px 10px",
                  borderRadius: 12,
                  border:
                    planTier === plan.tier
                      ? `2px solid ${plan.color}`
                      : "1px solid rgba(255,255,255,0.1)",
                  background:
                    planTier === plan.tier
                      ? `${plan.color}15`
                      : "rgba(255,255,255,0.03)",
                  color: planTier === plan.tier ? "#fff" : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                    color: plan.color,
                  }}
                >
                  {plan.tier}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  {plan.price} <span style={{ fontSize: 11, opacity: 0.6 }}>CHF/mo</span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.5,
                    marginTop: 4,
                  }}
                >
                  {plan.maxAgents} agents
                </div>
              </button>
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            ✦ 7-day satisfaction guarantee — 90% refund if not happy. No free trial.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving || !name || !email || !companyName}
          >
            {saving ? "Creating…" : "Create Client & Subscription"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Plan Change Modal ───────────────────────────────────────────────────────

interface PlanChangeModalProps {
  client: Client;
  onClose: () => void;
  onChanged: () => void;
}

function PlanChangeModal({ client, onClose, onChanged }: PlanChangeModalProps) {
  const [newTier, setNewTier] = useState(client.planTier);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id, planTier: newTier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update plan");
        return;
      }
      onChanged();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [client.id, newTier, onClose, onChanged]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Change Plan — {client.companyName}</h2>
            <p className="modal-subtitle">
              Current plan: {client.planTier}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#fca5a5",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {PLANS.map((plan) => {
              const isCurrent = plan.tier === client.planTier;
              const isSelected = plan.tier === newTier;
              return (
                <button
                  key={plan.tier}
                  onClick={() => setNewTier(plan.tier)}
                  disabled={isCurrent}
                  style={{
                    flex: 1,
                    padding: "16px 10px",
                    borderRadius: 12,
                    border: isSelected
                      ? `2px solid ${plan.color}`
                      : "1px solid rgba(255,255,255,0.1)",
                    background: isSelected
                      ? `${plan.color}15`
                      : "rgba(255,255,255,0.03)",
                    color: isCurrent
                      ? "rgba(255,255,255,0.3)"
                      : isSelected
                      ? "#fff"
                      : "rgba(255,255,255,0.5)",
                    cursor: isCurrent ? "not-allowed" : "pointer",
                    textAlign: "center",
                    transition: "all 0.2s",
                    opacity: isCurrent ? 0.5 : 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 4,
                      color: plan.color,
                    }}
                  >
                    {plan.tier}
                    {isCurrent && " (current)"}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {plan.price} <span style={{ fontSize: 11, opacity: 0.6 }}>CHF/mo</span>
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
                    {plan.maxAgents} agents
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleChange}
            disabled={saving || newTier === client.planTier}
          >
            {saving
              ? "Updating…"
              : newTier === client.planTier
              ? "Select a Different Plan"
              : PLANS.findIndex((p) => p.tier === newTier) >
                PLANS.findIndex((p) => p.tier === client.planTier)
              ? "Upgrade Plan"
              : "Downgrade Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Subscriptions Page ──────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewClient, setShowNewClient] = useState(false);
  const [changePlanClient, setChangePlanClient] = useState<Client | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCancel = useCallback(
    async (clientId: string) => {
      if (!confirm("Are you sure you want to cancel this subscription?")) return;
      setCancellingId(clientId);
      try {
        await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, action: "cancel" }),
        });
        fetchClients();
      } catch (err) {
        console.error("Cancel failed:", err);
      } finally {
        setCancellingId(null);
      }
    },
    [fetchClients]
  );

  // Compute summary stats
  const activeClients = clients.filter((c) => c.status === "active");
  const byPlan = {
    STANDARD: activeClients.filter((c) => c.planTier === "STANDARD").length,
    PREMIUM: activeClients.filter((c) => c.planTier === "PREMIUM").length,
    BUSINESS: activeClients.filter((c) => c.planTier === "BUSINESS").length,
  };
  const mrr =
    byPlan.STANDARD * 950 + byPlan.PREMIUM * 1499 + byPlan.BUSINESS * 3500;

  return (
    <>
      {/* Modals */}
      {showNewClient && (
        <NewClientModal
          onClose={() => setShowNewClient(false)}
          onCreated={fetchClients}
        />
      )}
      {changePlanClient && (
        <PlanChangeModal
          client={changePlanClient}
          onClose={() => setChangePlanClient(null)}
          onChanged={fetchClients}
        />
      )}

      {/* Main Content */}
      <>
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <h1>Subscriptions</h1>
            <p>Manage client plans, billing, and agent access</p>
          </div>
          <div className="top-bar-right">
            <button
              className="btn btn-primary"
              id="btn-new-client"
              onClick={() => setShowNewClient(true)}
            >
              + New Client
            </button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="metric-grid" id="sub-metrics">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Total Clients</span>
              <span style={{ fontSize: 20 }}>👥</span>
            </div>
            <div className="card-value">{clients.length}</div>
            <span className="card-change positive">
              {activeClients.length} active
            </span>
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Monthly Revenue</span>
              <span style={{ fontSize: 20 }}>💰</span>
            </div>
            <div className="card-value">
              {mrr.toLocaleString("de-CH")} CHF
            </div>
            <span className="card-change positive">MRR</span>
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Standard</span>
              <span
                style={{
                  fontSize: 12,
                  background: "#6366f120",
                  color: "#6366f1",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                950 CHF
              </span>
            </div>
            <div className="card-value">{byPlan.STANDARD}</div>
            <span className="card-change positive">5 agents</span>
          </div>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Premium</span>
              <span
                style={{
                  fontSize: 12,
                  background: "#a855f720",
                  color: "#a855f7",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                1,499 CHF
              </span>
            </div>
            <div className="card-value">{byPlan.PREMIUM}</div>
            <span className="card-change positive">10 agents</span>
          </div>
        </div>

        {/* Client Table */}
        <div className="section-header" style={{ marginTop: 8 }}>
          <div>
            <div className="section-title">Client Directory</div>
            <div className="section-subtitle">
              {loading
                ? "Loading…"
                : `${clients.length} client${clients.length !== 1 ? "s" : ""} registered`}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.2fr 0.8fr 0.6fr 0.6fr 1.2fr",
              padding: "12px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            <span>Company</span>
            <span>Contact</span>
            <span>Plan</span>
            <span>Agents</span>
            <span>Status</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>

          {/* Rows */}
          {loading ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              Loading clients…
            </div>
          ) : clients.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              No clients yet.{" "}
              <button
                onClick={() => setShowNewClient(true)}
                style={{
                  color: "#daa520",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Create the first one →
              </button>
            </div>
          ) : (
            clients.map((client) => {
              const sub = client.subscriptions?.[0];
              const refundEligible =
                sub &&
                sub.refundEligibleUntil &&
                new Date() <= new Date(sub.refundEligibleUntil);

              return (
                <div
                  key={client.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.2fr 0.8fr 0.6fr 0.6fr 1.2fr",
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    alignItems: "center",
                    fontSize: 13,
                    transition: "background 0.15s",
                  }}
                  className="table-row-hover"
                >
                  {/* Company */}
                  <div>
                    <div style={{ fontWeight: 600, color: "#fff" }}>
                      {client.companyName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                        marginTop: 2,
                      }}
                    >
                      Since {formatDate(client.createdAt)}
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.8)" }}>
                      {client.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                        marginTop: 2,
                      }}
                    >
                      {client.email}
                    </div>
                  </div>

                  {/* Plan */}
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        background: `${planColor(client.planTier)}20`,
                        color: planColor(client.planTier),
                        border: `1px solid ${planColor(client.planTier)}40`,
                      }}
                    >
                      {client.planTier}
                    </span>
                    {sub && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.3)",
                          marginTop: 3,
                        }}
                      >
                        {(sub.priceChfCents / 100).toLocaleString("de-CH")} CHF/mo
                      </div>
                    )}
                  </div>

                  {/* Agents */}
                  <div
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 600,
                    }}
                  >
                    {sub?.maxAgents || "—"}/{15}
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color:
                          client.status === "active"
                            ? "#4ade80"
                            : client.status === "cancelled"
                            ? "#f87171"
                            : "#fbbf24",
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background:
                            client.status === "active"
                              ? "#4ade80"
                              : client.status === "cancelled"
                              ? "#f87171"
                              : "#fbbf24",
                        }}
                      />
                      {client.status}
                    </span>
                    {refundEligible && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "#fbbf24",
                          marginTop: 3,
                        }}
                      >
                        ⏱ Refund eligible
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      justifyContent: "flex-end",
                    }}
                  >
                    {client.status === "active" && (
                      <>
                        <button
                          className="btn btn-ghost"
                          style={{ fontSize: 12, padding: "5px 12px" }}
                          onClick={() => setChangePlanClient(client)}
                        >
                          Change Plan
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{
                            fontSize: 12,
                            padding: "5px 12px",
                            color: "#f87171",
                            borderColor: "rgba(248,113,113,0.3)",
                          }}
                          onClick={() => handleCancel(client.id)}
                          disabled={cancellingId === client.id}
                        >
                          {cancellingId === client.id ? "…" : "Cancel"}
                        </button>
                      </>
                    )}
                    {client.status === "cancelled" && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.25)",
                        }}
                      >
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Refund Policy Notice */}
        <div
          style={{
            marginTop: 20,
            padding: "14px 20px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 16 }}>ℹ️</span>
          <span>
            <strong style={{ color: "rgba(255,255,255,0.6)" }}>
              Refund Policy:
            </strong>{" "}
            No free trial. All new subscriptions include a 7-day satisfaction
            guarantee — 90% refund if the client is not satisfied within the first 7
            days.
          </span>
        </div>
      </>
    </>
  );
}
