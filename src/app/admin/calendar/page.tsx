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
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AdminCalendarPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showAdd, setShowAdd] = useState(false);
  const [newBooking, setNewBooking] = useState({ name: '', email: '', date: '', time: '10:00', topic: '' });

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

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Calendar grid
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

  const addBooking = async () => {
    if (!newBooking.name.trim() || !newBooking.email.trim() || !newBooking.date) return;
    const dateTime = `${newBooking.date}T${newBooking.time}:00`;
    await fetch('/api/admin/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBooking.name, email: newBooking.email, date: dateTime, topic: newBooking.topic || null }),
    });
    setShowAdd(false);
    setNewBooking({ name: '', email: '', date: '', time: '10:00', topic: '' });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 20, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', fontSize: 10, fontWeight: 700, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            ◇ Calendar
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Meeting Calendar</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>View and manage all booked client meetings</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: '8px 18px', borderRadius: 12, background: '#34D399', border: 'none', color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          + Book Meeting
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Calendar Grid */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24 }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button onClick={prevMonth} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayBookings = bookingsByDay[day] || [];
              const isToday = isCurrentMonth && today.getDate() === day;
              const isSelected = selectedDay === day;
              return (
                <button key={day} onClick={() => setSelectedDay(day)} style={{
                  aspectRatio: '1', borderRadius: 12, cursor: 'pointer', position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                  background: isSelected ? 'rgba(52,211,153,0.15)' : isToday ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: `1px solid ${isSelected ? 'rgba(52,211,153,0.3)' : isToday ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}`,
                  color: isSelected ? '#34D399' : isToday ? '#fff' : 'rgba(255,255,255,0.5)',
                  fontSize: 13, fontWeight: isToday || isSelected ? 700 : 400,
                  transition: 'all 0.15s',
                }}>
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
        </div>

        {/* Right panel: selected day's meetings */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 24, minHeight: 400 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            {selectedDay ? `${MONTHS[month]} ${selectedDay}` : 'Select a day'}
          </h3>

          {loading ? (
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, padding: '40px 0', textAlign: 'center' }}>Loading…</div>
          ) : selectedBookings.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, padding: '40px 0', textAlign: 'center' }}>No meetings this day</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedBookings.map(b => {
                const sc = STATUS_COLORS[b.status] || STATUS_COLORS.confirmed;
                const time = new Date(b.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={b.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{time}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}33` }}>{b.status}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{b.email}</div>
                    {b.topic && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 6, fontStyle: 'italic' }}>"{b.topic}"</div>}
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>{b.duration} min</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                      {b.status === 'confirmed' && (
                        <>
                          <button onClick={() => updateStatus(b.id, 'completed')} style={{ flex: 1, padding: '6px 0', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Complete</button>
                          <button onClick={() => updateStatus(b.id, 'no_show')} style={{ flex: 1, padding: '6px 0', borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>No Show</button>
                          <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ flex: 1, padding: '6px 0', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Booking Modal */}
      {showAdd && (
        <>
          <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 40 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 420, background: '#0A0B14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, zIndex: 50, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Book Meeting</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Client name *" value={newBooking.name} onChange={e => setNewBooking(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
              <input placeholder="Email *" value={newBooking.email} onChange={e => setNewBooking(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="date" value={newBooking.date} onChange={e => setNewBooking(p => ({ ...p, date: e.target.value }))} style={{ ...inputStyle, flex: 2 }} />
                <input type="time" value={newBooking.time} onChange={e => setNewBooking(p => ({ ...p, time: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
              </div>
              <input placeholder="Topic (optional)" value={newBooking.topic} onChange={e => setNewBooking(p => ({ ...p, topic: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={addBooking} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#34D399', border: 'none', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Book</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
