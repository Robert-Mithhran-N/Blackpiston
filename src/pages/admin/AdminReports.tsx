import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const AdminReports = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">Generate and download business reports</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>Monthly sales performance and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Report</CardTitle>
              <CardDescription>Product performance and inventory status</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Report</CardTitle>
              <CardDescription>Customer analytics and behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Report</CardTitle>
              <CardDescription>Order statistics and fulfillment status</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;

