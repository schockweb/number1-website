"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FocusArea {
  area: string;
  score: number;
  priority: string;
  current_state: string;
  issue: string;
  recommendation: string;
  impact: string;
}

interface ScanResult {
  business_name: string;
  industry: string;
  overall_score: number;
  executive_summary: string;
  focus_areas: FocusArea[];
  quick_wins: string[];
  competitive_edge: string;
  growth_roadmap: { phase: string; action: string }[];
}

const PRIORITY_COLORS: Record<string, { color: string; bg: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  high:     { color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  medium:   { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  low:      { color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
};

function getScoreColor(score: number) {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#FBBF24';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

export default function BusinessScannerPage() {
  const [mode, setMode] = useState<'url' | 'search'>('url');
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [searchResults, setSearchResults] = useState<{ name: string; url: string; description: string; location: string; industry: string }[]>([]);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [email, setEmail] = useState<{ subject: string; body: string } | null>(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [savedReports, setSavedReports] = useState<{ id: string; url: string; name: string; score: number; date: string; data: ScanResult }[]>([]);
  const [reportSaved, setReportSaved] = useState(false);

  // Load saved reports from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('n1-saved-reports');
      if (saved) setSavedReports(JSON.parse(saved));
    } catch {}
  }, []);

  const persistReports = useCallback((reports: typeof savedReports) => {
    setSavedReports(reports);
    localStorage.setItem('n1-saved-reports', JSON.stringify(reports));
  }, []);

  const saveReport = () => {
    if (!result) return;
    const report = {
      id: Date.now().toString(),
      url: url,
      name: result.business_name,
      score: result.overall_score,
      date: new Date().toISOString(),
      data: result,
    };
    persistReports([report, ...savedReports]);
    setReportSaved(true);
    setTimeout(() => setReportSaved(false), 2000);
  };

  const deleteReport = (id: string) => {
    persistReports(savedReports.filter(r => r.id !== id));
  };

  const loadReport = (report: typeof savedReports[0]) => {
    setResult(report.data);
    setUrl(report.url);
    setEmail(null);
    setSearchResults([]);
  };

  const handleScan = async (scanUrl?: string) => {
    const target = scanUrl || url.trim();
    if (!target) return;
    setError('');
    setScanning(true);
    setResult(null);
    setSearchResults([]);

    try {
      const res = await fetch('/api/admin/business-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Scan failed');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setScanning(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setError('');
    setSearching(true);
    setSearchResults([]);
    setResult(null);

    try {
      const res = await fetch('/api/admin/business-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Search failed');
      }

      const data = await res.json();
      setSearchResults(data.results || []);
      if ((data.results || []).length === 0) {
        setError('No businesses found. Try a different search term.');
      }
    } catch (err: any) {
      setError(err.message || 'Search failed.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 14px', borderRadius: 20,
          background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
          fontSize: 10, fontWeight: 700, color: '#F97316',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14,
        }}>
          ⚡ AI Business Scanner
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>
          Business Intelligence Scanner
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', maxWidth: 550 }}>
          Scan a URL or search for a business by name. AI will analyze the site and generate a comprehensive report.
        </p>
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {[
          { key: 'url' as const, label: '🔗 Scan URL' },
          { key: 'search' as const, label: '🔍 Search Name' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setMode(tab.key); setError(''); }}
            style={{
              padding: '8px 20px', borderRadius: 10, border: 'none',
              background: mode === tab.key ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: mode === tab.key ? '#fff' : 'rgba(255,255,255,0.35)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 24,
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 8,
      }}>
        {mode === 'url' ? (
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !scanning) handleScan(); }}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              padding: '12px 16px', color: '#fff', fontSize: 15, outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        ) : (
          <input
            type="text"
            placeholder="Search a business name…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !searching) handleSearch(); }}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              padding: '12px 16px', color: '#fff', fontSize: 15, outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        )}
        <button
          onClick={() => mode === 'url' ? handleScan() : handleSearch()}
          disabled={mode === 'url' ? (scanning || !url.trim()) : (searching || !searchQuery.trim())}
          style={{
            padding: '12px 28px', borderRadius: 12, border: 'none',
            background: (scanning || searching) ? 'rgba(249,115,22,0.2)' : 'linear-gradient(135deg, #F97316, #FBBF24)',
            color: (scanning || searching) ? '#F97316' : '#000',
            fontSize: 13, fontWeight: 800, cursor: (scanning || searching) ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
        >
          {scanning ? (
            <>
              <div style={{ width: 14, height: 14, border: '2px solid rgba(249,115,22,0.3)', borderTop: '2px solid #F97316', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Scanning…
            </>
          ) : searching ? (
            <>
              <div style={{ width: 14, height: 14, border: '2px solid rgba(249,115,22,0.3)', borderTop: '2px solid #F97316', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Searching…
            </>
          ) : mode === 'url' ? 'Scan Business' : 'Search'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 12, marginBottom: 24,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#EF4444', fontSize: 13,
        }}>{error}</div>
      )}

      {/* Saved reports */}
      {savedReports.length > 0 && !result && !scanning && !searching && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>📁</span> Saved Reports ({savedReports.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {savedReports.map(r => (
              <div key={r.id} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `${getScoreColor(r.score)}12`, border: `1px solid ${getScoreColor(r.score)}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 900, color: getScoreColor(r.score),
                }}>{r.score}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => loadReport(r)} style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none',
                    background: 'rgba(129,140,248,0.1)', color: '#818CF8',
                    fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  }}>View</button>
                  <button onClick={() => deleteReport(r.id)} style={{
                    padding: '6px 10px', borderRadius: 8, border: 'none',
                    background: 'rgba(239,68,68,0.08)', color: '#EF4444',
                    fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {searchResults.length > 0 && !scanning && !result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 24 }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
            {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''} Found
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {searchResults.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: '#818CF8',
                }}>
                  {r.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
                    {r.industry && <span>📂 {r.industry}</span>}
                    {r.location && r.location !== 'Unknown' && <span>📍 {r.location}</span>}
                    <span style={{ color: 'rgba(129,140,248,0.5)' }}>🔗 {r.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setUrl(r.url); setMode('url'); handleScan(r.url); }}
                  style={{
                    padding: '8px 20px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #F97316, #FBBF24)',
                    color: '#000', fontSize: 12, fontWeight: 800,
                    cursor: 'pointer', flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                >
                  Scan →
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {(scanning || searching) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 0' }}
        >
          <div style={{ width: 48, height: 48, border: '3px solid rgba(249,115,22,0.15)', borderTop: '3px solid #F97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
            {scanning ? 'Analyzing business…' : 'Searching the internet…'}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            {scanning ? 'Taking screenshot → AI analysis → Generating report' : 'Looking up business information'}
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header card */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 28, marginBottom: 16,
              display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 20,
            }}>
              <div style={{ flex: 1, minWidth: 250 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{result.industry}</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10 }}>{result.business_name}</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{result.executive_summary}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 90, height: 90, borderRadius: '50%',
                    border: `3px solid ${getScoreColor(result.overall_score)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column',
                    background: `${getScoreColor(result.overall_score)}10`,
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: getScoreColor(result.overall_score), lineHeight: 1 }}>{result.overall_score}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>/ 100</div>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6, fontWeight: 600 }}>Overall Score</div>
                </div>
                <button
                  onClick={saveReport}
                  style={{
                    padding: '10px 18px', borderRadius: 12, border: 'none',
                    background: reportSaved ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)',
                    color: reportSaved ? '#34D399' : 'rgba(255,255,255,0.5)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.2s', minWidth: 60,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{reportSaved ? '✓' : '💾'}</span>
                  {reportSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* Competitive edge */}
            {result.competitive_edge && (
              <div style={{
                padding: '16px 20px', borderRadius: 14, marginBottom: 16,
                background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)',
                display: 'flex', alignItems: 'start', gap: 12,
              }}>
                <span style={{ fontSize: 18 }}>💪</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#34D399', marginBottom: 4 }}>COMPETITIVE STRENGTH</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{result.competitive_edge}</div>
                </div>
              </div>
            )}

            {/* Focus areas */}
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12, marginTop: 24 }}>Focus Areas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.focus_areas.map((area, i) => {
                const pc = PRIORITY_COLORS[area.priority] || PRIORITY_COLORS.medium;
                const isExpanded = expanded === i;
                return (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 16, overflow: 'hidden',
                    transition: 'all 0.2s',
                  }}>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : i)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                        padding: '16px 20px', background: 'none', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      {/* Score circle */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: `${getScoreColor(area.score)}12`,
                        border: `1px solid ${getScoreColor(area.score)}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 900, color: getScoreColor(area.score),
                      }}>
                        {area.score}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{area.area}</span>
                          <span style={{
                            fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                            background: pc.bg, color: pc.color, border: `1px solid ${pc.color}30`,
                            textTransform: 'uppercase', letterSpacing: '0.1em',
                          }}>{area.priority}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{area.issue}</div>
                      </div>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)" strokeWidth={2}
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 14 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Current State</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{area.current_state}</div>
                              </div>
                              <div style={{ background: 'rgba(249,115,22,0.04)', borderRadius: 12, padding: 14, border: '1px solid rgba(249,115,22,0.1)' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Recommendation</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{area.recommendation}</div>
                              </div>
                            </div>
                            <div style={{ marginTop: 12, background: 'rgba(52,211,153,0.04)', borderRadius: 12, padding: 14, border: '1px solid rgba(52,211,153,0.1)' }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Revenue Impact</div>
                              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{area.impact}</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Quick wins + Roadmap row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
              {/* Quick wins */}
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 20,
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>⚡</span> Quick Wins
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.quick_wins.map((win, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'start', gap: 10,
                      padding: '10px 12px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)',
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800, color: '#F97316',
                      }}>{i + 1}</div>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{win}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth roadmap */}
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 20,
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🗺️</span> Growth Roadmap
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {result.growth_roadmap.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: i === 0 ? '#F97316' : i === 1 ? '#FBBF24' : '#34D399',
                          border: `2px solid ${i === 0 ? 'rgba(249,115,22,0.3)' : i === 1 ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}`,
                        }} />
                        {i < result.growth_roadmap.length - 1 && (
                          <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{step.phase}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{step.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Lead Email */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: 24, marginTop: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: email ? 20 : 0 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>✉️</span> Lead Outreach Email
                  </h3>
                  {!email && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Generate a personalised sales email based on this report</p>}
                </div>
                <button
                  onClick={async () => {
                    setGeneratingEmail(true);
                    setEmailCopied(false);
                    try {
                      const res = await fetch('/api/admin/lead-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          businessName: result.business_name,
                          industry: result.industry,
                          summary: result.executive_summary,
                          focusAreas: result.focus_areas,
                          url: url,
                        }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setEmail(data);
                      }
                    } catch {} finally { setGeneratingEmail(false); }
                  }}
                  disabled={generatingEmail}
                  style={{
                    padding: '10px 22px', borderRadius: 12, border: 'none',
                    background: generatingEmail ? 'rgba(129,140,248,0.15)' : 'linear-gradient(135deg, #818CF8, #6366F1)',
                    color: generatingEmail ? '#818CF8' : '#fff',
                    fontSize: 12, fontWeight: 800, cursor: generatingEmail ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all 0.2s',
                  }}
                >
                  {generatingEmail ? (
                    <>
                      <div style={{ width: 12, height: 12, border: '2px solid rgba(129,140,248,0.3)', borderTop: '2px solid #818CF8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      Generating…
                    </>
                  ) : email ? '↻ Regenerate' : '✉️ Generate Lead Email'}
                </button>
              </div>

              <AnimatePresence>
                {email && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {/* Subject */}
                    <div style={{
                      background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)',
                      borderRadius: 14, padding: '14px 18px', marginBottom: 12,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Subject</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{email.subject}</div>
                    </div>

                    {/* Body */}
                    <div style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 14, padding: '18px 20px',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Email Body</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                        {email.body}
                      </div>
                    </div>

                    {/* Copy button */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => {
                          const fullEmail = `Subject: ${email.subject}\n\n${email.body}`;
                          navigator.clipboard.writeText(fullEmail);
                          setEmailCopied(true);
                          setTimeout(() => setEmailCopied(false), 2000);
                        }}
                        style={{
                          padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                          background: emailCopied ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${emailCopied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)'}`,
                          color: emailCopied ? '#34D399' : 'rgba(255,255,255,0.5)',
                          fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                        }}
                      >
                        {emailCopied ? '✓ Copied to clipboard' : '📋 Copy Full Email'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scan another */}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button
                onClick={() => { setResult(null); setUrl(''); setSearchQuery(''); setSearchResults([]); setEmail(null); }}
                style={{
                  padding: '10px 24px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ↻ Scan Another Business
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
