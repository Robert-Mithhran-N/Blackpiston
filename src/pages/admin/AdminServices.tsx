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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Wrench } from "lucide-react";

const mockServices = [
  {
    id: "SRV-001",
    name: "Track setup & suspension tuning",
    category: "Track",
    price: "₹7,500",
    active: true,
  },
  {
    id: "SRV-002",
    name: "Street performance tune",
    category: "Street",
    price: "₹4,500",
    active: true,
  },
  {
    id: "SRV-003",
    name: "Major maintenance service",
    category: "Maintenance",
    price: "₹9,000",
    active: false,
  },
];

const AdminServices = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">
              Configure garage services and pricing.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-flame hover:opacity-90">
                <Plus className="mr-1.5 h-4 w-4" />
                Add service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add / Edit Service</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Service name" />
                <Textarea placeholder="Description" rows={3} />
                <div className="flex gap-3">
                  <Input placeholder="Price (optional)" className="flex-1" />
                  <Select defaultValue="Track">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Track">Track</SelectItem>
                      <SelectItem value="Street">Street</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              Service catalog
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-36">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockServices.map((srv) => (
                  <TableRow key={srv.id}>
                    <TableCell className="font-mono text-xs">
                      {srv.id}
                    </TableCell>
                    <TableCell>{srv.name}</TableCell>
                    <TableCell>{srv.category}</TableCell>
                    <TableCell>{srv.price}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          srv.active
                            ? "bg-green-500/10 text-green-400 border-green-500/40"
                            : "bg-muted/60 text-muted-foreground border-border/60"
                        }
                      >
                        {srv.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={srv.active} />
                        <Button size="xs" variant="outline">
                          Edit
                        </Button>
                      </div>
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

export default AdminServices;


