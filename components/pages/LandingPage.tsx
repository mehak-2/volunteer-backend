"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  useGetDashboardQuery,
  useCreateProgramMutation,
  useDeleteProgramMutation,
} from "@/store/api/organization";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export default function OrganizationDashboard() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProgram, setNewProgram] = useState({
    title: "",
    description: "",
    category: "" as
      | "healthcare"
      | "education"
      | "environment"
      | "community"
      | "disaster-relief"
      | "elderly-care"
      | "children"
      | "other",
    location: { address: "" },
    startDate: "",
    endDate: "",
    duration: "",
    maxVolunteers: 0,
    volunteerRequirements: {
      requiredSkills: [],
      requiredCertifications: [],
      experienceLevel: "any" as
        | "any"
        | "beginner"
        | "intermediate"
        | "advanced",
    },
  });

  const isAuthenticated = useAppSelector(
    (state) => state.organization?.isAuthenticated
  );
  const organizationData = useAppSelector(
    (state) => state.organization?.organization
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  const { data: dashboardData, isLoading } = useGetDashboardQuery();
  const [createProgram, { isLoading: isCreating }] = useCreateProgramMutation();
  const [deleteProgram] = useDeleteProgramMutation();

  const stats = dashboardData?.data?.stats;
  const programs = dashboardData?.data?.programs || [];
  const organization = dashboardData?.data?.organization;

  const handleCreateProgram = async () => {
    try {
      await createProgram(newProgram).unwrap();
      setIsCreateDialogOpen(false);
      setNewProgram({
        title: "",
        description: "",
        category: "healthcare" as
          | "healthcare"
          | "education"
          | "environment"
          | "community"
          | "disaster-relief"
          | "elderly-care"
          | "children"
          | "other",
        location: { address: "" },
        startDate: "",
        endDate: "",
        duration: "",
        maxVolunteers: 0,
        volunteerRequirements: {
          requiredSkills: [],
          requiredCertifications: [],
          experienceLevel: "any" as
            | "any"
            | "beginner"
            | "intermediate"
            | "advanced",
        },
      });
    } catch (error) {
      console.error("Failed to create program:", error);
    }
  };

  const handleProgramClick = (programId: string) => {
    router.push(`/program/${programId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "healthcare":
        return "🏥";
      case "education":
        return "📚";
      case "environment":
        return "🌱";
      case "community":
        return "🏘️";
      case "disaster-relief":
        return "🚨";
      case "elderly-care":
        return "👴";
      case "children":
        return "👶";
      default:
        return "📋";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={organization?.logo} />
                <AvatarFallback>
                  {organization?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {organization?.name || "Organization Dashboard"}
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your volunteer programs and applications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/auth")}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Programs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalPrograms || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Programs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.activePrograms || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Applications
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalApplications || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Selected Volunteers
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.selectedVolunteers || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Programs</h2>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Program
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Program</DialogTitle>
                <DialogDescription>
                  Add a new volunteer program to start recruiting volunteers.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Program Title"
                  value={newProgram.title}
                  onChange={(e) =>
                    setNewProgram({ ...newProgram, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Program Description"
                  value={newProgram.description}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      description: e.target.value,
                    })
                  }
                />
                <Select
                  value={newProgram.category}
                  onValueChange={(value) =>
                    setNewProgram({
                      ...newProgram,
                      category: value as
                        | "healthcare"
                        | "education"
                        | "environment"
                        | "community"
                        | "disaster-relief"
                        | "elderly-care"
                        | "children"
                        | "other",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="disaster-relief">
                      Disaster Relief
                    </SelectItem>
                    <SelectItem value="elderly-care">Elderly Care</SelectItem>
                    <SelectItem value="children">Children</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Location Address"
                  value={newProgram.location.address}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      location: { address: e.target.value },
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={newProgram.startDate}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        startDate: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="date"
                    value={newProgram.endDate}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, endDate: e.target.value })
                    }
                  />
                </div>
                <Input
                  placeholder="Duration (e.g., 2 hours, 1 day, 3 weeks)"
                  value={newProgram.duration}
                  onChange={(e) =>
                    setNewProgram({ ...newProgram, duration: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max Volunteers"
                  value={newProgram.maxVolunteers}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      maxVolunteers: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateProgram} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Program"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {programs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No programs yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first volunteer program to get started.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Program
                </Button>
              </CardContent>
            </Card>
          ) : (
            programs.map((program: any) => (
              <Card
                key={program._id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProgramClick(program._id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {getCategoryIcon(program.category)}
                        </span>
                        <CardTitle className="text-lg">
                          {program.title}
                        </CardTitle>
                        <Badge
                          className={getStatusColor(program.status)}
                          variant="secondary"
                        >
                          {program.status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {program.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">
                        {program.location?.address}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(program.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        {program.appliedVolunteers?.length || 0} applications
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        {program.selectedVolunteers?.length || 0} selected
                      </span>
                    </div>
                  </div>
                  {program.appliedVolunteers?.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-orange-600">
                          {program.appliedVolunteers.length} new applications
                          pending review
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
