"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { logout } from "@/store/slices/authSlice";
import {
  useGetDashboardStatsQuery,
  useGetVolunteersQuery,
  useUpdateVolunteerStatusMutation,
  useGetRecentActivitiesQuery,
  useSendEmergencyAlertMutation,
  useBulkApproveVolunteersMutation,
  useGenerateReportMutation,
  useGetOrganizationsQuery,
  useUpdateOrganizationStatusMutation,
} from "@/store/api/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  MapPin,
  Clock,
  Heart,
  AlertTriangle,
  TrendingUp,
  Activity,
  LogOut,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import {
  useGetActiveVolunteersQuery,
  useGetEmergencyAlertsQuery,
} from "@/store/api/emergency";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Volunteer {
  _id: string; // or number, check your backend model
  personalInfo: {
    fullname: string;
    age: number;
    gender: string;
    photo?: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    location?: {
      lat: number;
      lng: number;
    };
    contactPreference: string;
  };
  skills: {
    certifications: {
      cprTrained: boolean;
      firstAidTrained: boolean;
    };
    skillsList: string[];
    availability: string[];
  };
  documents: {
    idDocument?: string;
    termsAccepted: boolean;
    backgroundCheckConsent: boolean;
  };
  status: string;
  emergency?: {
    // Make emergency optional
    isAvailable: boolean;
    responseTime: string;
    totalResponses: number;
    lastActive: Date;
  };
  joinDate?: string;
  createdAt?: string;
}

interface Activity {
  id: number;
  description: string;
  volunteer: string;
  timestamp: string;
}

