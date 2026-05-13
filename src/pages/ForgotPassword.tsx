import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/layout/BackButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes("localhost")) return envUrl;
  return `${window.location.protocol}//${window.location.hostname}:3001/api`;
};
const API_BASE = getApiBaseUrl();

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Unable to process request");
      }

      setSuccess(true);
      toast.success("If the email exists, a reset link has been sent.");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container py-16 flex-grow">
        <BackButton />
        <div className="max-w-md mx-auto space-y-8 mt-8">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-display tracking-tight text-foreground">
              Reset your password
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6">
                {success ? (
                  <div className="p-4 rounded-md bg-green-500/10 border border-green-500/20 text-center">
                    <p className="text-sm font-medium text-green-500">
                      Check your email for the reset link!
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      If you don't receive an email within 5 minutes, please check your spam folder.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                {!success && (
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                )}
                <Link to="/login" className="text-sm text-primary hover:text-primary/80">
                  Return to login
                </Link>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
