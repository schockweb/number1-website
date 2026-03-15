"use client";

// ─── Sample Projects ─────────────────────────────────────────────────────────

const PROJECTS = [
  { name: "E-Commerce Redesign", status: "In Progress", date: "Mar 2026", type: "Full Build" },
  { name: "Brand Identity Site", status: "Completed", date: "Feb 2026", type: "Makeover" },
  { name: "Corporate Portfolio", status: "Planning", date: "Apr 2026", type: "Full Build" },
];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://number1.studio';

export default function WebsiteBuildingPage() {
  return (
    <>
      {/* Main Content */}
      <>
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <h1>Website Building</h1>
            <p>Design, build, and launch your digital presence</p>
          </div>
          <div className="top-bar-right">
            <a
              href={`${SITE_URL}/account`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Open Client Portal →
            </a>
          </div>
        </div>

        {/* Service Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 32,
          }}
        >
          {/* Project Discovery */}
          <a
            href={`${SITE_URL}/account`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <div
              className="intro-card"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "28px 24px",
                cursor: "pointer",
                transition: "all 0.3s",
                height: "100%",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(249,115,22,0.1)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 22,
                  marginBottom: 16,
                  border: "1px solid rgba(249,115,22,0.2)",
                }}
              >
                💡
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Project Discovery
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                Start with a guided questionnaire to define your vision, audience,
                and core objectives.
              </p>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#f97316",
                }}
              >
                Begin Discovery →
              </span>
            </div>
          </a>

          {/* Design Canvas */}
          <a
            href={`${SITE_URL}/canvas`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <div
              className="intro-card"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "28px 24px",
                cursor: "pointer",
                transition: "all 0.3s",
                height: "100%",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(99,102,241,0.1)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 22,
                  marginBottom: 16,
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                🎨
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Design Canvas
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                Explore color, layout, and typography with an interactive visual
                playground for strategic design.
              </p>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6366f1",
                }}
              >
                Open Canvas →
              </span>
            </div>
          </a>

          {/* Design Playground */}
          <a
            href={`${SITE_URL}/account`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <div
              className="intro-card"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "28px 24px",
                cursor: "pointer",
                transition: "all 0.3s",
                height: "100%",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(236,72,153,0.1)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 22,
                  marginBottom: 16,
                  border: "1px solid rgba(236,72,153,0.2)",
                }}
              >
                ✨
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Design Playground
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                Generate AI-powered images and design assets for your website — 
                mockups, logos, and visual content.
              </p>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#ec4899",
                }}
              >
                Try Playground →
              </span>
            </div>
          </a>
        </div>

        {/* Recent Projects */}
        <div className="section-header">
          <div>
            <div className="section-title">Recent Projects</div>
            <div className="section-subtitle">
              Track your website builds and their progress
            </div>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
            marginBottom: 32,
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 0.8fr 0.8fr 0.8fr",
              padding: "12px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            <span>Project</span>
            <span>Type</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          {PROJECTS.map((project) => (
            <div
              key={project.name}
              className="table-row-hover"
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 0.8fr 0.8fr 0.8fr",
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                alignItems: "center",
                fontSize: 13,
                transition: "background 0.15s",
              }}
            >
              <div style={{ fontWeight: 600, color: "#fff" }}>
                {project.name}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)" }}>
                {project.type}
              </div>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color:
                      project.status === "Completed"
                        ? "#4ade80"
                        : project.status === "In Progress"
                        ? "#fbbf24"
                        : "#60a5fa",
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background:
                        project.status === "Completed"
                          ? "#4ade80"
                          : project.status === "In Progress"
                          ? "#fbbf24"
                          : "#60a5fa",
                    }}
                  />
                  {project.status}
                </span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                {project.date}
              </div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div
          style={{
            padding: "16px 24px",
            borderRadius: 14,
            background: "rgba(99,102,241,0.04)",
            border: "1px solid rgba(99,102,241,0.12)",
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 18 }}>💡</span>
          <span>
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>
              Tip:
            </strong>{" "}
            Start with the Project Discovery questionnaire to articulate your
            vision. This feeds directly into the design canvas and helps your
            team deliver faster.
          </span>
        </div>
      </>
    </>
  );
}
