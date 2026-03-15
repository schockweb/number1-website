// AI Design Service - Mock Gemini 3 API Integration
// Replace with real API calls when ready

export const LOW_RES_COST = 0.02;
export const UPSCALE_COST = 0.15;

export interface GeneratedDesign {
    id: string;
    prompt: string;
    html: string;
    resolution: '512px' | '4k';
    cost: number;
    timestamp: number;
}

export interface SessionTelemetry {
    totalCost: number;
    generationCount: number;
    upscaleCount: number;
    log: { action: string; cost: number; prompt: string; time: number }[];
}

// Pre-built design templates for mock responses
const MOCK_DESIGNS: Record<string, string> = {
    pricing: `
<div style="min-height:100%;background:linear-gradient(135deg,#0a0a1a,#1a0a2e);display:flex;align-items:center;justify-content:center;padding:40px;font-family:'Segoe UI',system-ui,sans-serif">
  <div style="display:flex;gap:24px;flex-wrap:wrap;justify-content:center">
    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:32px;width:260px;backdrop-filter:blur(10px)">
      <div style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Starter</div>
      <div style="color:#fff;font-size:48px;font-weight:800">$9<span style="font-size:16px;color:#666">/mo</span></div>
      <div style="border-top:1px solid rgba(255,255,255,0.1);margin:20px 0;padding-top:20px">
        <div style="color:#aaa;font-size:14px;margin-bottom:12px">✦ 5 Projects</div>
        <div style="color:#aaa;font-size:14px;margin-bottom:12px">✦ 1GB Storage</div>
        <div style="color:#aaa;font-size:14px">✦ Email Support</div>
      </div>
      <button style="width:100%;padding:12px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#fff;border-radius:12px;cursor:pointer;font-size:14px;margin-top:16px">Get Started</button>
    </div>
    <div style="background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.2));border:1px solid rgba(139,92,246,0.4);border-radius:20px;padding:32px;width:260px;transform:scale(1.05);box-shadow:0 0 40px rgba(139,92,246,0.15)">
      <div style="color:#a78bfa;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Pro ★</div>
      <div style="color:#fff;font-size:48px;font-weight:800">$29<span style="font-size:16px;color:#888">/mo</span></div>
      <div style="border-top:1px solid rgba(139,92,246,0.3);margin:20px 0;padding-top:20px">
        <div style="color:#c4b5fd;font-size:14px;margin-bottom:12px">✦ Unlimited Projects</div>
        <div style="color:#c4b5fd;font-size:14px;margin-bottom:12px">✦ 50GB Storage</div>
        <div style="color:#c4b5fd;font-size:14px">✦ Priority Support</div>
      </div>
      <button style="width:100%;padding:12px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;border:none;border-radius:12px;cursor:pointer;font-size:14px;font-weight:600;margin-top:16px">Upgrade Now</button>
    </div>
    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:32px;width:260px;backdrop-filter:blur(10px)">
      <div style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Enterprise</div>
      <div style="color:#fff;font-size:48px;font-weight:800">$99<span style="font-size:16px;color:#666">/mo</span></div>
      <div style="border-top:1px solid rgba(255,255,255,0.1);margin:20px 0;padding-top:20px">
        <div style="color:#aaa;font-size:14px;margin-bottom:12px">✦ Custom Solutions</div>
        <div style="color:#aaa;font-size:14px;margin-bottom:12px">✦ Unlimited Storage</div>
        <div style="color:#aaa;font-size:14px">✦ Dedicated Manager</div>
      </div>
      <button style="width:100%;padding:12px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#fff;border-radius:12px;cursor:pointer;font-size:14px;margin-top:16px">Contact Sales</button>
    </div>
  </div>
</div>`,
    dashboard: `
<div style="min-height:100%;background:#0f172a;padding:32px;font-family:'Segoe UI',system-ui,sans-serif;color:#e2e8f0">
  <div style="max-width:900px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px">
      <h1 style="font-size:24px;font-weight:700;background:linear-gradient(135deg,#38bdf8,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Dashboard</h1>
      <div style="display:flex;gap:8px">
        <span style="background:rgba(56,189,248,0.1);color:#38bdf8;padding:6px 14px;border-radius:20px;font-size:12px;border:1px solid rgba(56,189,248,0.2)">Live</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px">
        <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Revenue</div>
        <div style="font-size:32px;font-weight:800;color:#34d399">$48.2K</div>
        <div style="color:#34d399;font-size:12px;margin-top:4px">↑ 12.5%</div>
      </div>
      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px">
        <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Users</div>
        <div style="font-size:32px;font-weight:800;color:#e2e8f0">2,847</div>
        <div style="color:#38bdf8;font-size:12px;margin-top:4px">↑ 8.1%</div>
      </div>
      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px">
        <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Sessions</div>
        <div style="font-size:32px;font-weight:800;color:#e2e8f0">14.3K</div>
        <div style="color:#f472b6;font-size:12px;margin-top:4px">↓ 2.3%</div>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px">
      <div style="font-size:14px;font-weight:600;margin-bottom:16px;color:#94a3b8">Recent Activity</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(255,255,255,0.03);border-radius:10px"><span style="color:#cbd5e1">New signup — alex@demo.io</span><span style="color:#64748b;font-size:12px">2m ago</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(255,255,255,0.03);border-radius:10px"><span style="color:#cbd5e1">Purchase — Pro Plan</span><span style="color:#64748b;font-size:12px">15m ago</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(255,255,255,0.03);border-radius:10px"><span style="color:#cbd5e1">Deploy — v2.4.1 live</span><span style="color:#64748b;font-size:12px">1h ago</span></div>
      </div>
    </div>
  </div>
</div>`,
    hero: `
<div style="min-height:100%;background:linear-gradient(to bottom,#000,#0a0a0a);display:flex;align-items:center;justify-content:center;padding:40px;font-family:'Segoe UI',system-ui,sans-serif;text-align:center">
  <div style="max-width:700px">
    <div style="display:inline-block;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#a5b4fc;padding:6px 16px;border-radius:20px;font-size:12px;letter-spacing:1px;text-transform:uppercase;margin-bottom:24px">Now in Beta</div>
    <h1 style="color:#fff;font-size:56px;font-weight:900;line-height:1.1;margin:0 0 20px;letter-spacing:-2px">Build faster.<br><span style="background:linear-gradient(135deg,#6366f1,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Ship smarter.</span></h1>
    <p style="color:#71717a;font-size:18px;line-height:1.6;margin-bottom:36px;max-width:500px;margin-left:auto;margin-right:auto">The AI-powered platform that turns your ideas into production-ready interfaces in seconds, not weeks.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <button style="padding:14px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 0 30px rgba(99,102,241,0.3)">Start Building</button>
      <button style="padding:14px 32px;background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.15);border-radius:12px;font-size:15px;cursor:pointer">Watch Demo →</button>
    </div>
  </div>
</div>`,
    card: `
<div style="min-height:100%;background:#111;display:flex;align-items:center;justify-content:center;padding:40px;font-family:'Segoe UI',system-ui,sans-serif">
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;max-width:600px">
    <div style="background:linear-gradient(145deg,#1a1a2e,#16213e);border-radius:20px;padding:28px;border:1px solid rgba(255,255,255,0.06)">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#f59e0b,#ef4444);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px">⚡</div>
      <h3 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 8px">Lightning Fast</h3>
      <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0">Deploy globally in under 200ms with our edge network.</p>
    </div>
    <div style="background:linear-gradient(145deg,#1a1a2e,#16213e);border-radius:20px;padding:28px;border:1px solid rgba(255,255,255,0.06)">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#06b6d4,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px">🔒</div>
      <h3 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 8px">Secure by Default</h3>
      <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0">End-to-end encryption with zero-trust architecture.</p>
    </div>
    <div style="background:linear-gradient(145deg,#1a1a2e,#16213e);border-radius:20px;padding:28px;border:1px solid rgba(255,255,255,0.06)">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#ec4899);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px">🎨</div>
      <h3 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 8px">Pixel Perfect</h3>
      <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0">AI-driven design that matches your brand identity.</p>
    </div>
    <div style="background:linear-gradient(145deg,#1a1a2e,#16213e);border-radius:20px;padding:28px;border:1px solid rgba(255,255,255,0.06)">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#10b981,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px">📊</div>
      <h3 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 8px">Analytics Built-In</h3>
      <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0">Real-time insights into user behaviour and conversions.</p>
    </div>
  </div>
</div>`,
    generic: `
<div style="min-height:100%;background:linear-gradient(135deg,#0c0c1d,#1e1b4b);display:flex;align-items:center;justify-content:center;padding:40px;font-family:'Segoe UI',system-ui,sans-serif;text-align:center">
  <div>
    <div style="width:80px;height:80px;border-radius:24px;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:36px;box-shadow:0 0 40px rgba(99,102,241,0.3)">✨</div>
    <h1 style="color:#fff;font-size:42px;font-weight:900;margin:0 0 12px;letter-spacing:-1px">Design Generated</h1>
    <p style="color:#a5b4fc;font-size:16px;margin:0 0 32px;max-width:400px">Your AI-generated layout is ready. Edit the prompt to refine the design further.</p>
    <div style="display:flex;gap:12px;justify-content:center">
      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px 24px;color:#94a3b8;font-size:13px">Prompt-based • Low-res preview</div>
    </div>
  </div>
</div>`,
};

