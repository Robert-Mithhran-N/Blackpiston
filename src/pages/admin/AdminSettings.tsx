import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, MapPin, Phone, Mail, Clock } from "lucide-react";
import { contactConfig } from "@/config/contact";

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Configure site-wide options for BlackPiston Garage.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Site name</Label>
                <Input defaultValue="BlackPiston Garage" />
              </div>
              <div className="space-y-2">
                <Label>Contact email</Label>
                <Input defaultValue={contactConfig.email.display} />
              </div>
              <div className="space-y-2">
                <Label>Working hours</Label>
                <Textarea
                  rows={3}
                  defaultValue={`Mon–Sat: ${contactConfig.businessHours?.weekdays}\nSun: ${contactConfig.businessHours?.sunday}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-3 w-3" /> Phone Number
                </Label>
                <Input defaultValue={contactConfig.phone.display} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-3 w-3" /> Email
                </Label>
                <Input defaultValue={contactConfig.email.display} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> Address
                </Label>
                <Textarea
                  rows={3}
                  defaultValue={contactConfig.address.full}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social & Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Social & Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input defaultValue={contactConfig.social?.instagram || ""} />
              </div>
              <div className="space-y-2">
                <Label>Youtube</Label>
                <Input defaultValue={contactConfig.social?.youtube || ""} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
                <div className="space-y-0.5">
                  <Label>Maintenance mode</Label>
                  <p className="text-xs text-muted-foreground">
                    When enabled, only admins can access the site.
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Quick Info Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Current Site Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                This information is displayed across the website:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{contactConfig.address.full}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">{contactConfig.phone.display}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">{contactConfig.email.display}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                To permanently update these values, edit <code className="text-primary">src/config/contact.ts</code>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button className="bg-gradient-flame hover:opacity-90">
            Save settings
          </Button>
          <Button variant="outline">Reset to defaults</Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
