"use client";

import VolunteerDashboard from "@/components/pages/VolunteerDashboard";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VolunteerDashboardPage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "volunteer") {
      router.replace("/auth");
    }
  }, [isAuthenticated, user, router]);

  return <VolunteerDashboard />;
}
