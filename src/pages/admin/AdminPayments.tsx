import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

// Types
type PaymentStatus = "Paid" | "Pending" | "Partial" | "Refunded";
type PaymentMethod = "Online" | "COD" | "Bank Transfer";

interface Payment {
  id: string;
  userId: string;
  username: string;
  contact: string;
  orderId: string;
  itemsOrdered: string;
  orderDate: string;
  amountDue: number;
  amountReceived: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

// Mock data
const mockPayments: Payment[] = [
  {
    id: "PAY-001",
    userId: "USR-001",
    username: "john_doe",
    contact: "+91 9876543210",
    orderId: "ORD-001",
    itemsOrdered: "Helmet (1), Jacket (1)",
    orderDate: "2025-01-15",
    amountDue: 15000,
    amountReceived: 15000,
    paymentMethod: "Online",
    paymentStatus: "Paid",
  },
  {
    id: "PAY-002",
    userId: "USR-002",
    username: "jane_smith",
    contact: "+91 9876543211",
    orderId: "ORD-002",
    itemsOrdered: "Boots (2), Gloves (2)",
    orderDate: "2025-01-16",
    amountDue: 8000,
    amountReceived: 4000,
    paymentMethod: "COD",
    paymentStatus: "Partial",
  },
  {
    id: "PAY-003",
    userId: "USR-003",
    username: "bob_wilson",
    contact: "+91 9876543212",
    orderId: "ORD-003",
    itemsOrdered: "Lights (1), Mounts (3)",
    orderDate: "2025-01-17",
    amountDue: 5000,
    amountReceived: 0,
    paymentMethod: "Bank Transfer",
    paymentStatus: "Pending",
  },
];

const AdminPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalDue = payments.reduce((sum, p) => sum + p.amountDue, 0);
    const totalReceived = payments.reduce((sum, p) => sum + p.amountReceived, 0);
    const onlinePayments = payments.filter((p) => p.paymentMethod === "Online").length;
    return { totalDue, totalReceived, onlinePayments };
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.username.toLowerCase().includes(query) ||
          p.orderId.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.contact.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.paymentStatus === statusFilter);
    }

    return filtered;
  }, [payments, searchQuery, statusFilter]);

  // Pagination
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredPayments.slice(start, end);
  }, [filteredPayments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize);

  // Handle delete
  const handleDelete = (paymentId: string) => {
    setPayments(payments.filter((p) => p.id !== paymentId));
    toast.success("Payment record deleted successfully");
  };

  // Handle export
  const handleExport = () => {
    toast.success("Export functionality coming soon");
  };

  // Status badge color
  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "Paid":
        return "bg-green-500/20 text-green-500 border-green-500/50";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "Partial":
        return "bg-orange-500/20 text-orange-500 border-orange-500/50";
      case "Refunded":
        return "bg-red-500/20 text-red-500 border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/50";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Status</h1>
            <p className="text-muted-foreground">Manage and track payment records</p>
          </div>
          <Button onClick={handleExport} className="bg-gradient-flame hover:opacity-90">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{kpis.totalDue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{kpis.totalReceived.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.onlinePayments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username, order ID, payment ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Amount Received</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        No payment records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="h-auto p-0 font-normal text-primary hover:underline"
                            onClick={() => toast.info(`Navigate to user: ${payment.username}`)}
                          >
                            {payment.username}
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm">{payment.contact}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="h-auto p-0 font-mono text-xs text-primary hover:underline"
                            onClick={() => toast.info(`Navigate to order: ${payment.orderId}`)}
                          >
                            {payment.orderId}
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm">{payment.itemsOrdered}</TableCell>
                        <TableCell className="text-sm">{payment.orderDate}</TableCell>
                        <TableCell className="font-medium">
                          ₹{payment.amountDue.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{payment.amountReceived.toLocaleString()}
                        </TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.paymentStatus)}>
                            {payment.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => toast.info(`View order: ${payment.orderId}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Order
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toast.info(`Edit payment: ${payment.id}`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(payment.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
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

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {paginatedPayments.length} of {filteredPayments.length} payments
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;