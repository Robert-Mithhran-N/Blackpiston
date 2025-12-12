import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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

const Login = () => {
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would validate credentials here
    // For now, we'll just navigate to the admin dashboard
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-16">
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
              <Card>
                <CardHeader>
                  <CardTitle>Admin login</CardTitle>
                  <CardDescription>Manage catalog, orders, and service schedules.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin email</Label>
                    <Input id="admin-email" type="email" placeholder="admin@blackpiston.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input id="admin-password" type="password" placeholder="••••••••" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-code">Access code</Label>
                    <Input id="admin-code" type="text" placeholder="One-time access code" required />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="submit" className="w-full sm:w-auto" onClick={handleAdminLogin}>
                    Continue to admin portal
                  </Button>
                  <span className="text-sm text-muted-foreground">Need access? Contact an owner.</span>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;


