import { useEffect } from "react";
// Removed react-hook-form import as it was causing syntax errors and isn't needed for the native form
import { useUserAuth } from "@/context/UserAuthContext";
import { updateProfile } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Phone, User as UserIcon, Home } from "lucide-react";

const ProfileDetails = () => {
  const { user, login, token } = useUserAuth();
  const navigate = useNavigate();

  // Basic native controlled form rather than relying on rhf just in case it's not installed
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Data contains { message, user }
      if (token && data.user) {
        // Optimistically update the context
        login(token, data.user);
        toast.success("Profile updated successfully");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    updateMutation.mutate({ name, phone });
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Profile Details</h2>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and contact details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              defaultValue={user?.name || ""}
              className="pl-10"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Email Field (Disabled) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="pl-10 bg-muted cursor-not-allowed"
              title="Email address cannot be changed"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Your email address is used for login and cannot be changed here.
          </p>
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={user?.phone || ""}
              className="pl-10"
              placeholder="+1234567890"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-4">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto min-w-[140px]"
          >
            {updateMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full sm:w-auto min-w-[140px] flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileDetails;
