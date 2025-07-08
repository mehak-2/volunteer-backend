"use client";

import AdminDashboard from "@/components/pages/AdminDashboard";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardPage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/auth");
    }
  }, [isAuthenticated, user, router]);

  return <AdminDashboard />;
}
