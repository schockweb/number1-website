"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function generateTimeSlots(startHour: number, endHour: number, duration: number): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += duration) {
      if (h === endHour - 1 && m + duration > 60) break;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  // Add the final hour :00 slot
  slots.push(`${String(endHour).padStart(2, '0')}:00`);
  return slots;
}

export default function BookACallPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', company: '', topic: '' });
  const [step, setStep] = useState<'calendar' | 'confirm' | 'done'>('calendar');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [enabledDays, setEnabledDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [timeSlots, setTimeSlots] = useState<string[]>(generateTimeSlots(9, 17, 30));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const prevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentDate(prev);
      setSelectedDay(null);
      setSelectedTime(null);
    }
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
    setSelectedTime(null);
  };

  const isDayDisabled = (day: number) => {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay();
    // Disable days not in the enabledDays list
    if (!enabledDays.includes(dayOfWeek)) return true;
    // Disable past dates
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return true;
    return false;
  };

  // Load availability settings from admin config
  useEffect(() => {
    fetch('/api/admin/availability')
      .then(r => r.json())
      .then(data => {
        if (data.enabledDays) setEnabledDays(data.enabledDays);
        const start = data.startHour ?? 9;
        const end = data.endHour ?? 17;
        const dur = data.meetingDuration ?? 30;
        setTimeSlots(generateTimeSlots(start, end, dur));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDay) {
      const fetchTakenSlots = async () => {
        setLoadingSlots(true);
        try {
          const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
          const res = await fetch(`/api/book-call?date=${formattedDate}`);
          const data = await res.json();
          if (data.takenSlots) {
            setTakenSlots(data.takenSlots);
          }
        } catch (err) {
          console.error('Failed to fetch taken slots:', err);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchTakenSlots();
    }
  }, [selectedDay, month, year]);

  const selectedDateStr = selectedDay
    ? `${MONTHS[month]} ${selectedDay}, ${year}`
    : null;

  const googleCalendarUrl = useMemo(() => {
    if (!selectedDay || !selectedTime) return '';
    const [h, m] = selectedTime.split(':').map(Number);
    
    // Convert CAT (UTC+2) to UTC for Google Calendar
    // We create a Date object in the browser (local), then use getUTC methods
    const date = new Date(year, month, selectedDay, h, m);
    // Since we explicitly defined the slots as CAT, but the browser local might be different,
    // let's just do the manual math to be safe: CAT 09:00 = UTC 07:00
    const utcHours = h - 2;
    const utcDate = new Date(year, month, selectedDay, utcHours, m);
    
    const format = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    };

    const startTime = format(utcDate);
    const endTimeObj = new Date(utcDate.getTime() + 30 * 60 * 1000);
    const endTime = format(endTimeObj);
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Number1 Sales Consultation')}&dates=${startTime}/${endTime}&details=${encodeURIComponent('Sales consultation with the Number1 team. A meeting link will be shared before the call. (Timezone: CAT/UTC+2)')}&location=${encodeURIComponent('Video Call (link will be sent via email)')}`;
  }, [selectedDay, selectedTime, year, month]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please enter your name and email.');
      return;
    }
    if (!selectedDay || !selectedTime) {
      setError('Please select a date and time.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const dateTime = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}T${selectedTime}:00+02:00`;
      const res = await fetch('/api/book-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          topic: form.topic || 'Sales consultation',
          date: dateTime,
        }),
      });
      if (res.ok) {
        setStep('done');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: '14px 18px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07070A', color: '#fff', overflowX: 'hidden', position: 'relative' }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '50rem', height: '50rem', background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 60%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '10%', width: '40rem', height: '40rem', background: 'radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 60%)', borderRadius: '50%' }} />
      </div>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 3rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(7,7,10,0.9)', backdropFilter: 'blur(16px)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#fff', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.04em', fontFamily: 'var(--font-syne, sans-serif)', cursor: 'pointer' }}>
          Number<span style={{ opacity: 0.35 }}>1</span>.Studio
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/employee" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}>← Employee</Link>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}>Home</Link>
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 10, maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 20,
            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
            fontSize: 11, fontWeight: 700, color: '#34D399',
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16,
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Book a Call
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12,
            fontFamily: 'var(--font-syne, sans-serif)',
          }}>
            Let&apos;s talk about your{' '}
            <span style={{
              background: 'linear-gradient(120deg, #34D399, #60A5FA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              business
            </span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Pick a time that works for you. We&apos;ll connect for a 30-minute consultation.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'done' ? (
            /* ── Success ── */
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                maxWidth: 520, margin: '0 auto', textAlign: 'center',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24, padding: '48px 32px',
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '2px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✓</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, fontFamily: 'var(--font-syne, sans-serif)' }}>You&apos;re Booked!</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{selectedDateStr}</strong> at <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{selectedTime} CAT</strong>
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 24, lineHeight: 1.6 }}>
                We&apos;ll send you a confirmation email with a meeting link. Looking forward to it!
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 14,
                  background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                  color: '#34D399', fontSize: 13, fontWeight: 700,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 3h-1V1.5a.5.5 0 00-1 0V3h-11V1.5a.5.5 0 00-1 0V3h-1A2.5 2.5 0 002 5.5v14A2.5 2.5 0 004.5 22h15a2.5 2.5 0 002.5-2.5v-14A2.5 2.5 0 0019.5 3zM20 19.5a.5.5 0 01-.5.5h-15a.5.5 0 01-.5-.5V9h16v10.5z"/></svg>
                  Add to Google Calendar
                </a>
                <Link href="/employee" style={{
                  padding: '12px 24px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600,
                  textDecoration: 'none',
                }}>
                  ← Back to Employee
                </Link>
              </div>
            </motion.div>

          ) : step === 'confirm' ? (
            /* ── Confirm / Details ── */
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              style={{ maxWidth: 520, margin: '0 auto' }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24, overflow: 'hidden',
              }}>
                {/* Selected slot banner */}
                <div style={{
                  padding: '20px 28px',
                  background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(96,165,250,0.06))',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontWeight: 600 }}>Your meeting</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{selectedDateStr} · {selectedTime} CAT</div>
                  </div>
                  <button onClick={() => setStep('calendar')} style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '6px 14px', color: 'rgba(255,255,255,0.5)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>Change</button>
                </div>

                <div style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Your details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <input placeholder="Your name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                      <input placeholder="Company" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                    </div>
                    <input type="email" placeholder="Email address *" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
                    <input placeholder="What would you like to discuss?" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} style={inputStyle} />
                  </div>

                  {error && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 12 }}>{error}</div>}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, padding: '12px 16px', borderRadius: 14, background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.1)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l-3 3m0 0l-3-3m3 3V4m6 6a9 9 0 11-6-3.35" /></svg>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>A meeting link will be sent to your email before the call.</span>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      width: '100%', marginTop: 20, padding: 16, borderRadius: 16,
                      background: 'linear-gradient(135deg, #34D399, #60A5FA)',
                      border: 'none', color: '#000', fontSize: 15, fontWeight: 800,
                      letterSpacing: '0.02em', cursor: submitting ? 'default' : 'pointer',
                      opacity: submitting ? 0.6 : 1, transition: 'all 0.2s',
                    }}
                  >
                    {submitting ? 'Booking…' : 'Confirm Booking →'}
                  </button>

                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 12 }}>
                    Video Call · CAT (UTC+2)
                  </p>
                </div>
              </div>
            </motion.div>

          ) : (
            /* ── Calendar + Time Slots ── */
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={selectedDay ? 'bac-grid bac-grid-open' : 'bac-grid'}
            >
              {/* Calendar */}
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 24, padding: 28,
              }}>
                {/* Month nav */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <button onClick={prevMonth} style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>‹</button>
                  <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{MONTHS[month]} {year}</h2>
                  <button onClick={nextMonth} style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>›</button>
                </div>

                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                  {DAYS.map(d => (
                    <div key={d} style={{
                      textAlign: 'center', fontSize: 11, fontWeight: 600,
                      color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                      letterSpacing: '0.08em', padding: '6px 0',
                    }}>{d}</div>
                  ))}
                </div>

                {/* Day grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const disabled = isDayDisabled(day);
                    const isToday = isCurrentMonth && today.getDate() === day;
                    const isSelected = selectedDay === day;
                    return (
                      <button
                        key={day}
                        onClick={() => { if (!disabled) { setSelectedDay(day); setSelectedTime(null); } }}
                        disabled={disabled}
                        style={{
                          aspectRatio: '1', borderRadius: 14, cursor: disabled ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: isToday || isSelected ? 700 : 400,
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(96,165,250,0.15))'
                            : isToday ? 'rgba(255,255,255,0.06)' : 'transparent',
                          border: isSelected
                            ? '2px solid rgba(52,211,153,0.4)'
                            : isToday ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.04)',
                          color: disabled
                            ? 'rgba(255,255,255,0.12)'
                            : isSelected ? '#34D399' : isToday ? '#fff' : 'rgba(255,255,255,0.55)',
                          transition: 'all 0.15s',
                          position: 'relative',
                        }}
                      >
                        {day}
                        {isToday && !isSelected && (
                          <div style={{ position: 'absolute', bottom: 6, width: 4, height: 4, borderRadius: '50%', background: '#34D399' }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 20 }}>
                  {[
                    { color: '#34D399', label: 'Available' },
                    { color: 'rgba(255,255,255,0.12)', label: 'Unavailable' },
                  ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Time slots panel */}
              <AnimatePresence>
                {selectedDay && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 24, padding: 24, alignSelf: 'start',
                    }}
                  >
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{selectedDateStr}</h3>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
                      {loadingSlots ? 'Checking availability...' : 'Pick a time slot'} · <span style={{ color: 'rgba(52,211,153,0.6)' }}>CAT (UTC+2)</span>
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {timeSlots.map((time: string) => {
                        const isActive = selectedTime === time;
                        const isTaken = takenSlots.includes(time);
                        return (
                          <button
                            key={time}
                            onClick={() => { if (!isTaken) setSelectedTime(time); }}
                            disabled={isTaken}
                            style={{
                              padding: '12px 0', borderRadius: 12, 
                              cursor: isTaken ? 'not-allowed' : 'pointer',
                              fontSize: 13, fontWeight: isActive ? 700 : 500,
                              background: isActive 
                                ? 'rgba(52,211,153,0.15)' 
                                : isTaken ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isActive 
                                ? 'rgba(52,211,153,0.35)' 
                                : isTaken ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)'}`,
                              color: isActive 
                                ? '#34D399' 
                                : isTaken ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                              transition: 'all 0.15s',
                              position: 'relative',
                            }}
                          >
                            {time}
                            {isTaken && <span style={{ fontSize: 9, display: 'block', opacity: 0.5 }}>Booked</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Continue button */}
                    <button
                      onClick={() => { if (selectedTime) setStep('confirm'); }}
                      disabled={!selectedTime}
                      style={{
                        width: '100%', marginTop: 16, padding: 14, borderRadius: 14,
                        background: selectedTime
                          ? 'linear-gradient(135deg, #34D399, #60A5FA)'
                          : 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: selectedTime ? '#000' : 'rgba(255,255,255,0.2)',
                        fontSize: 14, fontWeight: 800,
                        cursor: selectedTime ? 'pointer' : 'default',
                        opacity: selectedTime ? 1 : 0.5,
                        transition: 'all 0.2s',
                      }}
                    >
                      {selectedTime ? `Continue with ${selectedTime} →` : 'Select a time'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>


      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        marginTop: 80, padding: '24px 0',
        textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.15)',
        fontFamily: 'monospace', letterSpacing: '0.1em',
      }}>
        © {new Date().getFullYear()} NUMBER1 · ALL RIGHTS RESERVED
      </footer>

      {/* Responsive CSS for calendar grid */}
      <style>{`
        .bac-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          max-width: 560px;
          margin: 0 auto;
          transition: max-width 0.3s ease;
        }
        .bac-grid-open {
          grid-template-columns: 1fr 340px;
          max-width: 900px;
        }
        @media (max-width: 768px) {
          .bac-grid,
          .bac-grid-open {
            grid-template-columns: 1fr !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