function selectMockDesign(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('pricing') || lower.includes('plan') || lower.includes('subscription')) return MOCK_DESIGNS.pricing;
    if (lower.includes('dashboard') || lower.includes('analytics') || lower.includes('admin')) return MOCK_DESIGNS.dashboard;
    if (lower.includes('hero') || lower.includes('landing') || lower.includes('homepage')) return MOCK_DESIGNS.hero;
    if (lower.includes('card') || lower.includes('feature') || lower.includes('grid')) return MOCK_DESIGNS.card;
    return MOCK_DESIGNS.generic;
}

let sessionTelemetry: SessionTelemetry = {
    totalCost: 0,
    generationCount: 0,
    upscaleCount: 0,
    log: [],
};

export function getSessionTelemetry(): SessionTelemetry {
    return { ...sessionTelemetry, log: [...sessionTelemetry.log] };
}

export function resetSessionTelemetry(): void {
    sessionTelemetry = { totalCost: 0, generationCount: 0, upscaleCount: 0, log: [] };
}

export async function generateDesign(prompt: string, resolution: '512px' | '4k' = '512px'): Promise<GeneratedDesign> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const cost = resolution === '4k' ? UPSCALE_COST : LOW_RES_COST;
    const html = selectMockDesign(prompt);

    const design: GeneratedDesign = {
        id: `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        prompt,
        html,
        resolution,
        cost,
        timestamp: Date.now(),
    };

    // Update telemetry
    sessionTelemetry.totalCost += cost;
    if (resolution === '4k') {
        sessionTelemetry.upscaleCount++;
    } else {
        sessionTelemetry.generationCount++;
    }
    sessionTelemetry.log.push({
        action: resolution === '4k' ? 'Upscale 4K' : 'Generate',
        cost,
        prompt,
        time: Date.now(),
    });

    return design;
}