interface Organization {
  _id: string;
  name: string;
  email: string;
  description: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  status: "pending" | "approved" | "rejected" | "suspended";
  contact: {
    primaryContactName?: string;
    primaryContactEmail?: string;
    primaryContactPhone?: string;
  };
  createdAt: string;
}

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("volunteers");
  const [orgSearchTerm, setOrgSearchTerm] = useState("");
  const [orgStatusFilter, setOrgStatusFilter] = useState("all");

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  const { data: statsData, isSuccess: statsSuccess } =
    useGetDashboardStatsQuery();
  const { data: volunteersData, refetch } = useGetVolunteersQuery({
    status: statusFilter,
    search: searchTerm,
  });
  const { data: organizationsData, refetch: refetchOrganizations } =
    useGetOrganizationsQuery({
      status: orgStatusFilter,
      search: orgSearchTerm,
    });
  const [updateStatus] = useUpdateVolunteerStatusMutation();
  const [sendEmergencyAlert] = useSendEmergencyAlertMutation();
  const [bulkApproveVolunteers] = useBulkApproveVolunteersMutation();
  const [generateReport] = useGenerateReportMutation();
  const [updateOrgStatus] = useUpdateOrganizationStatusMutation();

  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    active: 0,
    responseTime: "0 min",
    todayResponses: 0,
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const { data: recentActivities = [] } = useGetRecentActivitiesQuery(10);
  const { data: activeVolunteers = [] } = useGetActiveVolunteersQuery();
  const { data: emergencyAlerts = [] } = useGetEmergencyAlertsQuery();

  useEffect(() => {
    if (statsSuccess && statsData?.success) {
      setStats(statsData.data);
    }
  }, [statsData, statsSuccess]);

  useEffect(() => {
    if (volunteersData?.success) {
      console.log(
        "Loaded volunteers:",
        JSON.stringify(volunteersData.data, null, 2)
      );
      setVolunteers(volunteersData.data as unknown as Volunteer[]);
    }
  }, [volunteersData]);

  useEffect(() => {
    if (organizationsData?.success) {
      setOrganizations(organizationsData.data);
    }
  }, [organizationsData]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleApprove = async (volunteerId: string) => {
    // or number based on your model
    try {
      const result = await updateStatus({
        volunteerId: volunteerId, // Use _id instead of id
        status: "approved",
      }).unwrap();

      if (result.success) {
        setVolunteers((prevVolunteers) =>
          prevVolunteers.map((volunteer) =>
            volunteer._id === volunteerId // Use _id here too
              ? ({
                  ...volunteer,
                  status: "approved" as const,
                } satisfies Volunteer)
              : volunteer
          )
        );
        if (statusFilter === "pending") {
          setStatusFilter("approved");
        }
        refetch();
      }
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const handleReject = async (volunteerId: string) => {
    try {
      const result = await updateStatus({
        volunteerId,
        status: "rejected",
      }).unwrap();

      if (result.success && result.data) {
        // Update volunteers with the returned data
        setVolunteers((prevVolunteers) =>
          prevVolunteers.map((volunteer) =>
            volunteer._id === volunteerId
              ? ({
                  ...volunteer,
                  status: "rejected" as const,
                } satisfies Volunteer)
              : volunteer
          )
        );

        if (statusFilter === "pending") {
          setStatusFilter("rejected");
        }
        refetch();
      }
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  const handleEmergencyAlert = async () => {
    try {
      await sendEmergencyAlert({
        message: "Emergency response needed",
        severity: "high",
      });
      // You might want to show a success toast here
    } catch (error) {
      console.error("Failed to send alert:", error);
    }
  };

  const handleBulkApprove = async () => {
    try {
      const pendingVolunteers = volunteers
        .filter((v) => v.status === "pending")
        .map((v) => v._id);
      if (pendingVolunteers.length === 0) return;

      await bulkApproveVolunteers({ volunteerIds: pendingVolunteers });
      refetch(); // Refetch volunteers list
    } catch (error) {
      console.error("Failed to bulk approve:", error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const result = await generateReport().unwrap();
      // if (result.reportUrl) {
      //   window.open(result.reportUrl, "_blank");
      // }
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  const handleApproveOrg = async (organizationId: string) => {
    try {
      const result = await updateOrgStatus({
        organizationId,
        status: "approved",
      }).unwrap();

      if (result.success) {
        setOrganizations((prevOrgs) =>
          prevOrgs.map((org) =>
            org._id === organizationId
              ? { ...org, status: "approved" as const }
              : org
          )
        );
        refetchOrganizations();
      }
    } catch (err) {
      console.error("Approve organization failed:", err);
    }
  };

  const handleRejectOrg = async (organizationId: string) => {
    try {
      const result = await updateOrgStatus({
        organizationId,
        status: "rejected",
      }).unwrap();

      if (result.success) {
        setOrganizations((prevOrgs) =>
          prevOrgs.map((org) =>
            org._id === organizationId
              ? { ...org, status: "rejected" as const }
              : org
          )
        );
        refetchOrganizations();
      }
    } catch (err) {
      console.error("Reject organization failed:", err);
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

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.personalInfo?.fullname
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      volunteer.contactInfo?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || volunteer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name?.toLowerCase().includes(orgSearchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(orgSearchTerm.toLowerCase());
    const matchesStatus =
      orgStatusFilter === "all" || org.status === orgStatusFilter;
    return matchesSearch && matchesStatus;
  });

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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  VolunteerHub Admin
                </h1>
                <p className="text-sm text-gray-600">
                  Emergency Response Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-red-100 text-red-800" variant="secondary">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {stats.active} Active Volunteers
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Total Volunteers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {stats.approved}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {stats.active}
              </div>
              <div className="text-sm text-gray-600">Currently Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {stats.responseTime}
              </div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {stats.todayResponses}
              </div>
              <div className="text-sm text-gray-600">Today's Responses</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
          </TabsList>
          <TabsContent value="volunteers">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Volunteer Management */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Volunteer Management</CardTitle>
                        <CardDescription>
                          Review and manage volunteer applications
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filters */}
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search volunteers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Volunteer List */}
                    <div className="space-y-4">
                      {filteredVolunteers.map((volunteer) => {
                        console.log("Rendering volunteer:", volunteer); // Add this debug line
                        return (
                          <div
                            key={volunteer._id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage
                                  src={volunteer.personalInfo?.photo}
                                />
                                <AvatarFallback>
                                  {volunteer.personalInfo?.fullname
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">
                                    {volunteer.personalInfo.fullname}
                                  </h4>
                                  <Badge
                                    className={getStatusColor(volunteer.status)}
                                    variant="secondary"
                                  >
                                    {volunteer.status}
                                  </Badge>
                                  {volunteer.emergency?.isAvailable && (
                                    <Badge
                                      className="bg-green-100 text-green-800"
                                      variant="secondary"
                                    >
                                      Available
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>{volunteer.contactInfo.email}</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {volunteer.contactInfo.address}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Joined{" "}
                                    {new Date(
                                      volunteer.joinDate || ""
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex gap-1 mt-2">
                                  {volunteer.skills.skillsList
                                    .slice(0, 3)
                                    .map((skill, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {volunteer.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                      console.log(
                                        "Approving volunteer with ID:",
                                        volunteer._id
                                      ); // Add this debug line
                                      handleApprove(volunteer._id);
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      console.log(
                                        "Rejecting volunteer with ID:",
                                        volunteer._id
                                      ); // Add this debug line
                                      handleReject(volunteer._id);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {volunteer.status === "approved" && (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-800"
                                >
                                  Approved
                                </Badge>
                              )}
                              {volunteer.status === "rejected" && (
                                <Badge
                                  variant="secondary"
                                  className="bg-red-100 text-red-800"
                                >
                                  Rejected
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest volunteer activities and responses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-600">
                              {activity.volunteer} •{" "}
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {recentActivities.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                          No recent activities
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() =>
                        sendEmergencyAlert({
                          message: "Emergency alert",
                          severity: "high",
                        })
                      }
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Send Emergency Alert
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() =>
                        bulkApproveVolunteers({
                          volunteerIds: volunteers
                            .filter((v) => v.status === "pending")
                            .map((v) => v._id),
                        })
                      }
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Bulk Approve
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => generateReport()}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Map</CardTitle>
                    <CardDescription>
                      Real-time volunteer locations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 bg-gray-100 rounded-lg">
                      {/* Here you would integrate with a mapping library like Google Maps or Mapbox */}
                      <div className="text-center text-gray-500 p-4">
                        <MapPin className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">
                          {activeVolunteers.length} Active Volunteers •{" "}
                          {emergencyAlerts.length} Active Alerts
                        </p>
                        <p className="text-xs mt-2">
                          Last updated: {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Organization Management</CardTitle>
                    <CardDescription>
                      Review and manage organization applications
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search organizations..."
                      value={orgSearchTerm}
                      onChange={(e) => setOrgSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={orgStatusFilter}
                    onValueChange={setOrgStatusFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Organization List */}
                <div className="space-y-4">
                  {filteredOrganizations.map((org) => (
                    <div
                      key={org._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {org.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{org.name}</h4>
                            <Badge
                              className={
                                org.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : org.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                              variant="secondary"
                            >
                              {org.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{org.email}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {org.address.street}, {org.address.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined{" "}
                              {new Date(org.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {org.contact.primaryContactName && (
                              <Badge variant="outline" className="text-xs">
                                {org.contact.primaryContactName}
                              </Badge>
                            )}
                            {org.contact.primaryContactEmail && (
                              <Badge variant="outline" className="text-xs">
                                {org.contact.primaryContactEmail}
                              </Badge>
                            )}
                            {org.contact.primaryContactPhone && (
                              <Badge variant="outline" className="text-xs">
                                {org.contact.primaryContactPhone}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {org.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveOrg(org._id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectOrg(org._id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {org.status === "approved" && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            Approved
                          </Badge>
                        )}
                        {org.status === "rejected" && (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800"
                          >
                            Rejected
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredOrganizations.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No organizations found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
