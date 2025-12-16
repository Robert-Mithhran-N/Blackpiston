import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

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
                <Input defaultValue="contact@blackpiston.garage" />
              </div>
              <div className="space-y-2">
                <Label>Working hours</Label>
                <Textarea
                  rows={3}
                  defaultValue={"Mon–Sat: 10:00 – 19:00\nSun: Track days only"}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Social & maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input placeholder="@blackpiston.garage" />
              </div>
              <div className="space-y-2">
                <Label>Youtube</Label>
                <Input placeholder="Channel URL" />
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


