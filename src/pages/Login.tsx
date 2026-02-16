import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useUserAuth } from "@/context/UserAuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/layout/BackButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAdminAuth } from "@/context/AdminAuthContext";

const API_BASE = "http://localhost:3001/api";

const Login = () => {
  const { login } = useAdminAuth();
  const userAuth = useUserAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as a user
  useEffect(() => {
    if (userAuth.isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [userAuth.isAuthenticated, navigate]);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setGoogleError(null);

      try {
        // Send the access token to our backend
        const response = await fetch(`${API_BASE}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Google login failed");
        }

        // Store auth data via context (handles localStorage + state)
        userAuth.login(data.token, data.user);

        console.log("✅ Google login successful:", data.user.email);

        // Redirect to home page
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Google login error:", error);
        setGoogleError(
          error instanceof Error ? error.message : "Google login failed. Please try again."
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleError("Google sign-in was cancelled or failed. Please try again.");
    },
  });

  const handleAdminSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-16">
        <BackButton />
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Access
            </p>
            <h1 className="text-4xl font-display tracking-tight text-foreground sm:text-5xl">
              Log in to your account
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the portal that fits your role. Admins need an access code
              in addition to their credentials.
            </p>
          </div>

          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <Card>
                <CardHeader>
                  <CardTitle>User login</CardTitle>
                  <CardDescription>Check orders, saved builds, and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Google Sign-In */}
                  <div className="flex flex-col items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-3 h-11 text-sm font-medium"
                      onClick={() => googleLogin()}
                      disabled={googleLoading}
                    >
                      <svg width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      {googleLoading ? "Signing in..." : "Sign in with Google"}
                    </Button>
                    {googleError && (
                      <p className="text-sm text-destructive">{googleError}</p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Email/Password login */}
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input id="user-email" type="email" placeholder="you@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-password">Password</Label>
                    <Input id="user-password" type="password" placeholder="••••••••" required />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="submit" className="w-full sm:w-auto">
                    Continue to user portal
                  </Button>
                  <button type="button" className="text-sm text-primary hover:text-primary/80">
                    Forgot password?
                  </button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={handleAdminSubmit}>
                <Card>
                  <CardHeader>
                    <CardTitle>Admin login</CardTitle>
                    <CardDescription>
                      Manage catalog, orders, and service schedules.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@blackpiston.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-code">Access code</Label>
                      <Input
                        id="admin-code"
                        type="text"
                        placeholder="One-time access code"
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="submit" className="w-full sm:w-auto">
                      Continue to admin portal
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      For now, any credentials will open the admin dashboard.
                    </span>
                  </CardFooter>
                </Card>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;




