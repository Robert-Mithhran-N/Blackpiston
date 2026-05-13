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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, CheckCircle2, XCircle, Clock, Eye, Ban } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminAppointments, updateAppointment } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminAppointments = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Details Modal
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["adminAppointments", statusFilter],
    queryFn: () => fetchAdminAppointments({ 
      status: statusFilter === "all" ? undefined : statusFilter
    }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAppointment(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["adminAppointments"] });
      toast.success(`Appointment ${updated.appointment.status.toLowerCase()}`);
      if (isDetailsOpen && selectedAppointment?.id === updated.appointment.id) {
        setSelectedAppointment(updated.appointment);
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to update appointment"),
  });

  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, data: { status: newStatus } });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pending":
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  // Filter local data based on specific search (as backend currently doesn't search appointments)
  const filteredAppointments = data?.appointments?.filter((apt: any) => {
    const term = searchTerm.toLowerCase();
    return (
      apt.user?.name?.toLowerCase().includes(term) ||
      apt.guestName?.toLowerCase().includes(term) ||
      apt.service?.name?.toLowerCase().includes(term) ||
      apt.id.toLowerCase().includes(term)
    );
  }) || [];

  const todayCount = data?.appointments?.filter((apt: any) => {
    const aptDate = new Date(apt.appointmentDate).toDateString();
    const today = new Date().toDateString();
    return aptDate === today && apt.status !== "Cancelled" && apt.status !== "Rejected";
  })?.length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage garage and service bookings.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/40 px-3 py-1 text-sm font-medium">
            <Clock className="mr-2 h-4 w-4" />
            {todayCount} Today
          </Badge>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
            <CardTitle className="text-sm font-medium">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row pt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, customer, or service..."
                  className="pl-10 lg:max-w-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled/Rejected</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Appointment List</span>
              {data?.pagination?.total !== undefined && (
                <Badge variant="secondary" className="font-mono text-xs">
                  Total: {data.pagination.total}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                Loading appointments...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p>No appointments found</p>
                {searchTerm || statusFilter !== "all" ? (
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                ) : (
                  <p className="text-sm mt-1">Customers haven't booked any slots yet</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Req ID / Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right w-48">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((apt: any) => (
                      <TableRow key={apt.id} className="group">
                        <TableCell>
                          <div className="font-mono text-xs text-muted-foreground/50 mb-1">
                            {apt.id}
                          </div>
                          <div className="font-medium text-foreground">
                            {format(new Date(apt.appointmentDate), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(apt.appointmentDate), "h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {apt.user?.name || apt.guestName || "Guest"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {apt.user?.phone || apt.guestPhone || "No phone"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {apt.service?.name || "General Service"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Vehicle: {apt.vehicleModel || "Unspecified"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-normal ${getStatusColor(apt.status)}`}>
                            {apt.status || "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 hover:!bg-primary/20 hover:text-primary"
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setIsDetailsOpen(true);
                              }}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {apt.status === "Pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 px-2 text-green-500 hover:text-green-600 hover:bg-green-500/10 border-green-500/20"
                                  onClick={() => handleStatusUpdate(apt.id, "Approved")}
                                  disabled={updateMutation.isPending}
                                  title="Approve"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
                                  onClick={() => handleStatusUpdate(apt.id, "Rejected")}
                                  disabled={updateMutation.isPending}
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}

                            {apt.status === "Approved" && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 border-blue-500/20"
                                onClick={() => handleStatusUpdate(apt.id, "Completed")}
                                disabled={updateMutation.isPending}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center mr-4">
                <span>Appointment Details</span>
                {selectedAppointment && (
                  <Badge className={`${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedAppointment && (
              <div className="space-y-4 py-4 text-sm">
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Date & Time</span>
                    <span className="font-medium">
                      {format(new Date(selectedAppointment.appointmentDate), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Appointment ID</span>
                    <span className="font-mono text-xs">{selectedAppointment.id}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium border-b pb-1">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">
                      {selectedAppointment.user?.name || selectedAppointment.guestName || "Guest"}
                    </span>
                    
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">
                      {selectedAppointment.user?.email || selectedAppointment.guestEmail || "No email"}
                    </span>
                    
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">
                      {selectedAppointment.user?.phone || selectedAppointment.guestPhone || "No phone"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium border-b pb-1">Service Details</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Service Requested:</span>
                    <span className="font-medium">
                      {selectedAppointment.service?.name || "General Service"}
                    </span>
                    
                    <span className="text-muted-foreground">Vehicle Model:</span>
                    <span className="font-medium">
                      {selectedAppointment.vehicleModel || "Unspecified"}
                    </span>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div className="space-y-2">
                    <h4 className="font-medium border-b pb-1">Customer Notes</h4>
                    <p className="bg-muted/30 p-3 rounded text-muted-foreground italic text-sm">
                      "{selectedAppointment.notes}"
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                  {selectedAppointment.status === "Pending" && (
                    <>
                      <Button 
                        variant="destructive"
                        className="opacity-80 hover:opacity-100"
                        onClick={() => handleStatusUpdate(selectedAppointment.id, "Rejected")}
                        disabled={updateMutation.isPending}
                      >
                        <Ban className="mr-2 h-4 w-4" /> Reject
                      </Button>
                      <Button 
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleStatusUpdate(selectedAppointment.id, "Approved")}
                        disabled={updateMutation.isPending}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                      </Button>
                    </>
                  )}
                  {selectedAppointment.status === "Approved" && (
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() => handleStatusUpdate(selectedAppointment.id, "Completed")}
                      disabled={updateMutation.isPending}
                    >
                      Mark as Completed
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;


