"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { SidebarProvider } from "@/lib/sidebar-context";

export default function ExaminerDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token") || "";
    const role = localStorage.getItem("user_role") || "";

    if (!token) {
      router.push("/login");
      return;
    }

    if (role !== "examiner" && role !== "admin") {
      router.push("/login");
    }
  }, []);

  return (
    <SidebarProvider>
      <AdminLayout />
    </SidebarProvider>
  );
}
