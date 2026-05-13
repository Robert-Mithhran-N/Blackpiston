import { useUserAuth } from "@/context/UserAuthContext";
import { updatePassword } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, KeyRound, AlertTriangle } from "lucide-react";

const ProfileSettings = () => {
    const { user } = useUserAuth();

    const passwordMutation = useMutation({
        mutationFn: updatePassword,
        onSuccess: () => {
            toast.success("Password updated successfully");
            // Find the form and reset it
            const form = document.getElementById("password-form") as HTMLFormElement;
            if (form) form.reset();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to update password");
        },
    });

    const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill all password fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long");
            return;
        }

        passwordMutation.mutate({ currentPassword, newPassword });
    };

    const isSocialLogin = user && (!user.authProvider || user.authProvider !== 'local');

    return (
        <div className="p-6 sm:p-8 max-w-2xl">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Account Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your security preferences and passwords.
                </p>
            </div>

            <div className="space-y-8">
                {/* Security Section */}
                <section className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Change Password</h3>
                            <p className="text-sm text-muted-foreground">Ensure your account is using a long, random password.</p>
                        </div>
                    </div>

                    {isSocialLogin ? (
                        <div className="flex items-start gap-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm">Social Login Account</h4>
                                <p className="text-sm mt-1 opacity-90">
                                    You logged in via a social provider ({user.authProvider}). You cannot change your password here as you don't have a local password set.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type="password"
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={passwordMutation.isPending}
                                >
                                    {passwordMutation.isPending ? "Updating Password..." : "Update Password"}
                                </Button>
                            </div>
                        </form>
                    )}
                </section>
                
                {/* Additional Settings placeholders can go here */}
            </div>
        </div>
    );
};

export default ProfileSettings;
