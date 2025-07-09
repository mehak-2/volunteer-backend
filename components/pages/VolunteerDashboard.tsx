"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  MapPin,
  Clock,
  AlertTriangle,
  Settings,
  LogOut,
  CheckCircle,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { toggleEmergencyStatus } from "@/store/slices/volunteerSlice";
import { useRouter } from "next/navigation";
import {
  useGetDashboardQuery,
  VolunteerProfile,
  Alert,
  DashboardData,
} from "@/store/api/volunteer";
import { EditProfileModal } from "./EditProfileModal";
import { useUpdateProfileMutation } from "@/store/api/volunteer";

export default function VolunteerDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [emergencyAvailable, setEmergencyAvailable] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateProfile] = useUpdateProfileMutation();
  const [token, setToken] = useState<string | null>(null);

  console.log("Current user:", user);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token !== null && (!token || !user)) {
      router.push("/auth");
      return;
    }
  }, [token, user, router]);

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useGetDashboardQuery(user?.id || "", {
    skip: !user?.id || !token,
  });

  // Update the destructuring to handle the new structure
  const { volunteer, recentAlerts, stats } = dashboardData || {
    volunteer: undefined,
    recentAlerts: [],
    stats: {
      totalResponses: 0,
      responseTime: "",
      profileCompletion: 0,
    },
  };

  // Add error logging
  useEffect(() => {
    if (error) {
      console.error("Dashboard query error:", error);
    }
  }, [error]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading dashboard</div>;
  }

  if (!volunteer) {
    return null;
  }

  // Update the helper functions to handle the exact data structure
  const getEmergencyStatus = (volunteer: any) => {
    return volunteer?.emergency?.isAvailable || false;
  };

  const getPersonalInfo = (volunteer: any) => {
    return {
      photo: volunteer?.personalInfo?.photo || "",
      fullname: volunteer?.personalInfo?.fullname || "User",
    };
  };

  const getSkillsInfo = (volunteer: any) => {
    return {
      skillsList: volunteer?.skills?.skillsList || [],
      availability: volunteer?.skills?.availability || [],
      certifications: volunteer?.skills?.certifications || {
        cprTrained: false,
        firstAidTrained: false,
      },
    };
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleEmergencyToggle = () => {
    setEmergencyAvailable(!emergencyAvailable);
    dispatch(toggleEmergencyStatus());
  };

  const handleProfileSave = async (data: Partial<VolunteerProfile>) => {
    try {
      await updateProfile({
        userId: user?.id || "",
        updateData: data,
      }).unwrap();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Update the contact info section to match the API structure
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-full p-2">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">VolunteerHub</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      getEmergencyStatus(volunteer)
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-sm font-medium">
                    {getEmergencyStatus(volunteer)
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>
                <Switch
                  checked={getEmergencyStatus(volunteer)}
                  onCheckedChange={handleEmergencyToggle}
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Status */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={getPersonalInfo(volunteer).photo} />
                  <AvatarFallback>
                    {getPersonalInfo(volunteer).fullname.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {getPersonalInfo(volunteer).fullname}
                </CardTitle>
                <div className="flex items-center justify-center gap-2">
                  <Badge
                    className={getStatusColor(volunteer?.status || "pending")}
                    variant="secondary"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {(volunteer?.status || "pending").charAt(0).toUpperCase() +
                      (volunteer?.status || "pending").slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{volunteer?.contactInfo?.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{volunteer?.contactInfo?.phone || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {volunteer?.contactInfo?.address ||
                        (volunteer?.contactInfo?.location?.lat &&
                        volunteer?.contactInfo?.location?.lng
                          ? `${volunteer.contactInfo.location.lat}, ${volunteer.contactInfo.location.lng}`
                          : "No location")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span>
                      Last active:{" "}
                      {volunteer?.emergency?.lastActive
                        ? new Date(
                            volunteer.emergency.lastActive
                          ).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      Profile Completion
                    </span>
                    <span className="text-sm text-gray-600">
                      {volunteer?.profileCompletion || 0}%
                    </span>
                  </div>
                  <Progress
                    value={volunteer?.profileCompletion || 0}
                    className="w-full"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Emergency Status Card */}
            <Card
              className={`border-2 ${
                getEmergencyStatus(volunteer)
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      getEmergencyStatus(volunteer)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  Emergency Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      Available for Emergency Calls
                    </span>
                    <Switch
                      checked={getEmergencyStatus(volunteer)}
                      onCheckedChange={handleEmergencyToggle}
                    />
                  </div>
                  {getEmergencyStatus(volunteer) &&
                    volunteer?.emergency?.responseTime && (
                      <div className="p-3 bg-green-100 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          You're currently available for emergency response.
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Average response time:{" "}
                          {volunteer.emergency.responseTime}
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.totalResponses || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Responses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.responseTime || "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activities & Alerts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills & Availability */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Skills & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {getSkillsInfo(volunteer).skillsList.map(
                      (skill: any, index: any) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </Badge>
                      )
                    )}
                    {getSkillsInfo(volunteer).skillsList.length === 0 && (
                      <span className="text-sm text-gray-500">
                        No skills added yet
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getSkillsInfo(volunteer).availability.map(
                      (time: any, index: any) => (
                        <div key={index} className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{time}</span>
                        </div>
                      )
                    )}
                    {getSkillsInfo(volunteer).availability.length === 0 && (
                      <span className="text-sm text-gray-500">
                        No availability set
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Emergency Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Recent Emergency Alerts
                </CardTitle>
                <CardDescription>
                  Your recent emergency response activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts?.map((alert: any) => (
                    <div
                      key={alert._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.type}</h4>
                          <Badge
                            className={getPriorityColor(alert.priority)}
                            variant="secondary"
                          >
                            {alert.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {alert.location.address}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.createdAt.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          alert.status === "completed" ? "default" : "secondary"
                        }
                        className={
                          alert.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {alert.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Training & Development */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Training & Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        Upcoming Training
                      </span>
                    </div>
                    <p className="text-blue-800">
                      {getSkillsInfo(volunteer).certifications.cprTrained
                        ? "CPR Training Completed"
                        : "CPR Training Required"}
                    </p>
                    <Button size="sm" className="mt-2">
                      Register Now
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex-col">
                      <CheckCircle className="h-6 w-6 mb-2 text-green-600" />
                      <span className="text-sm">View Certificates</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col">
                      <Calendar className="h-6 w-6 mb-2 text-blue-600" />
                      <span className="text-sm">Schedule Training</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleProfileSave}
        volunteer={volunteer}
      />
    </div>
  );
}
