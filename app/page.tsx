"use client";

import { useAppSelector } from "@/store/hooks";
import LandingPage from "@/components/pages/LandingPage";
import VolunteerDashboard from "@/components/pages/VolunteerDashboard";
import AdminDashboard from "@/components/pages/AdminDashboard";

export default function Home() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  return <VolunteerDashboard />;
}
