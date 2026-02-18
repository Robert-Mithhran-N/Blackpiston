import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MessageSquare,
    ArrowLeft,
    User,
    Calendar,
    Phone,
    Trash2,
    Clock,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAdminRequests, updateRequest } from "@/lib/api";
import { ProductRequest, RequestStatus } from "@/types/admin";

// ============================================================
// Status Color Helper
// ============================================================
const getStatusColor = (status: RequestStatus) => {
    switch (status) {
        case "Pending":
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
        case "Approved":
            return "bg-blue-500/20 text-blue-400 border-blue-500/50";
        case "Completed":
            return "bg-green-500/20 text-green-400 border-green-500/50";
        case "Rejected":
            return "bg-red-500/20 text-red-400 border-red-500/50";
        default:
            return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
};

const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
        case "Pending":
            return <Clock className="h-3.5 w-3.5" />;
        case "Completed":
            return <CheckCircle className="h-3.5 w-3.5" />;
        default:
            return null;
    }
};

// ============================================================
// Request Card Component
// ============================================================
interface RequestCardProps {
    request: ProductRequest;
    onStatusChange: (id: string, status: RequestStatus) => void;
    onDelete: (id: string) => void;
    loading?: boolean;
}

const RequestCard = ({
    request,
    onStatusChange,
    onDelete,
    loading,
}: RequestCardProps) => {
    const { id, productName, requestedBy, userPhone, requestDate, status } = request;

    return (
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg border-2 border-border hover:border-primary/30 flex flex-col">
            <CardContent className="p-6 flex flex-col flex-1">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <>
                        {/* Icon */}
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4 bg-purple-500/10">
                            <MessageSquare className="h-6 w-6 text-purple-500" />
                        </div>

                        {/* Product Name */}
                        <h3 className="font-semibold text-lg mb-3 line-clamp-2">{productName}</h3>

                        {/* Requested By */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <User className="h-4 w-4" />
                            <span>{requestedBy}</span>
                        </div>

                        {/* Mobile Number */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Phone className="h-4 w-4" />
                            <span className="text-primary">{userPhone}</span>
                        </div>

                        {/* Request Date */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Calendar className="h-4 w-4" />
                            <span>{requestDate}</span>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4">
                            <Badge className={`${getStatusColor(status)} flex items-center gap-1.5 w-fit`}>
                                {getStatusIcon(status)}
                                {status}
                            </Badge>
                        </div>

                        {/* Spacer to push actions to bottom */}
                        <div className="flex-1" />

                        {/* Actions Section */}
                        <div className="pt-4 border-t border-border/50 space-y-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Admin Actions
                            </p>

                            {/* Status Dropdown */}
                            <div className="flex items-center gap-2">
                                <Select
                                    value={status}
                                    onValueChange={(value) => onStatusChange(id, value as RequestStatus)}
                                >
                                    <SelectTrigger
                                        className="flex-1 h-9 text-sm"
                                        aria-label={`Change status for ${productName}`}
                                    >
                                        <SelectValue placeholder="Update Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5 text-yellow-500" />
                                                <span>Pending</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Completed">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                                <span>Completed</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Delete Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50"
                                onClick={() => onDelete(id)}
                                aria-label={`Delete request for ${productName}`}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Request
                            </Button>
                        </div>

                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 opacity-30" />
                    </>
                )}
            </CardContent>
        </Card>
    );
};

// ============================================================
// Delete Confirmation Modal
// ============================================================
interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    productName: string;
}

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, productName }: DeleteModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Request
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Are you sure you want to delete this request?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                        <p className="text-sm font-medium line-clamp-2">{productName}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                        This action cannot be undone. The request will be permanently removed.
                    </p>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 sm:flex-none"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="flex-1 sm:flex-none"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ============================================================
// Product Requests Page
// ============================================================
const AdminRequests = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [requests, setRequests] = useState<ProductRequest[]>([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<ProductRequest | null>(null);

    // Fetch requests from API
    useEffect(() => {
        setIsLoading(true);
        fetchAdminRequests()
            .then((data) => setRequests(data.requests || []))
            .catch((err) => console.error("Failed to load requests:", err))
            .finally(() => setIsLoading(false));
    }, []);

    // Calculate counts
    const pendingCount = requests.filter((r) => r.status === "Pending").length;
    const completedCount = requests.filter((r) => r.status === "Completed").length;

    // Handle status change
    const handleStatusChange = (id: string, newStatus: RequestStatus) => {
        updateRequest(id, { status: newStatus })
            .then(() => {
                setRequests((prev) =>
                    prev.map((request) =>
                        request.id === id ? { ...request, status: newStatus } : request
                    )
                );
                toast.success(`Request status updated to ${newStatus}`);
            })
            .catch(() => toast.error("Failed to update request status"));
    };

    // Handle delete initiation
    const handleDeleteClick = (id: string) => {
        const request = requests.find((r) => r.id === id);
        if (request) {
            setRequestToDelete(request);
            setDeleteModalOpen(true);
        }
    };

    // Handle delete confirmation
    const handleDeleteConfirm = () => {
        if (requestToDelete) {
            setRequests((prev) => prev.filter((r) => r.id !== requestToDelete.id));
            toast.success("Request deleted successfully");
            setDeleteModalOpen(false);
            setRequestToDelete(null);
        }
    };

    // Handle modal close
    const handleModalClose = () => {
        setDeleteModalOpen(false);
        setRequestToDelete(null);
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Link to="/admin">
                        <Button variant="outline" size="icon" className="h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Product Requests</h1>
                        <p className="text-muted-foreground mt-1">Manage user product requests</p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Total Requests */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-purple-500/50 bg-purple-500/5">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            {isLoading ? (
                                <Skeleton className="h-6 w-12" />
                            ) : (
                                <p className="text-xl font-bold text-purple-400">{requests.length}</p>
                            )}
                            <p className="text-sm text-muted-foreground">Total Requests</p>
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
                        <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                            {isLoading ? (
                                <Skeleton className="h-6 w-12" />
                            ) : (
                                <p className="text-xl font-bold text-yellow-400">{pendingCount}</p>
                            )}
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-green-500/50 bg-green-500/5">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            {isLoading ? (
                                <Skeleton className="h-6 w-12" />
                            ) : (
                                <p className="text-xl font-bold text-green-400">{completedCount}</p>
                            )}
                            <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                    </div>
                </div>

                {/* Request Cards Grid */}
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array(6)
                            .fill(0)
                            .map((_, i) => (
                                <RequestCard
                                    key={i}
                                    request={{
                                        id: "",
                                        productName: "",
                                        requestedBy: "",
                                        userEmail: "",
                                        userPhone: "",
                                        requestDate: "",
                                        status: "Pending",
                                    }}
                                    onStatusChange={() => { }}
                                    onDelete={() => { }}
                                    loading={true}
                                />
                            ))}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border rounded-lg">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Product Requests</h3>
                        <p className="text-muted-foreground">No product requests from users at the moment</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {requests.map((request) => (
                            <RequestCard
                                key={request.id}
                                request={request}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={handleModalClose}
                onConfirm={handleDeleteConfirm}
                productName={requestToDelete?.productName || ""}
            />
        </AdminLayout>
    );
};

export default AdminRequests;
