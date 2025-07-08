"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Mail, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export default function ApplicationRejectedPage() {
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
              <div className="bg-red-100 rounded-full p-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Application Not Approved
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600">
                Unfortunately, your volunteer application was not approved at
                this time.
              </p>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-900">What Now?</span>
                </div>
                <p className="text-sm text-orange-700 text-left">
                  You can reapply in the future or contact our support team for
                  more information about why your application wasn't approved.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Need Help?</span>
                </div>
                <p className="text-sm text-blue-700 text-left">
                  Our support team is here to help. Reach out to us for feedback
                  on your application.
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
