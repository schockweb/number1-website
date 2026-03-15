"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const NAV = [
  {
    section: "Overview",
    items: [
      { label: "Home",             icon: "◻", href: "/admin" },
      { label: "Website Building", icon: "◈", href: "/admin/website-building" },
      { label: "Build Reports",    icon: "✦", href: "/admin/build-reports" },
      { label: "AI Services",      icon: "⬡", href: "/admin/ai-services" },
    ],
  },
  {
    section: "Management",
    items: [
      { label: "Clients",        icon: "◉",  href: "/admin/clients" },
      { label: "Build Requests", icon: "◈",  href: "/admin/build-requests" },
      { label: "Subscriptions",  icon: "⬢",  href: "/admin/subscriptions" },
      { label: "Integrations",   icon: "⬡",  href: "/admin/integrations" },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Settings", icon: "⚙", href: "/admin/settings" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const initials = session?.user?.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "AD";

  return (
    <aside className="admin-sidebar" id="admin-sidebar">
      {/* Logo */}
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-icon">N1</div>
          <div>
            <div className="admin-sidebar-logo-text">Number1</div>
          </div>
          <span className="admin-sidebar-logo-badge">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="admin-sidebar-nav" id="admin-sidebar-navigation">
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="admin-nav-section-label">{group.section}</div>
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
                >
                  <span className="admin-nav-item-icon">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-avatar">{initials}</div>
          <div className="admin-sidebar-user-info">
            <div className="admin-sidebar-user-name">{session?.user?.name ?? "Admin"}</div>
            <div className="admin-sidebar-user-role">Executive Admin</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{ marginTop: 8, width: "100%", background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "6px 0", fontSize: 11, color: "rgba(255,255,255,0.25)", cursor: "pointer", transition: "all 0.15s" }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
