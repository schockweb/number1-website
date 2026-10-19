"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

// Super admin sees everything; client manager sees only client-facing pages
const SUPER_ADMIN = "schockweb@gmail.com";

// ─── SVG Icon Components ─────────────────────────────────────────────────────

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  home: (
    <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
  ),
  website: (
    <Icon d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  ),
  reports: (
    <Icon d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  ),
  ai: (
    <Icon d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  ),
  clients: (
    <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  ),
  leads: (
    <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  ),
  calendar: (
    <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  ),
  build: (
    <Icon d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  ),
  scanner: (
    <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  ),
  billing: (
    <Icon d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  ),
  link: (
    <Icon d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  ),
  settings: (
    <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  ),
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: ICONS.home,
  "Website Building": ICONS.website,
  "Build Reports": ICONS.reports,
  "AI Services": ICONS.ai,
  Clients: ICONS.clients,
  Leads: ICONS.leads,
  Calendar: ICONS.calendar,
  "Build Requests": ICONS.build,
  "Business Scanner": ICONS.scanner,
  Subscriptions: ICONS.billing,
  Integrations: ICONS.link,
  Settings: ICONS.settings,
};

// ─── Navigation Config ───────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  superOnly?: boolean;
}

interface NavSection {
  section: string;
  items: NavItem[];
  superOnly?: boolean;
}

const NAV: NavSection[] = [
  {
    section: "Overview",
    items: [
      { label: "Home", href: "/admin" },
      {
        label: "Website Building",
        href: "/admin/website-building",
        superOnly: true,
      },
      {
        label: "Build Reports",
        href: "/admin/build-reports",
        superOnly: true,
      },
      { label: "AI Services", href: "/admin/ai-services", superOnly: true },
    ],
  },
  {
    section: "Management",
    items: [
      { label: "Clients", href: "/admin/clients" },
      { label: "Leads", href: "/admin/leads" },
      { label: "Calendar", href: "/admin/calendar" },
      { label: "Build Requests", href: "/admin/build-requests" },
      { label: "Business Scanner", href: "/admin/business-scanner" },
      {
        label: "Subscriptions",
        href: "/admin/subscriptions",
        superOnly: true,
      },
      {
        label: "Integrations",
        href: "/admin/integrations",
        superOnly: true,
      },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Settings", href: "/admin/settings" },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSuperAdmin = session?.user?.email === SUPER_ADMIN;
  const roleName = isSuperAdmin ? "Executive Admin" : "Client Manager";

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "AD";

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const toggleSidebar = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const filteredNav = NAV.filter(
    (group) => !group.superOnly || isSuperAdmin
  )
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.superOnly || isSuperAdmin),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* ── Mobile Menu Button ── */}
      <button
        className="admin-mobile-toggle"
        onClick={toggleSidebar}
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileOpen}
        aria-controls="admin-sidebar"
      >
        <svg
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden="true"
        >
          {mobileOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* ── Mobile Overlay ── */}
      <div
        className={`admin-mobile-overlay${mobileOpen ? " overlay-visible" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <aside
        className={`admin-sidebar${mobileOpen ? " sidebar-open" : ""}`}
        id="admin-sidebar"
        role="navigation"
        aria-label="Admin navigation"
      >
        {/* ── Logo ── */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <div className="admin-sidebar-logo-icon">N1</div>
            <div>
              <div className="admin-sidebar-logo-text">
                Number
                <span style={{ opacity: 0.35, fontWeight: 400 }}>1</span>
              </div>
            </div>
            <span className="admin-sidebar-logo-badge">
              {isSuperAdmin ? "Admin" : "Manager"}
            </span>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="admin-sidebar-nav" id="admin-sidebar-navigation">
          {filteredNav.map((group) => (
            <div key={group.section} role="group" aria-label={group.section}>
              <div className="admin-nav-section-label" aria-hidden="true">
                {group.section}
              </div>
              {group.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-nav-item${isActive ? " active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="admin-nav-item-icon" aria-hidden="true">
                      {ICON_MAP[item.label] || ICONS.home}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── User Footer ── */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="admin-sidebar-user-info">
              <div className="admin-sidebar-user-name">
                {session?.user?.name ?? "Admin"}
              </div>
              <div className="admin-sidebar-user-role">{roleName}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            aria-label="Sign out of admin dashboard"
            style={{
              marginTop: 10,
              width: "100%",
              background: "none",
              border: "1px solid rgba(196,139,154,0.12)",
              borderRadius: 8,
              padding: "7px 0",
              fontSize: 11,
              fontWeight: 500,
              color: "var(--adm-text-tertiary)",
              cursor: "pointer",
              transition: "all 0.2s",
              letterSpacing: "0.02em",
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
