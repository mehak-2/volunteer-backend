"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setCurrentStep } from "@/store/slices/onboardingSlice";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import ContactInfoStep from "./steps/ContactInfoStep";
import SkillsAvailabilityStep from "./steps/SkillsAvailabilityStep";
import DocumentsStep from "./steps/DocumentsStep";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { loginSuccess } from "@/store/slices/authSlice";
import { useSubmitCompleteApplicationMutation } from "@/store/api/volunteer";

export default function OnboardingFlow() {
  const { currentStep } = useAppSelector((state) => state.onboarding);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const steps = [
    { number: 1, title: "Personal Information", component: PersonalInfoStep },
    { number: 2, title: "Contact & Location", component: ContactInfoStep },
    {
      number: 3,
      title: "Skills & Availability",
      component: SkillsAvailabilityStep,
    },
    { number: 4, title: "Documents & Verification", component: DocumentsStep },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;
  const progress = (currentStep / steps.length) * 100;

  const [submitApplication] = useSubmitCompleteApplicationMutation();

  const handleOnboardingComplete = async (finalData: any) => {
    try {
      const response = await submitApplication(finalData).unwrap();

      if (response.success) {
        // Store the new token
        localStorage.setItem("token", response.data.token);

        // Update auth state
        dispatch(
          loginSuccess({
            user: response.data.user,
            token: response.data.token,
          })
        );

        // Create volunteer profile
        await fetch(`http://localhost:5000/api/volunteer/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${response.data.token}`,
          },
          body: JSON.stringify({
            userId: response.data.user.id,
          }),
        });

        router.push("/volunteerdashboard");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-full p-2">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">VolunteerHub</h1>
              <p className="text-sm text-gray-600">Volunteer Registration</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-xl">
                Complete Your Registration
              </CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Step {currentStep} of {steps.length}
              </Badge>
            </div>
            <div className="space-y-4">
              <Progress value={progress} className="w-full h-2" />
              <div className="grid grid-cols-4 gap-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                      step.number === currentStep
                        ? "border-blue-200 bg-blue-50 text-blue-900"
                        : step.number < currentStep
                        ? "border-green-200 bg-green-50 text-green-900"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.number === currentStep
                          ? "bg-blue-600 text-white"
                          : step.number < currentStep
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {step.number < currentStep ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {step.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Step Content */}
        <CurrentStepComponent />
      </div>
    </div>
  );
}
