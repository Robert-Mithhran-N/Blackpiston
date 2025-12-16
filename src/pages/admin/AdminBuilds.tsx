import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Factory, ImageUp } from "lucide-react";

const mockBuilds = [
  {
    id: "BLD-001",
    customer: "Dev Patel",
    bike: "Kawasaki ZX-10R",
    stage: "Chassis & suspension",
    technician: "Rohan",
    status: "In progress",
  },
  {
    id: "BLD-002",
    customer: "Sara Khan",
    bike: "Yamaha MT-09",
    stage: "Engine tuning",
    technician: "Akash",
    status: "Planning",
  },
];

const AdminBuilds = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Custom Builds
            </h1>
            <p className="text-muted-foreground">
              Track customer build projects and progress.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-flame hover:opacity-90">
                <Plus className="mr-1.5 h-4 w-4" />
                New build
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create build entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Customer name" />
                <Input placeholder="Bike model" />
                <div className="flex gap-3">
                  <Input placeholder="Assigned technician" className="flex-1" />
                  <Select defaultValue="Planning">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In progress">In progress</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Admin notes" rows={3} />
                <Button variant="outline" className="w-full justify-center">
                  <ImageUp className="mr-1.5 h-4 w-4" />
                  Upload progress media
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Factory className="h-4 w-4 text-primary" />
              Active builds
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Bike</TableHead>
                  <TableHead>Build stage</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBuilds.map((build) => (
                  <TableRow key={build.id}>
                    <TableCell className="font-mono text-xs">
                      {build.id}
                    </TableCell>
                    <TableCell>{build.customer}</TableCell>
                    <TableCell>{build.bike}</TableCell>
                    <TableCell>{build.stage}</TableCell>
                    <TableCell>{build.technician}</TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary border-primary/40">
                        {build.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBuilds;


