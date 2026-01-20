import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    Search,
    RotateCcw,
    Package,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Eye,
    Edit,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { allRMAs } from "@/data/adminMockData";
import { RMA, RMAStatus } from "@/types/admin";

// RMA Status steps
const rmaSteps: RMAStatus[] = ['Requested', 'Approved', 'Received', 'Refunded'];
const rmaRejectStep: RMAStatus = 'Rejected';
const rmaReplaceStep: RMAStatus = 'Replaced';

// Status colors
const getRMAStatusColor = (status: RMAStatus) => {
    switch (status) {
        case 'Requested': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        case 'Approved': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        case 'Rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
        case 'Received': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
        case 'Refunded': return 'bg-green-500/20 text-green-400 border-green-500/50';
        case 'Replaced': return 'bg-green-500/20 text-green-400 border-green-500/50';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
};

// RMA Workflow Stepper
const RMAStepper = ({ currentStatus, resolution }: { currentStatus: RMAStatus; resolution?: 'Refund' | 'Replace' }) => {
    const isRejected = currentStatus === 'Rejected';

    if (isRejected) {
        return (
            <div className="flex items-center gap-2 text-red-500">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">RMA Rejected</span>
            </div>
        );
    }

    const steps = [...rmaSteps];
    if (resolution === 'Replace') {
        steps[steps.length - 1] = 'Replaced';
    }

    const currentIndex = steps.indexOf(currentStatus);

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;

                return (
                    <div key={step} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`
                  h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border-2
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-primary border-primary text-primary-foreground' : ''}
                  ${!isCompleted && !isCurrent ? 'border-border text-muted-foreground' : ''}
                `}
                            >
                                {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                            </div>
                            <span className={`text-xs mt-1 whitespace-nowrap ${isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                {step}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-border'
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const AdminReturns = () => {
    const [rmas, setRmas] = useState<RMA[]>(allRMAs);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedRMA, setSelectedRMA] = useState<RMA | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Stats
    const stats = useMemo(() => {
        const total = rmas.length;
        const pending = rmas.filter(r => r.status === 'Requested').length;
        const approved = rmas.filter(r => r.status === 'Approved' || r.status === 'Received').length;
        const totalRefunded = rmas.filter(r => r.status === 'Refunded').reduce((sum, r) => sum + (r.refundAmount || 0), 0);
        return { total, pending, approved, totalRefunded };
    }, [rmas]);

    // Filter RMAs
    const filteredRMAs = useMemo(() => {
        let filtered = [...rmas];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (rma) =>
                    rma.id.toLowerCase().includes(query) ||
                    rma.orderId.toLowerCase().includes(query) ||
                    rma.customerName.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((rma) => rma.status === statusFilter);
        }

        return filtered;
    }, [rmas, searchQuery, statusFilter]);

    // Handlers
    const handleViewRMA = (rma: RMA) => {
        setSelectedRMA(rma);
        setIsDetailOpen(true);
    };

    const handleUpdateStatus = (rmaId: string, newStatus: RMAStatus) => {
        setRmas(rmas.map(r =>
            r.id === rmaId ? { ...r, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : r
        ));
        if (selectedRMA?.id === rmaId) {
            setSelectedRMA({ ...selectedRMA, status: newStatus });
        }
        toast.success(`RMA status updated to ${newStatus}`);
    };

    const handleApproveRMA = (rmaId: string, resolution: 'Refund' | 'Replace') => {
        setRmas(rmas.map(r =>
            r.id === rmaId ? { ...r, status: 'Approved', resolution, updatedAt: new Date().toISOString().split('T')[0] } : r
        ));
        toast.success(`RMA approved for ${resolution.toLowerCase()}`);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Returns & RMA</h1>
                        <p className="text-muted-foreground">Manage product returns and refunds</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total RMAs</CardTitle>
                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Processing</CardTitle>
                            <Package className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">{stats.approved}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">₹{stats.totalRefunded.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by RMA ID, order ID, or customer name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Requested">Requested</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                    <SelectItem value="Received">Received</SelectItem>
                                    <SelectItem value="Refunded">Refunded</SelectItem>
                                    <SelectItem value="Replaced">Replaced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* RMAs Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>RMA ID</TableHead>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Resolution</TableHead>
                                        <TableHead className="w-12">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRMAs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                No RMA requests found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRMAs.map((rma) => (
                                            <TableRow
                                                key={rma.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => handleViewRMA(rma)}
                                            >
                                                <TableCell className="font-mono text-xs font-medium">{rma.id}</TableCell>
                                                <TableCell>
                                                    <Link
                                                        to="/admin/orders"
                                                        className="font-mono text-xs text-primary hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {rma.orderId}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        to={`/admin/customers/${rma.customerId}`}
                                                        className="text-primary hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {rma.customerName}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{rma.items.length} item(s)</TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {rma.reason}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getRMAStatusColor(rma.status)}>{rma.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {rma.resolution ? (
                                                        <Badge variant="secondary">{rma.resolution}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewRMA(rma)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            {rma.status === 'Requested' && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleApproveRMA(rma.id, 'Refund')}>
                                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                        Approve (Refund)
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleApproveRMA(rma.id, 'Replace')}>
                                                                        <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                                                                        Approve (Replace)
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-destructive"
                                                                        onClick={() => handleUpdateStatus(rma.id, 'Rejected')}
                                                                    >
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        Reject
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {rma.status === 'Approved' && (
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(rma.id, 'Received')}>
                                                                    <Package className="mr-2 h-4 w-4" />
                                                                    Mark Received
                                                                </DropdownMenuItem>
                                                            )}
                                                            {rma.status === 'Received' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleUpdateStatus(rma.id, rma.resolution === 'Replace' ? 'Replaced' : 'Refunded')}
                                                                >
                                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                    Complete {rma.resolution}
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* RMA Detail Modal */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-2xl">
                        {selectedRMA && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        RMA {selectedRMA.id}
                                        <Badge className={getRMAStatusColor(selectedRMA.status)}>
                                            {selectedRMA.status}
                                        </Badge>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Return request for order {selectedRMA.orderId}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Workflow Stepper */}
                                    <div className="p-4 rounded-lg border border-border bg-muted/30">
                                        <h4 className="text-sm font-medium mb-4">RMA Status</h4>
                                        <RMAStepper currentStatus={selectedRMA.status} resolution={selectedRMA.resolution} />
                                    </div>

                                    {/* Customer & Order Info */}
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-3">
                                            <h4 className="font-medium">Customer</h4>
                                            <div className="p-4 rounded-lg border border-border">
                                                <p className="font-medium">{selectedRMA.customerName}</p>
                                                <Link
                                                    to={`/admin/customers/${selectedRMA.customerId}`}
                                                    className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
                                                >
                                                    View Profile <ChevronRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="font-medium">Original Order</h4>
                                            <div className="p-4 rounded-lg border border-border">
                                                <p className="font-mono text-sm">{selectedRMA.orderId}</p>
                                                <Link
                                                    to="/admin/orders"
                                                    className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
                                                >
                                                    View Order <ChevronRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Return Reason</h4>
                                        <div className="p-4 rounded-lg border border-border bg-muted/30">
                                            <p className="text-sm">{selectedRMA.reason}</p>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Items to Return</h4>
                                        <div className="border border-border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Product</TableHead>
                                                        <TableHead>SKU</TableHead>
                                                        <TableHead className="text-center">Qty</TableHead>
                                                        <TableHead>Item Reason</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedRMA.items.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="font-medium">{item.productName}</TableCell>
                                                            <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">{item.reason}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Resolution Info */}
                                    {selectedRMA.resolution && (
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="p-4 rounded-lg border border-border">
                                                <p className="text-sm text-muted-foreground">Resolution Type</p>
                                                <p className="text-xl font-bold">{selectedRMA.resolution}</p>
                                            </div>
                                            {selectedRMA.refundAmount && (
                                                <div className="p-4 rounded-lg border border-border">
                                                    <p className="text-sm text-muted-foreground">Refund Amount</p>
                                                    <p className="text-xl font-bold text-green-500">
                                                        ₹{selectedRMA.refundAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                                        Close
                                    </Button>
                                    {selectedRMA.status === 'Requested' && (
                                        <>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    handleUpdateStatus(selectedRMA.id, 'Rejected');
                                                    setIsDetailOpen(false);
                                                }}
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Reject
                                            </Button>
                                            <Button
                                                className="bg-gradient-flame hover:opacity-90"
                                                onClick={() => {
                                                    handleApproveRMA(selectedRMA.id, 'Refund');
                                                    setIsDetailOpen(false);
                                                }}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Approve
                                            </Button>
                                        </>
                                    )}
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminReturns;
