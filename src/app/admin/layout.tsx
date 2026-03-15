import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Number1 Admin",
  description: "Executive SaaS Dashboard",
};

const ADMIN_EMAIL = "schockweb@gmail.com";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || session.user?.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  return (
    <div className="admin-app-layout">
      <AdminSidebar />
      <main className="admin-main-content">{children}</main>
    </div>
  );
}
