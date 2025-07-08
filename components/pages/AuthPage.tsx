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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Mail, Lock, User, Shield, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slices/authSlice";
import { useRegisterMutation, useLoginMutation } from "@/store/api/auth";
import { useToast } from "@/hooks/use-toast";
import { useGetDashboardQuery } from "@/store/api/volunteer";
import { useLoginMutation as useOrgLoginMutation } from "@/store/api/organization";
import { organizationLoginSuccess } from "@/store/slices/organizationSlice";
import { useRegisterMutation as useOrgRegisterMutation } from "@/store/api/organization";
import { Textarea } from "@/components/ui/textarea";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
  });
  const [organizationForm, setOrganizationForm] = useState({
    email: "",
    password: "",
  });
  const { toast } = useToast();

  const [orgLogin, { isLoading: isOrgLoggingIn }] = useOrgLoginMutation();

  const handleVolunteerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login({
        email: form.email,
        password: form.password,
      }).unwrap();

      if (response.success) {
        // Store token and auth state
        localStorage.setItem("token", response.data.token);
        dispatch(
          loginSuccess({
            user: {
              id: response.data.user.id,
              email: response.data.user.email,
              role: "volunteer",
              name: response.data.user.name,
            },
            token: response.data.token,
          })
        );

        console.log("Login response user data:", response.data.user); // Debug log

        // Check if user has completed onboarding
        if (response.data.user.onboardingComplete) {
          console.log("Onboarding complete, redirecting to dashboard");
          router.push("/volunteerdashboard");
        } else {
          console.log("Onboarding not complete, redirecting to onboarding");
          router.push("/onboarding");
        }

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description:
          error.data?.message || "Invalid credentials. Please try again.",
      });
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: adminForm.email,
          password: adminForm.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);

        dispatch(
          loginSuccess({
            user: {
              id: data.data.admin.id,
              email: data.data.admin.email,
              role: "admin",
              name: data.data.admin.name,
            },
            token: data.data.token,
          })
        );

        router.push("/admindashboard");
        toast({
          title: "Login successful",
          description: "Welcome back, admin!",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolunteerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await register({
        email: form.email,
        password: form.password,
        name: form.name,
      }).unwrap();
      setIsLoading(false);
      if (response.success) {
        router.push("/onboarding");
      }
    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description:
          error.data?.message || "Something went wrong. Please try again.",
      });
    }
  };

  const handleOrganizationLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await orgLogin({
        email: organizationForm.email,
        password: organizationForm.password,
      }).unwrap();

      if (response.success) {
        dispatch(
          organizationLoginSuccess({
            ...response.data,
            organization: {
              ...response.data.organization,
              role: "organization",
            },
          })
        );
        router.push("/organizationdashboard");
        toast({
          title: "Login successful",
          description: "Welcome to your organization dashboard!",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description:
          error.data?.message || "Invalid credentials. Please try again.",
      });
    }
  };

  // Add organization register state
  const [orgRegisterForm, setOrgRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    description: "",
    phone: "",
    address: { city: "", state: "" },
    contact: { primaryContactName: "", primaryContactEmail: "" },
  });

  // Add organization register mutation
  const [orgRegister, { isLoading: isOrgRegistering }] =
    useOrgRegisterMutation();

  // Add organization register handler
  const handleOrganizationRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await orgRegister(orgRegisterForm).unwrap();
      if (response.success) {
        // Clear the form
        setOrgRegisterForm({
          name: "",
          email: "",
          password: "",
          description: "",
          phone: "",
          address: { city: "", state: "" },
          contact: { primaryContactName: "", primaryContactEmail: "" },
        });

        toast({
          title: "Registration successful",
          description:
            "Your organization is pending admin approval. You can now login once approved.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.data?.message || "Something went wrong.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 rounded-full p-3">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">VolunteerHub</h1>
          </div>
          <p className="text-gray-600">Emergency Response Platform</p>
        </div>

        <Tabs defaultValue="volunteer" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="volunteer" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Volunteer
            </TabsTrigger>
            <TabsTrigger
              value="organization"
              className="flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          {/* Volunteer Auth */}
          <TabsContent value="volunteer">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Volunteer Access</CardTitle>
                <CardDescription>
                  Sign in to your volunteer account or register to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleVolunteerLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            className="pl-10"
                            required
                            value={form.email}
                            onChange={(e) =>
                              setForm({ ...form, email: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10"
                            required
                            value={form.password}
                            onChange={(e) =>
                              setForm({ ...form, password: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form
                      onSubmit={handleVolunteerRegister}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            className="pl-10"
                            required
                            value={form.name}
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="your@email.com"
                            className="pl-10"
                            required
                            value={form.email}
                            onChange={(e) =>
                              setForm({ ...form, email: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="reg-password"
                            type="password"
                            placeholder="Create a password"
                            className="pl-10"
                            required
                            value={form.password}
                            onChange={(e) =>
                              setForm({ ...form, password: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isRegistering}
                      >
                        {isRegistering
                          ? "Creating Account..."
                          : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organization Auth */}
          <TabsContent value="organization">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Organization Access</CardTitle>
                <CardDescription>
                  Sign in to your organization account or register your
                  organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    {/* Move existing organization login form here */}
                    <form
                      onSubmit={handleOrganizationLogin}
                      className="space-y-4"
                    >
                      {/* Existing login form fields */}
                      <div className="space-y-2">
                        <Label htmlFor="org-email">Organization Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="org-email"
                            type="email"
                            placeholder="organization@example.com"
                            className="pl-10"
                            required
                            value={organizationForm.email}
                            onChange={(e) =>
                              setOrganizationForm({
                                ...organizationForm,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="org-password"
                            type="password"
                            placeholder="Enter organization password"
                            className="pl-10"
                            required
                            value={organizationForm.password}
                            onChange={(e) =>
                              setOrganizationForm({
                                ...organizationForm,
                                password: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isOrgLoggingIn}
                      >
                        {isOrgLoggingIn
                          ? "Signing In..."
                          : "Organization Login"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form
                      onSubmit={handleOrganizationRegister}
                      className="space-y-4"
                    >
                      <Input
                        placeholder="Organization Name"
                        value={orgRegisterForm.name}
                        onChange={(e) =>
                          setOrgRegisterForm({
                            ...orgRegisterForm,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Organization Email"
                        value={orgRegisterForm.email}
                        onChange={(e) =>
                          setOrgRegisterForm({
                            ...orgRegisterForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={orgRegisterForm.password}
                        onChange={(e) =>
                          setOrgRegisterForm({
                            ...orgRegisterForm,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <Textarea
                        placeholder="Organization Description"
                        value={orgRegisterForm.description}
                        onChange={(e) =>
                          setOrgRegisterForm({
                            ...orgRegisterForm,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        placeholder="Phone Number"
                        value={orgRegisterForm.phone}
                        onChange={(e) =>
                          setOrgRegisterForm({
                            ...orgRegisterForm,
                            phone: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        placeholder="Primary Contact Name"
                        value={orgRegisterForm.contact.primaryContactName}
                        onChange={(e) =>
                          setOrgRegisterForm({
                            ...orgRegisterForm,
                            contact: {
                              ...orgRegisterForm.contact,
                              primaryContactName: e.target.value,
                            },
                          })
                        }
                        required
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isOrgRegistering}
                      >
                        {isOrgRegistering
                          ? "Registering..."
                          : "Register Organization"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Auth */}
          <TabsContent value="admin">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="destructive">Admin Access</Badge>
                </div>
                <CardTitle className="text-2xl">Administrator Login</CardTitle>
                <CardDescription>
                  Secure access for emergency response coordinators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@volunteerhub.com"
                        className="pl-10"
                        required
                        value={adminForm.email}
                        onChange={(e) =>
                          setAdminForm({ ...adminForm, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Enter admin password"
                        className="pl-10"
                        required
                        value={adminForm.password}
                        onChange={(e) =>
                          setAdminForm({
                            ...adminForm,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Authenticating..." : "Admin Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <Button variant="link" onClick={() => router.push("/")}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
