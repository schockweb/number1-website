"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LeadSummary { status: string; count: number }
interface BookingPreview { id: string; name: string; email: string; date: string; topic: string | null; status: string }

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://number1.studio';

export default function AdminHomePage() {
  const [stats, setStats] = useState({ totalLeads: 0, newThisWeek: 0, upcomingBookings: 0, totalClients: 0 });
  const [recentLeads, setRecentLeads] = useState<{ id: string; name: string; email: string; status: string; source: string; createdAt: string }[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<BookingPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/leads').then(r => r.json()),
      fetch('/api/admin/bookings').then(r => r.json()),
    ]).then(([leadsData, bookingsData]) => {
      const leads = leadsData.leads || [];
      const bookings = bookingsData.bookings || [];

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newThisWeek = leads.filter((l: { createdAt: string }) => new Date(l.createdAt) >= weekAgo).length;
      const upcoming = bookings.filter((b: { date: string; status: string }) => new Date(b.date) >= now && b.status === 'confirmed');

      setStats({
        totalLeads: leads.length,
        newThisWeek,
        upcomingBookings: upcoming.length,
        totalClients: 0, // Will come from /api/admin/clients if available
      });

      setRecentLeads(leads.slice(0, 6));
      setUpcomingMeetings(upcoming.slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
    new:       { color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
    contacted: { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
    qualified: { color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
    proposal:  { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
    won:       { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    lost:      { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 36, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 20, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', fontSize: 10, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
          ✦ Admin Dashboard
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 6 }}>
          Number1 Control Centre
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', maxWidth: 480, lineHeight: 1.6 }}>
          Manage leads, track meetings, and monitor your platform.
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total Leads', value: stats.totalLeads, color: '#818CF8', icon: '◎' },
          { label: 'New This Week', value: stats.newThisWeek, color: '#34D399', icon: '↑' },
          { label: 'Upcoming Calls', value: stats.upcomingBookings, color: '#FBBF24', icon: '◇' },
          { label: 'Lead Sources', value: new Set(recentLeads.map(l => l.source)).size, color: '#F97316', icon: '◈' },
        ].map((kpi, i) => (
          <div key={i} style={{
            padding: '20px 20px', borderRadius: 16,
            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, background: `radial-gradient(circle, ${kpi.color}15, transparent 70%)`, borderRadius: '50%' }} />
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
              <span style={{ marginRight: 6 }}>{kpi.icon}</span>{kpi.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: kpi.color, letterSpacing: '-0.02em' }}>
              {loading ? '—' : kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* Recent Leads */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Recent Leads</h2>
            <Link href="/admin/leads" style={{ fontSize: 11, color: '#818CF8', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>Loading…</div>
          ) : recentLeads.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>No leads yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentLeads.map(l => {
                const sc = STATUS_COLORS[l.status] || STATUS_COLORS.new;
                return (
                  <Link key={l.id} href="/admin/leads" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.15s',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{l.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{l.email}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}33` }}>
                      {sc.color ? l.status : 'new'}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Upcoming Meetings</h2>
            <Link href="/admin/calendar" style={{ fontSize: 11, color: '#34D399', textDecoration: 'none', fontWeight: 600 }}>Calendar →</Link>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>Loading…</div>
          ) : upcomingMeetings.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>No upcoming meetings</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {upcomingMeetings.map(b => {
                const bDate = new Date(b.date);
                return (
                  <div key={b.id} style={{
                    padding: '12px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{b.name}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                        {bDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {bDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {b.topic && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>"{b.topic}"</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { href: '/admin/leads', icon: '◎', label: 'Manage Leads', desc: 'View & update all leads', color: '#818CF8' },
          { href: '/admin/calendar', icon: '◇', label: 'Calendar', desc: 'View meeting schedule', color: '#34D399' },
          { href: '/admin/build-requests', icon: '◈', label: 'Build Requests', desc: 'Website & makeover briefs', color: '#F97316' },
          { href: '/admin/clients', icon: '◉', label: 'Clients', desc: 'Manage client accounts', color: '#60A5FA' },
          { href: '/admin/subscriptions', icon: '⬢', label: 'Subscriptions', desc: 'Plans & billing', color: '#FBBF24' },
          { href: SITE_URL, icon: '🌍', label: 'Client Site', desc: 'View the live portal', color: '#10B981' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'all 0.2s', cursor: 'pointer',
            }}>
              <span style={{ fontSize: 20, width: 36, height: 36, borderRadius: 10, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{item.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
