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
import { useOnboardingMutation } from "../../../store/api/onboarding"; // ✅ your RTK Query file path

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Upload, Camera } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updatePersonalInfo, nextStep } from "@/store/slices/onboardingSlice";

export default function PersonalInfoStep() {
  const { data } = useAppSelector((state) => state.onboarding);
  const dispatch = useAppDispatch();
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [onboarding, { isLoading, isError, error, isSuccess }] =
    useOnboardingMutation(); // ✅ RTK mutation hook

  const handleInputChange = (field: string, value: string | number) => {
    dispatch(updatePersonalInfo({ [field]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
        dispatch(updatePersonalInfo({ photo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    try {
      const { fullname, age, gender } = data.personalInfo;
      const payload = {
        fullname,
        age,
        gender,
      };

      await onboarding(payload).unwrap(); // ✅ Await the mutation
      dispatch(nextStep());
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const isValid =
    data.personalInfo.fullname &&
    data.personalInfo.age > 0 &&
    data.personalInfo.gender;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center gap-2 justify-center">
          <User className="h-6 w-6 text-blue-600" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Let's start with some basic information about you. This helps us match
          you with appropriate volunteer opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo Upload Section */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <Avatar className="w-32 h-32 mx-auto border-4 border-gray-200">
              <AvatarImage src={photoPreview || data.personalInfo.photo} />
              <AvatarFallback className="bg-gray-100 text-gray-400 text-2xl">
                <Camera className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="photo-upload"
              className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Upload a clear photo of yourself
            </p>
            <Badge variant="secondary" className="mt-1">
              Optional
            </Badge>
          </div>
        </div>

        {/* Personal Details Form */}
        {/* Personal Details Form */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullname">Full Name *</Label>
            <Input
              id="fullname"
              type="text"
              placeholder="Enter your full name"
              value={data.personalInfo.fullname}
              onChange={(e) => handleInputChange("fullname", e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              placeholder="Your age"
              min="16"
              max="99"
              value={data.personalInfo.age || ""}
              onChange={(e) =>
                handleInputChange("age", parseInt(e.target.value) || 0)
              }
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              Must be 16 or older to volunteer
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select
              value={data.personalInfo.gender}
              onValueChange={(value) => handleInputChange("gender", value)}
            >
              <SelectTrigger className="text-lg">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not-to-say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Why do we need this information?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Your photo helps emergency coordinators identify you during
              responses
            </li>
            <li>• Age verification ensures you meet volunteer requirements</li>
            <li>
              • Gender information helps with appropriate assignment matching
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isValid || isLoading}
            className="px-8"
          >
            {isLoading ? "Saving..." : "Continue to Contact Info"}
          </Button>
        </div>

        {/* Error Feedback */}
        {isError && (
          <p className="text-red-500 text-sm pt-2">
            Something went wrong. Please try again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
