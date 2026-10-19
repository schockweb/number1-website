"use client";

import { useState, useEffect, useMemo } from 'react';

interface BookingData {
  id: string;
  name: string;
  email: string;
  date: string;
  duration: number;
  topic: string | null;
  status: string;
  notes: string | null;
  lead?: { id: string; name: string; company: string | null; status: string } | null;
}

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  confirmed: { color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  completed: { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  cancelled: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  no_show:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface AvailabilitySettings {
  enabledDays: number[];
  startHour: number;
  endHour: number;
  meetingDuration: number;
  adminNotifyEmail: string;
  emailNotificationsEnabled: boolean;
}

const DEFAULT_SETTINGS: AvailabilitySettings = {
  enabledDays: [1, 2, 3, 4, 5],
  startHour: 9,
  endHour: 17,
  meetingDuration: 30,
  adminNotifyEmail: '',
  emailNotificationsEnabled: false,
};

export default function AdminCalendarPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showSidebar, setShowSidebar] = useState(false);

  // Availability settings
  const [showAvailability, setShowAvailability] = useState(false);
  const [settings, setSettings] = useState<AvailabilitySettings>(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/bookings?month=${monthStr}`)
      .then(r => r.json())
      .then(d => setBookings(d.bookings || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [monthStr]);

  // Load availability settings
  useEffect(() => {
    fetch('/api/admin/availability')
      .then(r => r.json())
      .then(data => {
        setSettings({
          enabledDays: data.enabledDays ?? DEFAULT_SETTINGS.enabledDays,
          startHour: data.startHour ?? DEFAULT_SETTINGS.startHour,
          endHour: data.endHour ?? DEFAULT_SETTINGS.endHour,
          meetingDuration: data.meetingDuration ?? DEFAULT_SETTINGS.meetingDuration,
          adminNotifyEmail: data.adminNotifyEmail ?? DEFAULT_SETTINGS.adminNotifyEmail,
          emailNotificationsEnabled: data.emailNotificationsEnabled ?? DEFAULT_SETTINGS.emailNotificationsEnabled,
        });
      })
      .catch(console.error);
  }, []);

  const saveSettings = async () => {
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSaved(false);
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      } else {
        setSettingsError('Failed to save settings');
      }
    } catch {
      setSettingsError('Connection error');
    } finally {
      setSettingsLoading(false);
    }
  };

  const toggleDay = (dayIndex: number) => {
    setSettings(prev => ({
      ...prev,
      enabledDays: prev.enabledDays.includes(dayIndex)
        ? prev.enabledDays.filter(d => d !== dayIndex)
        : [...prev.enabledDays, dayIndex].sort(),
    }));
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const bookingsByDay = useMemo(() => {
    const map: Record<number, BookingData[]> = {};
    bookings.forEach(b => {
      const d = new Date(b.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(b);
      }
    });
    return map;
  }, [bookings, month, year]);

  const selectedBookings = selectedDay ? (bookingsByDay[selectedDay] || []) : [];
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    if (window.innerWidth <= 768) {
      setShowSidebar(true);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  // Check which calendar days are unavailable based on settings
  const isDayUnavailable = (day: number) => {
    const d = new Date(year, month, day);
    return !settings.enabledDays.includes(d.getDay());
  };

  const formatHour = (h: number) => `${String(h).padStart(2, '0')}:00`;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 20, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', fontSize: 10, fontWeight: 700, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            ◇ Calendar
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 700, color: 'var(--adm-text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>Meeting Calendar</h1>
          <p style={{ fontSize: 13, color: 'var(--adm-text-tertiary)' }}>View and manage all booked client meetings</p>
        </div>
        <button
          onClick={() => setShowAvailability(!showAvailability)}
          style={{
            padding: '10px 20px', borderRadius: 12, minHeight: 48,
            background: showAvailability ? 'rgba(129,140,248,0.15)' : 'var(--adm-bg-elevated)',
            border: `1px solid ${showAvailability ? 'rgba(129,140,248,0.3)' : 'var(--adm-border)'}`,
            color: showAvailability ? '#818CF8' : 'var(--adm-text-secondary)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
          aria-label="Manage availability settings"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Availability
        </button>
      </div>

      {/* ── Availability Settings Panel ── */}
      {showAvailability && (
        <div style={{
          background: 'var(--adm-bg-surface)', border: '1px solid var(--adm-border)',
          borderRadius: 18, padding: 'clamp(16px, 2.5vw, 28px)', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--adm-text-primary)', marginBottom: 4 }}>Availability Settings</h3>
              <p style={{ fontSize: 12, color: 'var(--adm-text-tertiary)' }}>These settings control which days and times clients can book on your public booking page.</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {settingsSaved && (
                <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>✓ Saved</span>
              )}
              {settingsError && (
                <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>{settingsError}</span>
              )}
              <button
                onClick={saveSettings}
                disabled={settingsLoading}
                style={{
                  padding: '10px 20px', borderRadius: 10, minHeight: 40,
                  background: '#34D399', border: 'none', color: '#000',
                  fontSize: 13, fontWeight: 700, cursor: settingsLoading ? 'default' : 'pointer',
                  opacity: settingsLoading ? 0.6 : 1,
                }}
              >
                {settingsLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Available Days */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--adm-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Available Days
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DAY_LABELS.map((label, i) => {
                const active = settings.enabledDays.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    style={{
                      padding: '10px 16px', borderRadius: 10, minHeight: 42,
                      background: active ? 'rgba(52,211,153,0.12)' : 'var(--adm-bg-elevated)',
                      border: `1px solid ${active ? 'rgba(52,211,153,0.3)' : 'var(--adm-border)'}`,
                      color: active ? '#34D399' : 'var(--adm-text-tertiary)',
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hours + Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--adm-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Start Hour
              </label>
              <select
                value={settings.startHour}
                onChange={e => setSettings(p => ({ ...p, startHour: Number(e.target.value) }))}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10, minHeight: 48,
                  background: 'var(--adm-bg-elevated)', border: '1px solid var(--adm-border)',
                  color: 'var(--adm-text-primary)', fontSize: 14, outline: 'none',
                  appearance: 'none', cursor: 'pointer',
                }}
              >
                {Array.from({ length: 15 }, (_, i) => i + 6).map(h => (
                  <option key={h} value={h}>{formatHour(h)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--adm-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                End Hour
              </label>
              <select
                value={settings.endHour}
                onChange={e => setSettings(p => ({ ...p, endHour: Number(e.target.value) }))}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10, minHeight: 48,
                  background: 'var(--adm-bg-elevated)', border: '1px solid var(--adm-border)',
                  color: 'var(--adm-text-primary)', fontSize: 14, outline: 'none',
                  appearance: 'none', cursor: 'pointer',
                }}
              >
                {Array.from({ length: 15 }, (_, i) => i + 8).map(h => (
                  <option key={h} value={h}>{formatHour(h)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--adm-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Meeting Duration
              </label>
              <select
                value={settings.meetingDuration}
                onChange={e => setSettings(p => ({ ...p, meetingDuration: Number(e.target.value) }))}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10, minHeight: 48,
                  background: 'var(--adm-bg-elevated)', border: '1px solid var(--adm-border)',
                  color: 'var(--adm-text-primary)', fontSize: 14, outline: 'none',
                  appearance: 'none', cursor: 'pointer',
                }}
              >
                {[15, 30, 45, 60, 90].map(d => (
                  <option key={d} value={d}>{d} minutes</option>
                ))}
              </select>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--adm-border)', marginBottom: 24 }} />

          {/* Email Notifications */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--adm-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                  Email Notifications
                </label>
                <p style={{ fontSize: 11, color: 'var(--adm-text-tertiary)', margin: 0 }}>
                  Receive an alert when a client books a call or submits an inquiry.
                </p>
              </div>
              <button
                onClick={() => setSettings(p => ({ ...p, emailNotificationsEnabled: !p.emailNotificationsEnabled }))}
                style={{
                  width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: settings.emailNotificationsEnabled ? '#34D399' : 'var(--adm-bg-elevated)',
                  position: 'relative', transition: 'background 0.2s',
                  boxShadow: `inset 0 0 0 1px ${settings.emailNotificationsEnabled ? 'transparent' : 'var(--adm-border)'}`,
                }}
                role="switch"
                aria-checked={settings.emailNotificationsEnabled}
                aria-label="Toggle email notifications"
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: settings.emailNotificationsEnabled ? 27 : 3,
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
            {settings.emailNotificationsEnabled && (
              <div style={{ marginTop: 10 }}>
                <input
                  type="email"
                  placeholder="admin@yourdomain.com"
                  value={settings.adminNotifyEmail}
                  onChange={e => setSettings(p => ({ ...p, adminNotifyEmail: e.target.value }))}
                  style={{
                    width: '100%', maxWidth: 400, padding: '12px 14px', borderRadius: 10, minHeight: 48,
                    background: 'var(--adm-bg-elevated)', border: '1px solid var(--adm-border)',
                    color: 'var(--adm-text-primary)', fontSize: 14, outline: 'none',
                  }}
                />
                <p style={{ fontSize: 11, color: 'var(--adm-text-tertiary)', marginTop: 8 }}>
                  You&apos;ll receive an email when a client books a call through your booking page.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Layout: Calendar + Sidebar ── */}
      <div className="cal-layout">
        {/* Calendar Grid */}
        <div style={{ background: 'var(--adm-bg-surface)', border: '1px solid var(--adm-border)', borderRadius: 18, padding: 'clamp(14px, 2vw, 24px)' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={prevMonth} aria-label="Previous month" style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--adm-bg-elevated)', border: '1px solid var(--adm-border)', color: 'var(--adm-text-secondary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', fontWeight: 700, color: 'var(--adm-text-primary)' }}>{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} aria-label="Next month" style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--adm-bg-elevated)', border: '1px solid var(--adm-border)', color: 'var(--adm-text-secondary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--adm-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '6px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayBookings = bookingsByDay[day] || [];
              const isToday = isCurrentMonth && today.getDate() === day;
              const isSelected = selectedDay === day;
              const unavailable = isDayUnavailable(day);
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  aria-label={`${MONTHS[month]} ${day}${unavailable ? ', unavailable' : ''}${dayBookings.length > 0 ? `, ${dayBookings.length} meeting${dayBookings.length > 1 ? 's' : ''}` : ''}`}
                  aria-pressed={isSelected}
                  style={{
                    minHeight: 48, minWidth: 0, borderRadius: 10, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                    background: isSelected
                      ? 'rgba(52,211,153,0.15)'
                      : unavailable
                        ? 'rgba(255,255,255,0.02)'
                        : isToday ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(52,211,153,0.3)' : isToday ? 'rgba(255,255,255,0.12)' : 'transparent'}`,
                    color: isSelected
                      ? '#34D399'
                      : unavailable
                        ? 'var(--adm-text-tertiary)'
                        : isToday ? 'var(--adm-text-primary)' : 'var(--adm-text-secondary)',
                    fontSize: 'clamp(12px, 1.4vw, 14px)',
                    fontWeight: isToday || isSelected ? 700 : 400,
                    opacity: unavailable && !isSelected ? 0.4 : 1,
                    transition: 'all 0.15s', padding: '6px 0',
                    textDecoration: unavailable ? 'line-through' : 'none',
                  }}
                >
                  {day}
                  {dayBookings.length > 0 && (
                    <div style={{ display: 'flex', gap: 2 }}>
                      {dayBookings.slice(0, 3).map((b, bi) => (
                        <div key={bi} style={{ width: 4, height: 4, borderRadius: '50%', background: STATUS_COLORS[b.status]?.color || '#818CF8' }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--adm-text-tertiary)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34D399' }} /> Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--adm-text-tertiary)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--adm-text-tertiary)', opacity: 0.4 }} /> Unavailable
            </div>
            {Object.entries(STATUS_COLORS).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--adm-text-tertiary)' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: val.color }} /> {key.replace('_', ' ')}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel: Selected Day's Meetings ── */}
        <>
          {showSidebar && (
            <div className="cal-sidebar-overlay" onClick={() => setShowSidebar(false)} aria-hidden="true" />
          )}

          <div className={`cal-sidebar${showSidebar ? ' cal-sidebar-open' : ''}`}>
            <button className="cal-sidebar-close" onClick={() => setShowSidebar(false)} aria-label="Close meeting details">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--adm-text-primary)', marginBottom: 6, letterSpacing: '-0.01em' }}>
              {selectedDay ? `${MONTHS[month]} ${selectedDay}` : 'Select a day'}
            </h3>

            {selectedDay && isDayUnavailable(selectedDay) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
                fontSize: 12, color: '#F59E0B', fontWeight: 600, marginBottom: 14,
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                This day is marked as unavailable
              </div>
            )}

            {loading ? (
              <div style={{ color: 'var(--adm-text-tertiary)', fontSize: 12, padding: '40px 0', textAlign: 'center' }}>Loading…</div>
            ) : selectedBookings.length === 0 ? (
              <div style={{ color: 'var(--adm-text-tertiary)', fontSize: 12, padding: '40px 0', textAlign: 'center' }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block' }}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                No meetings this day
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedBookings.map(b => {
                  const sc = STATUS_COLORS[b.status] || STATUS_COLORS.confirmed;
                  const time = new Date(b.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={b.id} style={{ background: 'var(--adm-bg-elevated)', border: '1px solid var(--adm-border)', borderRadius: 14, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--adm-text-primary)' }}>{time}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}33` }}>{b.status}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-text-primary)', marginBottom: 2 }}>{b.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--adm-text-tertiary)' }}>{b.email}</div>
                      {b.topic && <div style={{ fontSize: 11, color: 'var(--adm-text-tertiary)', marginTop: 6, fontStyle: 'italic' }}>&quot;{b.topic}&quot;</div>}
                      <div style={{ fontSize: 10, color: 'var(--adm-text-tertiary)', marginTop: 8 }}>{b.duration} min</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                        {b.status === 'confirmed' && (
                          <>
                            <button onClick={() => updateStatus(b.id, 'completed')} style={{ flex: 1, padding: '8px 0', minHeight: 40, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Complete</button>
                            <button onClick={() => updateStatus(b.id, 'no_show')} style={{ flex: 1, padding: '8px 0', minHeight: 40, borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>No Show</button>
                            <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ flex: 1, padding: '8px 0', minHeight: 40, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      </div>

      {/* Scoped responsive styles */}
      <style>{`
        .cal-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
        }
        .cal-sidebar {
          background: var(--adm-bg-surface);
          border: 1px solid var(--adm-border);
          border-radius: 18px;
          padding: 24px;
          min-height: 400px;
        }
        .cal-sidebar-close {
          display: none;
        }
        .cal-sidebar-overlay {
          display: none;
        }

        @media (max-width: 900px) {
          .cal-layout {
            grid-template-columns: 1fr;
          }
          .cal-sidebar {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 90;
            border-radius: 20px 20px 0 0;
            min-height: auto;
            max-height: 75vh;
            overflow-y: auto;
            padding: 20px 20px 28px;
            transform: translateY(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 -16px 60px rgba(0,0,0,0.5);
          }
          .cal-sidebar-open {
            transform: translateY(0);
          }
          .cal-sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(13, 11, 16, 0.6);
            backdrop-filter: blur(4px);
            z-index: 85;
          }
          .cal-sidebar-close {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 16px; right: 16px;
            width: 36px; height: 36px;
            border-radius: 10px;
            background: var(--adm-bg-hover);
            border: 1px solid var(--adm-border);
            color: var(--adm-text-secondary);
            cursor: pointer;
          }
        }

        @media (max-width: 480px) {
          .cal-sidebar {
            padding: 18px 16px 24px;
          }
        }
      `}</style>
    </div>
  );
}
