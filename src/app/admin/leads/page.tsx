"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LeadData {
  id: string;
  name: string;
  email: string;
  company: string | null;
  source: string;
  status: string;
  priority: string;
  notes: string | null;
  createdAt: string;
  bookings?: { id: string; date: string; status: string }[];
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  new:       { label: 'New',       color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  contacted: { label: 'Contacted', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  qualified: { label: 'Qualified', color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  proposal:  { label: 'Proposal',  color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  won:       { label: 'Won',       color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  lost:      { label: 'Lost',      color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

const SOURCE_LABELS: Record<string, string> = {
  website: '🌐 Website', build_report: '📋 Build Report', makeover: '✦ Makeover',
  signup: '👤 Signup', manual: '✏️ Manual',
};

const PRIORITY_CFG: Record<string, { label: string; color: string }> = {
  low: { label: '↓ Low', color: 'rgba(255,255,255,0.3)' },
  normal: { label: '→ Normal', color: 'rgba(255,255,255,0.5)' },
  high: { label: '↑ High', color: '#F87171' },
};

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<LeadData | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', company: '', source: 'manual', priority: 'normal' });

  const load = () => {
    setLoading(true);
    fetch('/api/admin/leads')
      .then(r => r.json())
      .then(d => setLeads(d.leads || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openDetail = (l: LeadData) => {
    setSelected(l);
    setEditStatus(l.status);
    setEditPriority(l.priority);
    setEditNotes(l.notes || '');
    setSaved(false);
  };

  const saveChanges = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, status: editStatus, priority: editPriority, notes: editNotes }),
    });
    setSaving(false);
    setSaved(true);
    setLeads(prev => prev.map(l => l.id === selected.id ? { ...l, status: editStatus, priority: editPriority, notes: editNotes } : l));
    setSelected(prev => prev ? { ...prev, status: editStatus, priority: editPriority, notes: editNotes } : null);
  };

  const addLead = async () => {
    if (!newLead.name.trim() || !newLead.email.trim()) return;
    await fetch('/api/admin/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead),
    });
    setShowAdd(false);
    setNewLead({ name: '', email: '', company: '', source: 'manual', priority: 'normal' });
    load();
  };

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const count = (s: string) => s === 'all' ? leads.length : leads.filter(l => l.status === s).length;

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 20, background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', fontSize: 10, fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            ◎ Lead Management
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Leads</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Track and manage every potential client</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAdd(true)} style={{ padding: '8px 18px', borderRadius: 12, background: '#818CF8', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            + Add Lead
          </button>
          <button onClick={load} style={{ padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Status filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', ...STATUSES].map(s => {
          const cfg = s !== 'all' ? STATUS_CFG[s] : null;
          const isActive = filter === s;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: isActive ? (cfg?.bg || 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isActive ? (cfg?.color || 'rgba(255,255,255,0.2)') + '44' : 'rgba(255,255,255,0.06)'}`,
              color: isActive ? (cfg?.color || '#fff') : 'rgba(255,255,255,0.35)',
              transition: 'all 0.2s',
            }}>
              {cfg?.label || 'All'} ({count(s)})
            </button>
          );
        })}
      </div>

      {/* Lead cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Loading leads…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 32, opacity: 0.15, marginBottom: 12 }}>◎</div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>No leads yet</div>
          <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: 12, marginTop: 6 }}>Leads are created when clients book calls or submit build requests.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {filtered.map(l => {
            const sc = STATUS_CFG[l.status] || STATUS_CFG.new;
            const pc = PRIORITY_CFG[l.priority] || PRIORITY_CFG.normal;
            return (
              <div key={l.id} onClick={() => openDetail(l)} style={{
                padding: 20, borderRadius: 16, cursor: 'pointer',
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}33` }}>
                    {sc.label}
                  </span>
                  <span style={{ fontSize: 11, color: pc.color, fontWeight: 600 }}>{pc.label}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{l.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{l.email}</div>
                {l.company && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{l.company}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
                    {SOURCE_LABELS[l.source] || l.source} · {new Date(l.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ fontSize: 11, color: '#818CF8', fontWeight: 600 }}>View →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail slide-out */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 40 }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 480, background: '#0A0B14', borderLeft: '1px solid rgba(255,255,255,0.08)', zIndex: 50, display: 'flex', flexDirection: 'column', boxShadow: '0 0 60px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{selected.name}</h2>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{selected.email}{selected.company ? ` · ${selected.company}` : ''}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 24 }}>
                {STATUSES.map(s => {
                  const sc = STATUS_CFG[s];
                  const isActive = editStatus === s;
                  return (
                    <button key={s} onClick={() => setEditStatus(s)} style={{
                      padding: '10px 0', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      background: isActive ? sc.bg : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? sc.color + '44' : 'rgba(255,255,255,0.07)'}`,
                      color: isActive ? sc.color : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.2s',
                    }}>{sc.label}</button>
                  );
                })}
              </div>

              <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>Priority</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                {(['low', 'normal', 'high'] as const).map(p => {
                  const pc = PRIORITY_CFG[p];
                  const isActive = editPriority === p;
                  return (
                    <button key={p} onClick={() => setEditPriority(p)} style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      background: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                      color: isActive ? pc.color : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.2s',
                    }}>{pc.label}</button>
                  );
                })}
              </div>

              <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>Notes</div>
              <textarea rows={6} value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Add notes about this lead…" style={{ ...inputStyle, resize: 'vertical', marginBottom: 24 }} />

              <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>Info</div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 14 }}>
                {[
                  { l: 'Source', v: SOURCE_LABELS[selected.source] || selected.source },
                  { l: 'Created', v: new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{r.l}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={saveChanges} disabled={saving} style={{
                width: '100%', padding: 14, borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: saved ? '#10B981' : '#818CF8', color: '#fff', transition: 'all 0.3s',
              }}>
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Lead Modal */}
      {showAdd && (
        <>
          <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 40 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 420, background: '#0A0B14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, zIndex: 50, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Add Lead</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Name *" value={newLead.name} onChange={e => setNewLead(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
              <input placeholder="Email *" value={newLead.email} onChange={e => setNewLead(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
              <input placeholder="Company (optional)" value={newLead.company} onChange={e => setNewLead(p => ({ ...p, company: e.target.value }))} style={inputStyle} />
              <select value={newLead.source} onChange={e => setNewLead(p => ({ ...p, source: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="manual">Manual</option>
                <option value="website">Website</option>
                <option value="build_report">Build Report</option>
                <option value="makeover">Makeover</option>
                <option value="signup">Signup</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={addLead} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#818CF8', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add Lead</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
