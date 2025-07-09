"use client";

import React from "react";
import { useAppSelector } from "@/store/hooks";
import LandingPage from "@/components/pages/LandingPage";
import VolunteerDashboard from "@/components/pages/VolunteerDashboard";
import AdminDashboard from "@/components/pages/AdminDashboard";

const Page = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  return <VolunteerDashboard />;
};

export default Page;
