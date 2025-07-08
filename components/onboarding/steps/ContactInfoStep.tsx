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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Navigation } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  updateContactInfo,
  nextStep,
  prevStep,
} from "@/store/slices/onboardingSlice";
import { contactStepApi } from "@/store/api/onboarding";

export default function ContactInfoStep() {
  const { currentStep } = useAppSelector((state) => state.onboarding);
  const { data } = useAppSelector((state) => state.onboarding);
  const dispatch = useAppDispatch();
  const [gettingLocation, setGettingLocation] = useState(false);

  // Add state for contact preferences
  const [contactPreferences, setContactPreferences] = useState({
    sms: true,
    email: true,
    phonecall: false,
    notification: true,
  });

  // Add the mutation hook
  const [submitContactStep, { isLoading: isSubmitting }] =
    contactStepApi.endpoints.contactStep.useMutation();

  const handleInputChange = (field: string, value: string) => {
    dispatch(updateContactInfo({ [field]: value }));
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(
            updateContactInfo({
              location: { lat: latitude, lng: longitude },
            })
          );
          setGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setGettingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setGettingLocation(false);
    }
  };

  const handlePreferenceChange = (preference: string) => {
    setContactPreferences((prev) => ({
      ...prev,
      [preference]: !prev[preference as keyof typeof prev],
    }));
  };

  const getSelectedPreferences = () => {
    if (contactPreferences.email) return "email";
    if (contactPreferences.sms) return "sms";
    if (contactPreferences.phonecall) return "phonecall";
    if (contactPreferences.notification) return "notification";
    return "email";
  };

  const handleNext = async () => {
    try {
      const response = await submitContactStep({
        phone: data.contactInfo.phone, // Changed from phoneNumber to phone
        email: data.contactInfo.email,
        address: data.contactInfo.address,
        location: data.contactInfo.location
          ? JSON.stringify(data.contactInfo.location)
          : "",
        contactPreference: getSelectedPreferences(),
      }).unwrap();

      dispatch(nextStep());
    } catch (error: any) {
      console.error("Failed to save contact info:", error);
    }
  };

  const handlePrevious = () => {
    dispatch(prevStep());
  };

  const isValid =
    data.contactInfo.phone &&
    data.contactInfo.email &&
    data.contactInfo.address &&
    data.contactInfo.location;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center gap-2 justify-center">
          <MapPin className="h-6 w-6 text-blue-600" />
          Contact & Location Information
        </CardTitle>
        <CardDescription>
          We need your contact details and location to coordinate emergency
          responses effectively.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={data.contactInfo.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="pl-10 text-lg"
              />
            </div>
            <p className="text-xs text-gray-500">
              Primary contact for emergency alerts
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={data.contactInfo.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-10 text-lg"
              />
            </div>
            <p className="text-xs text-gray-500">
              Used for account verification and updates
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Home Address *</Label>
          <Textarea
            id="address"
            placeholder="Enter your full address including city, state, and ZIP code"
            value={data.contactInfo.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className="min-h-[100px] text-lg"
          />
          <p className="text-xs text-gray-500">
            This helps us determine your coverage area
          </p>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">
                Enable Location Services
              </h4>
              <p className="text-sm text-gray-600">
                Allow us to access your current location for faster emergency
                response coordination
              </p>
            </div>
            <Button
              variant="outline"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              {gettingLocation ? "Getting Location..." : "Get Current Location"}
            </Button>
          </div>

          {data.contactInfo.location && (
            <div className="flex items-center gap-2">
              <Badge
                className="bg-green-100 text-green-800"
                variant="secondary"
              >
                Location Enabled
              </Badge>
              <span className="text-sm text-gray-600">
                Lat: {data.contactInfo.location.lat.toFixed(4)}, Lng:{" "}
                {data.contactInfo.location.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-medium text-orange-900 mb-2">
            Privacy & Security
          </h4>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>
              • Your contact information is only shared with verified emergency
              coordinators
            </li>
            <li>
              • Location data is used solely for emergency response matching
            </li>
            <li>• You can update your availability status at any time</li>
            <li>• All data is encrypted and stored securely</li>
          </ul>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Emergency Contact Preferences
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sms"
                className="rounded"
                checked={contactPreferences.sms}
                onChange={() => handlePreferenceChange("sms")}
              />
              <label htmlFor="sms" className="text-sm">
                SMS Alerts
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="email-alerts"
                className="rounded"
                checked={contactPreferences.email}
                onChange={() => handlePreferenceChange("email")}
              />
              <label htmlFor="email-alerts" className="text-sm">
                Email Notifications
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="phone-calls"
                className="rounded"
                checked={contactPreferences.phonecall}
                onChange={() => handlePreferenceChange("phonecall")}
              />
              <label htmlFor="phone-calls" className="text-sm">
                Phone Calls (Urgent)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="push"
                className="rounded"
                checked={contactPreferences.notification}
                onChange={() => handlePreferenceChange("notification")}
              />
              <label htmlFor="push" className="text-sm">
                Push Notifications
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handlePrevious}>
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isValid || isSubmitting}
            className="px-8"
          >
            {isSubmitting ? "Saving..." : "Continue to Skills"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
