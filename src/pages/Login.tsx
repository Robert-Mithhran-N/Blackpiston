import { FormEvent } from "react";
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

const Login = () => {
  const { login } = useAdminAuth();

  const handleAdminSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Frontend-only: treat any credentials as valid and go to admin dashboard
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


