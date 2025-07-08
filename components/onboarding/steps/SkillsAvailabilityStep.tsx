"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Heart, Clock, Award, AlertTriangle } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  updateSkillsAvailability,
  nextStep,
  prevStep,
} from "@/store/slices/onboardingSlice";
import { useSkillsStepMutation } from "@/store/api/onboarding";

export default function SkillsAvailabilityStep() {
  const { data } = useAppSelector((state) => state.onboarding);
  const dispatch = useAppDispatch();
  const [submitSkills] = useSkillsStepMutation();

  const availableSkills = [
    { id: "cpr", name: "CPR Certified", required: false },
    { id: "first-aid", name: "First Aid Certified", required: false },
    { id: "emt", name: "EMT Basic", required: false },
    { id: "emt-advanced", name: "EMT Advanced", required: false },
    { id: "nursing", name: "Nursing Background", required: false },
    { id: "medical-doctor", name: "Medical Doctor", required: false },
    { id: "mental-health", name: "Mental Health Support", required: false },
    { id: "pediatric", name: "Pediatric Care", required: false },
    { id: "elderly-care", name: "Elderly Care", required: false },
    { id: "disability-support", name: "Disability Support", required: false },
    { id: "crisis-intervention", name: "Crisis Intervention", required: false },
    { id: "language", name: "Multi-language Support", required: false },
  ];

  const timeSlots = [
    { id: "weekday-morning", name: "Weekday Mornings (6AM - 12PM)" },
    { id: "weekday-afternoon", name: "Weekday Afternoons (12PM - 6PM)" },
    { id: "weekday-evening", name: "Weekday Evenings (6PM - 11PM)" },
    { id: "weekday-night", name: "Weekday Nights (11PM - 6AM)" },
    { id: "weekend-day", name: "Weekend Days (6AM - 6PM)" },
    { id: "weekend-night", name: "Weekend Nights (6PM - 6AM)" },
    { id: "holidays", name: "Holidays & Special Events" },
    { id: "on-call", name: "On-Call Availability" },
  ];

  const handleSkillChange = (skillId: string, checked: boolean) => {
    const currentSkills = data.skillsAvailability.skills || [];
    const updatedSkills = checked
      ? [...currentSkills, skillId]
      : currentSkills.filter((skill) => skill !== skillId);

    dispatch(updateSkillsAvailability({ skills: updatedSkills }));
  };

  const handleAvailabilityChange = (slotId: string, checked: boolean) => {
    const currentAvailability = data.skillsAvailability.availability || [];
    const updatedAvailability = checked
      ? [...currentAvailability, slotId]
      : currentAvailability.filter((slot) => slot !== slotId);

    dispatch(updateSkillsAvailability({ availability: updatedAvailability }));
  };

  const handleCertificationChange = (field: string, value: boolean) => {
    dispatch(updateSkillsAvailability({ [field]: value }));
  };

  const handleNext = async () => {
    try {
      const skillsData = {
        user: {
          certificate: {
            cprTrained: data.skillsAvailability.cprTrained || false,
            firstAidTrained: data.skillsAvailability.firstAidTrained || false,
          },
          skills: data.skillsAvailability.skills || [],
          schedule: data.skillsAvailability.availability || [],
        },
      };

      console.log("Submitting skills data:", skillsData);

      const response = await submitSkills(skillsData).unwrap();
      console.log("Skills submitted successfully:", response);

      dispatch(nextStep());
    } catch (error) {
      console.error("Failed to submit skills:", error);

      let errorMessage = "Failed to submit skills. Please try again.";
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data &&
        typeof error.data.message === "string"
      ) {
        errorMessage = error.data.message as string;
      }

      console.error("Error message:", errorMessage);
    }
  };

  const handlePrevious = () => {
    dispatch(prevStep());
  };

  const hasBasicRequirements =
    data.skillsAvailability.skills?.length > 0 &&
    data.skillsAvailability.availability?.length > 0;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center gap-2 justify-center">
          <Heart className="h-6 w-6 text-blue-600" />
          Skills & Availability
        </CardTitle>
        <CardDescription>
          Tell us about your medical training, skills, and when you're available
          to help during emergencies.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Critical Certifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Emergency Medical Certifications
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">CPR Certified</Label>
                <p className="text-sm text-gray-600">
                  Current CPR certification from AHA/Red Cross
                </p>
              </div>
              <Switch
                checked={data.skillsAvailability.cprTrained}
                onCheckedChange={(checked) =>
                  handleCertificationChange("cprTrained", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">
                  First Aid Certified
                </Label>
                <p className="text-sm text-gray-600">
                  Current First Aid certification
                </p>
              </div>
              <Switch
                checked={data.skillsAvailability.firstAidTrained}
                onCheckedChange={(checked) =>
                  handleCertificationChange("firstAidTrained", checked)
                }
              />
            </div>
          </div>

          {(data.skillsAvailability.cprTrained ||
            data.skillsAvailability.firstAidTrained) && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Great!</strong> Your certifications qualify you for
                priority emergency response assignments.
              </p>
            </div>
          )}
        </div>

        {/* Skills Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Medical & Support Skills
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {availableSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  id={skill.id}
                  checked={
                    data.skillsAvailability.skills?.includes(skill.id) || false
                  }
                  onCheckedChange={(checked) =>
                    handleSkillChange(skill.id, checked as boolean)
                  }
                />
                <Label htmlFor={skill.id} className="flex-1 cursor-pointer">
                  {skill.name}
                </Label>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            Selected skills: {data.skillsAvailability.skills?.length || 0}
          </div>
        </div>

        {/* Availability Schedule */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Availability Schedule
            </h3>
          </div>

          <div className="space-y-3">
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  id={slot.id}
                  checked={
                    data.skillsAvailability.availability?.includes(slot.id) ||
                    false
                  }
                  onCheckedChange={(checked) =>
                    handleAvailabilityChange(slot.id, checked as boolean)
                  }
                />
                <Label htmlFor={slot.id} className="flex-1 cursor-pointer">
                  {slot.name}
                </Label>
              </div>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            Selected time slots:{" "}
            {data.skillsAvailability.availability?.length || 0}
          </div>
        </div>

        {/* Emergency Response Commitment */}
        <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-1" />
            <div>
              <h4 className="font-medium text-orange-900 mb-2">
                Emergency Response Commitment
              </h4>
              <p className="text-sm text-orange-800 mb-3">
                By selecting availability times, you're indicating when you
                could potentially respond to emergency calls. You can always
                decline specific requests and update your availability at any
                time.
              </p>
              <div className="flex gap-2">
                <Badge
                  className="bg-orange-100 text-orange-800"
                  variant="secondary"
                >
                  No commitment required
                </Badge>
                <Badge
                  className="bg-orange-100 text-orange-800"
                  variant="secondary"
                >
                  Flexible scheduling
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Message */}
        {!hasBasicRequirements && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Please select at least one skill and one availability time slot to
              continue.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handlePrevious}>
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!hasBasicRequirements}
            className="px-8"
          >
            Continue to Documents
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
