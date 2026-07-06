import type { Metadata } from "next";
import AdminDashboardLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = {
  title: "Admin Dashboard — ProctorAI",
  description: "ProctorAI is a secure AI-powered online examination platform featuring intelligent proctoring, automated evaluation, and comprehensive exam management.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardLayout />;
}
