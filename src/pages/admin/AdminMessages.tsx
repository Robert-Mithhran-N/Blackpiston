import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessagesSquare, Search, Eye, Trash2, MailOpen, Mail } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminRequests, updateRequest, deleteRequest } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminMessages = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["adminRequests"],
    queryFn: async () => {
      const res = await fetchAdminRequests();
      const normalizedRequests = (res?.requests || []).map((req: any) => ({
        id: req.id,
        name: req.userName || req.name || "Unknown",
        email: req.userEmail || req.email || "No Email",
        phone: req.userPhone || req.phone || "",
        message: req.message || "",
        createdAt: req.createdAt,
        status: (req.requestStatus === "PENDING" || req.status === "Unread") ? "Unread" : "Read",
        rawRequest: req
      }));
      return {
        requests: normalizedRequests,
        pagination: res.pagination
      };
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      const backendStatus = data.status === "Unread" ? "PENDING" : "RESPONDED";
      return updateRequest(id, { status: backendStatus });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["adminRequests"] });
      const req = updated.request;
      const normalized = {
        id: req.id,
        name: req.userName || req.name || "Unknown",
        email: req.userEmail || req.email || "No Email",
        phone: req.userPhone || req.phone || "",
        message: req.message || "",
        createdAt: req.createdAt,
        status: (req.requestStatus === "PENDING" || req.status === "Unread") ? "Unread" : "Read",
        rawRequest: req
      };
      toast.success(`Message marked as ${normalized.status.toLowerCase()}`);
      if (isDetailsOpen && selectedMessage?.id === normalized.id) {
        setSelectedMessage(normalized);
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to update message"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRequests"] });
      toast.success("Message deleted successfully");
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      if (isDetailsOpen) setIsDetailsOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete message"),
  });

  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, data: { status: newStatus } });
  };

  const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  const handleViewMessage = (msg: any) => {
    setSelectedMessage(msg);
    setIsDetailsOpen(true);
    if (msg.status === "Unread") {
      handleStatusUpdate(msg.id, "Read");
    }
  };

  const filteredMessages = data?.requests?.filter((msg: any) => {
    const term = searchTerm.toLowerCase();
    return (
      msg.name?.toLowerCase().includes(term) ||
      msg.email?.toLowerCase().includes(term) ||
      msg.message?.toLowerCase().includes(term)
    );
  }) || [];

  const unreadCount = data?.requests?.filter((m: any) => m.status === "Unread")?.length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">
              View customer inquiries and contact requests.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            {unreadCount > 0 && (
              <Badge className="bg-primary/10 text-primary border border-primary/40 px-3 py-1">
                <Mail className="mr-2 h-4 w-4" />
                {unreadCount} Unread
              </Badge>
            )}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessagesSquare className="h-4 w-4 text-primary" />
                Inbox
              </div>
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
                Loading messages...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessagesSquare className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p>No messages found</p>
                {searchTerm ? (
                  <p className="text-sm mt-1">Try adjusting your search</p>
                ) : (
                  <p className="text-sm mt-1">Inbox is empty.</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Contact Info</TableHead>
                      <TableHead>Message Preview</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMessages.map((msg: any) => (
                      <TableRow 
                        key={msg.id} 
                        className={`group cursor-pointer ${msg.status === "Unread" ? "bg-muted/10 font-medium" : ""}`}
                        onClick={() => handleViewMessage(msg)}
                      >
                        <TableCell>
                          <div className={`text-foreground ${msg.status === "Unread" ? "font-semibold" : ""}`}>
                            {msg.name}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {msg.email}
                          </div>
                          {msg.phone && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {msg.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate text-sm">
                            {msg.message}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              msg.status === "Unread"
                                ? "bg-primary/10 text-primary border-primary/40"
                                : "bg-muted/60 text-muted-foreground border-border/60"
                            }
                          >
                            {msg.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            {msg.status === "Read" ? (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 hover:!bg-primary/20 hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(msg.id, "Unread");
                                }}
                                title="Mark as Unread"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 hover:!bg-primary/20 hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(msg.id, "Read");
                                }}
                                title="Mark as Read"
                              >
                                <MailOpen className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 hover:!bg-red-500/20 hover:text-red-500"
                              onClick={(e) => handleDeleteClick(msg.id, e)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

        {/* Message Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center mr-4">
                <span>Message Details</span>
                {selectedMessage && (
                  <Badge 
                    variant="outline"
                    className={
                      selectedMessage.status === "Unread"
                        ? "bg-primary/10 text-primary border-primary/40"
                        : "bg-muted/60 text-muted-foreground border-border/60"
                    }
                  >
                    {selectedMessage.status}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedMessage && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">From</span>
                    <span className="font-medium block">{selectedMessage.name}</span>
                    <span className="text-primary hover:underline cursor-pointer">
                      {selectedMessage.email}
                    </span>
                    {selectedMessage.phone && (
                      <span className="block text-muted-foreground mt-1">
                        {selectedMessage.phone}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Received</span>
                    <span className="font-medium block">
                      {format(new Date(selectedMessage.createdAt), "MMMM d, yyyy")}
                    </span>
                    <span className="text-muted-foreground">
                      {format(new Date(selectedMessage.createdAt), "h:mm a")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm border-b pb-1">Message</h4>
                  <div className="bg-muted/20 p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed border border-border/50">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t mt-4">
                  <Button 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => handleDeleteClick(selectedMessage.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                      Close
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() => {
                        window.location.href = `mailto:${selectedMessage.email}?subject=Re: Inquiry at BlackPiston Garage`;
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" /> Reply via Email
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Message</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this message? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
};

export default AdminMessages;


