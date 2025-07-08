"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  useGetVolunteersForProgramQuery,
  useSelectVolunteersForProgramMutation,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface ProgramDetailViewProps {
  programId: string;
}

export default function ProgramDetailView({
  programId,
}: ProgramDetailViewProps) {
  const router = useRouter();
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const isAuthenticated = useAppSelector(
    (state) => state.organization?.isAuthenticated
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  const { data: programData, isLoading } =
    useGetVolunteersForProgramQuery(programId);
  const [selectVolunteers, { isLoading: isSelecting }] =
    useSelectVolunteersForProgramMutation();

  const program = programData?.data?.program;

  const handleVolunteerSelect = (volunteerId: string, checked: boolean) => {
    if (checked) {
      setSelectedVolunteers([...selectedVolunteers, volunteerId]);
    } else {
      setSelectedVolunteers(
        selectedVolunteers.filter((id) => id !== volunteerId)
      );
    }
  };

  const handleConfirmSelection = async () => {
    try {
      await selectVolunteers({
        programId,
        volunteerIds: selectedVolunteers,
      }).unwrap();
      router.push("/organizationdashboard");
    } catch (error) {
      console.error("Failed to select volunteers:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Program not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {program.title}
              </h1>
              <p className="text-sm text-gray-600">
                Volunteer Applications & Selection
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Volunteer Applications</CardTitle>
                    <CardDescription>
                      Review and select volunteers for this program
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {program.appliedVolunteers?.length || 0} applications
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {program.appliedVolunteers?.map((application: any) => {
                    const volunteer = application.volunteer;
                    return (
                      <div
                        key={volunteer._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={selectedVolunteers.includes(volunteer._id)}
                            onCheckedChange={(checked) =>
                              handleVolunteerSelect(
                                volunteer._id,
                                checked as boolean
                              )
                            }
                            disabled={application.status !== "applied"}
                          />
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={volunteer.personalInfo?.photo} />
                            <AvatarFallback>
                              {volunteer.personalInfo?.fullname
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">
                                {volunteer.personalInfo?.fullname}
                              </h4>
                              <Badge
                                className={getStatusColor(application.status)}
                                variant="secondary"
                              >
                                {application.status}
                              </Badge>
                              {volunteer.status === "approved" && (
                                <Badge
                                  className="bg-green-100 text-green-800"
                                  variant="secondary"
                                >
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {volunteer.contactInfo?.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {volunteer.contactInfo?.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {volunteer.contactInfo?.address}
                              </span>
                            </div>
                            <div className="flex gap-1 mt-2">
                              {volunteer.skills?.skillsList
                                ?.slice(0, 3)
                                .map((skill: string, index: number) => (
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
                          {application.status === "accepted" && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {application.status === "rejected" && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {!program.appliedVolunteers?.length && (
                    <div className="text-center text-gray-500 py-8">
                      No applications yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Selection Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedVolunteers.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Selected Volunteers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-900">
                      {program.appliedVolunteers?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Applications
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleConfirmSelection}
                  disabled={selectedVolunteers.length === 0 || isSelecting}
                >
                  {isSelecting ? "Processing..." : "Confirm Selection"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
