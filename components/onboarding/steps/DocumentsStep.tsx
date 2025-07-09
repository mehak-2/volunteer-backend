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
import { FileText, Upload, CheckCircle, Shield, Clock } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  updateDocuments,
  prevStep,
  resetOnboarding,
} from "@/store/slices/onboardingSlice";
import { loginSuccess } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useDocumentStepMutation } from "@/store/api/onboarding";
import { useToast } from "@/hooks/use-toast";

export default function DocumentsStep() {
  const { data } = useAppSelector((state) => state.onboarding);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [uploadedDoc, setUploadedDoc] = useState<string>("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToBackground, setAgreeToBackground] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitDocument] = useDocumentStepMutation();
  const { toast } = useToast(); // Use toast from the hook

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a cloud service
      setUploadedDoc(file.name);
      dispatch(updateDocuments({ idDocument: file.name }));
    }
  };

  const generateObjectId = () => {
    return (
      Math.floor(Date.now() / 1000).toString(16) +
      "0000000000000000".substring(0, 16)
    );
  };

  const handleSubmit = async () => {
    if (!agreeToTerms) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file first if exists
      let documentUrl = "";
      if (uploadedDoc) {
        const fileInput = document.getElementById(
          "id-upload"
        ) as HTMLInputElement;
        const file = fileInput?.files?.[0];
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          const uploadResponse = await fetch(
            "http://localhost:5000/api/upload",
            {
              method: "POST",
              body: formData,
            }
          );
          if (!uploadResponse.ok) {
            throw new Error("Failed to upload file");
          }
          const { fileUrl } = await uploadResponse.json();
          documentUrl = fileUrl;
        }
      }

      // Submit complete application
      const onboardingResponse = await fetch(
        "http://localhost:5000/api/onboarding/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            personalInfo: {
              fullname: data.personalInfo.fullname,
              age: data.personalInfo.age,
              gender: data.personalInfo.gender,
            },
            contactInfo: {
              phone: data.contactInfo.phone,
              email: data.contactInfo.email,
              address: data.contactInfo.address || "",
              location: data.contactInfo.location,
              contactPreference: "email",
            },
            skillsInfo: {
              cprTrained: data.skillsAvailability.cprTrained || false,
              firstAidTrained: data.skillsAvailability.firstAidTrained || false,
              skills: data.skillsAvailability.skills || [],
              availability: data.skillsAvailability.availability || [],
            },
            documentsInfo: {
              documents: [{ document: documentUrl }],
              termsAndConditions: agreeToTerms,
              backgroundCheckConsent: agreeToBackground,
            },
          }),
        }
      );

      const responseData = await onboardingResponse.json();
      console.log(
        "Onboarding submission response:",
        JSON.stringify(responseData, null, 2)
      );

      if (!onboardingResponse.ok) {
        console.error(
          "Onboarding submission failed with status:",
          onboardingResponse.status
        );
        throw new Error(responseData.message || "Failed to submit application");
      }

      // Add response validation - check the complete structure
      if (
        !responseData.success ||
        !responseData.data?.user?.id || // Changed to access nested data
        !responseData.data?.token // Changed to access nested data
      ) {
        console.error("Unexpected response structure:", responseData);
        throw new Error("Invalid response format from server");
      }

      console.log(
        "Onboarding data submitted successfully, user ID:",
        responseData.data.user.id
      );
      console.log(
        "Onboarding complete status:",
        responseData.data.user.onboardingComplete
      );

      // Update auth state with the complete user data (onboarding is now complete)
      dispatch(
        loginSuccess({
          user: {
            id: responseData.data.user.id,
            email: responseData.data.user.email,
            role: responseData.data.user.role,
            name: responseData.data.user.name,
            onboardingComplete: responseData.data.user.onboardingComplete,
            profileCompletion: responseData.data.user.profileCompletion,
            personalInfo: responseData.data.user.personalInfo,
            contactInfo: responseData.data.user.contactInfo,
            skills: responseData.data.user.skills,
            documents: responseData.data.user.documents,
            status: responseData.data.user.status,
            emergency: responseData.data.user.emergency,
          },
          token: responseData.data.token,
        })
      );

      // Store token in localStorage
      localStorage.setItem("token", responseData.data.token);

      console.log(
        "Onboarding completed successfully! User profile is complete."
      );

      // Reset onboarding state
      dispatch(resetOnboarding());

      // Show success message
      toast({
        title: "Application Submitted!",
        description:
          "Your volunteer application has been submitted and is pending admin approval.",
        variant: "default",
      });

      // Redirect to approval pending page
      router.push("/volunteer/approval-pending");
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to complete registration. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    dispatch(prevStep());
  };

  const canSubmit = agreeToTerms && agreeToBackground && uploadedDoc;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center gap-2 justify-center">
          <Shield className="h-6 w-6 text-blue-600" />
          Documents & Verification
        </CardTitle>
        <CardDescription>
          Complete your registration with identity verification and agreement to
          our terms.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Document Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Identity Verification
            </h3>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            {!uploadedDoc ? (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Upload Government-Issued ID
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Please upload a clear photo of your driver's license,
                    passport, or state ID
                  </p>
                  <label
                    htmlFor="id-upload"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Choose File
                  </label>
                  <input
                    id="id-upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <div>
                  <h4 className="font-medium text-green-900 mb-2">
                    Document Uploaded Successfully
                  </h4>
                  <p className="text-sm text-green-700 mb-2">{uploadedDoc}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadedDoc("")}
                  >
                    Upload Different File
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Document Security
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your documents are encrypted and stored securely</li>
              <li>
                • Only used for identity verification and background checks
              </li>
              <li>• Automatically deleted after verification is complete</li>
              <li>• Never shared with third parties</li>
            </ul>
          </div>
        </div>

        {/* Application Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Application Summary
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Personal Information
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Name:</strong> {data.personalInfo.fullname}
                </p>
                <p>
                  <strong>Age:</strong> {data.personalInfo.age}
                </p>
                <p>
                  <strong>Gender:</strong> {data.personalInfo.gender}
                </p>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Contact Information
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Phone:</strong> {data.contactInfo.phone}
                </p>
                <p>
                  <strong>Email:</strong> {data.contactInfo.email}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {data.contactInfo.location ? "Enabled" : "Not provided"}
                </p>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
              <div className="space-y-1">
                {data.skillsAvailability.cprTrained && (
                  <Badge
                    className="bg-green-100 text-green-800 mr-1"
                    variant="secondary"
                  >
                    CPR Certified
                  </Badge>
                )}
                {data.skillsAvailability.firstAidTrained && (
                  <Badge
                    className="bg-green-100 text-green-800 mr-1"
                    variant="secondary"
                  >
                    First Aid
                  </Badge>
                )}
                {!data.skillsAvailability.cprTrained &&
                  !data.skillsAvailability.firstAidTrained && (
                    <span className="text-sm text-gray-600">
                      No certifications provided
                    </span>
                  )}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
              <p className="text-sm text-gray-600">
                {data.skillsAvailability.availability?.length || 0} time slots
                selected
              </p>
            </div>
          </div>
        </div>

        {/* Terms and Agreements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Terms & Agreements
          </h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) =>
                  setAgreeToTerms(checked as boolean)
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor="terms"
                  className="text-base font-medium cursor-pointer"
                >
                  I agree to the Terms of Service and Privacy Policy
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  By checking this box, you agree to our volunteer terms,
                  privacy policy, and code of conduct.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="background"
                checked={agreeToBackground}
                onCheckedChange={(checked) =>
                  setAgreeToBackground(checked as boolean)
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor="background"
                  className="text-base font-medium cursor-pointer"
                >
                  I consent to background check verification
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  We'll conduct a standard background check to ensure volunteer
                  safety and community trust.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium text-green-900 mb-2">
                What Happens Next?
              </h4>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>
                  Your application will be reviewed by our team (typically 2-3
                  business days)
                </li>
                <li>Background check will be processed (3-5 business days)</li>
                <li>
                  You'll receive an email notification about your approval
                  status
                </li>
                <li>
                  Once approved, you can start responding to emergency alerts
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handlePrevious}>
            Previous
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="px-8"
          >
            {isSubmitting ? "Submitting Application..." : "Submit Application"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
