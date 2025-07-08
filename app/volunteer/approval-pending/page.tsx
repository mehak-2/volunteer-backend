"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export default function ApprovalPendingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-100 rounded-full p-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Application Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600">
                Your volunteer application is currently being reviewed by our
                admin team.
              </p>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    What's Next?
                  </span>
                </div>
                <p className="text-sm text-blue-700 text-left">
                  Our team will review your application and contact you via
                  email once a decision is made. This process typically takes
                  1-2 business days.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    Stay Updated
                  </span>
                </div>
                <p className="text-sm text-green-700 text-left">
                  We'll send you an email notification as soon as your
                  application status changes.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Logout
              </Button>

              <p className="text-xs text-gray-500">
                Questions? Contact us at support@volunteerhub.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
