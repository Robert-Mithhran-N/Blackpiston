import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle2, XCircle, Clock } from "lucide-react";

const mockAppointments = [
  {
    id: "APT-001",
    customer: "Arjun Mehta",
    service: "Track setup & suspension",
    date: "2025-02-01 10:30",
    status: "Pending",
  },
  {
    id: "APT-002",
    customer: "Riya Sharma",
    service: "Street performance tune",
    date: "2025-02-02 14:00",
    status: "Approved",
  },
  {
    id: "APT-003",
    customer: "Karan Singh",
    service: "Major maintenance",
    date: "2025-02-03 11:00",
    status: "Completed",
  },
];

const AdminAppointments = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage garage and service bookings.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/40">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            Today&apos;s schedule
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer or date..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Appointment list
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAppointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-mono text-xs">
                        {apt.id}
                      </TableCell>
                      <TableCell>{apt.customer}</TableCell>
                      <TableCell>{apt.service}</TableCell>
                      <TableCell>{apt.date}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            apt.status === "Pending"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/40"
                              : apt.status === "Approved"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/40"
                              : apt.status === "Completed"
                              ? "bg-green-500/10 text-green-400 border-green-500/40"
                              : "bg-red-500/10 text-red-400 border-red-500/40"
                          }
                        >
                          {apt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="xs" variant="outline">
                            <CheckCircle2 className="mr-1.5 h-3 w-3" />
                            Approve
                          </Button>
                          <Button size="xs" variant="outline">
                            <XCircle className="mr-1.5 h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;


