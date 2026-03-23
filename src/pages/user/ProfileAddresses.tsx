import { useState } from "react";
import { useUserAuth } from "@/context/UserAuthContext";
import { addSavedAddress, deleteSavedAddress } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Plus, Trash2, Home, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ProfileAddresses = () => {
  const { user, login, token } = useUserAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const addresses = user?.savedAddresses || [];

  const addMutation = useMutation({
    mutationFn: addSavedAddress,
    onSuccess: (data) => {
      // Optimistically update the user context with the new savedAddresses array
      if (user && token) {
        login(token, { ...user, savedAddresses: data.addresses });
        toast.success("Address added successfully");
        setIsAddOpen(false);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add address");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSavedAddress,
    onSuccess: (data) => {
      if (user && token) {
        login(token, { ...user, savedAddresses: data.addresses });
        toast.success("Address deleted successfully");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete address");
    },
  });

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const label = formData.get("label") as string;
    const street = formData.get("street") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const pincode = formData.get("pincode") as string;

    if (!label || !street || !city || !state || !pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    addMutation.mutate({
      label,
      street,
      city,
      state,
      pincode,
      country: "India",
      isDefault: addresses.length === 0, // Set as default if it's the first one
    });
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Saved Addresses</h2>
          <p className="text-muted-foreground mt-1">
            Manage your shipping and billing addresses for faster checkout.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
              <DialogDescription>
                Fill in the details for your new shipping or billing address.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="label">Address Label (Home, Office, etc.)</Label>
                <Input id="label" name="label" required placeholder="e.g., Home" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" name="street" required placeholder="123 Main St, Apt 4B" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required placeholder="Mumbai" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" required placeholder="Maharashtra" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" name="pincode" required placeholder="400001" />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Adding..." : "Save Address"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-border rounded-xl">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No addresses saved</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            Add a shipping address to save time during your next checkout.
          </p>
          <Button variant="outline" onClick={() => setIsAddOpen(true)}>
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address: any) => (
            <div
              key={address.id}
              className="border border-border rounded-xl p-5 bg-background relative group hover:border-primary/50 transition-colors"
            >
              {address.isDefault && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl">
                  Default
                </span>
              )}
              
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full text-primary">
                  {address.label.toLowerCase().includes("office") || address.label.toLowerCase().includes("work") ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <Home className="h-5 w-5" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground mb-1">{address.label}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{address.street}</p>
                    <p>{address.city}, {address.state} {address.pincode}</p>
                    <p>{address.country}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this address?")) {
                      deleteMutation.mutate(address.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileAddresses;
