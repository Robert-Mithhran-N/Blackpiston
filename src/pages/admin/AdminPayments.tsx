import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Download,
  MoreHorizontal,
  ArrowUpDown,
  Trash2,
  Eye,
  Edit,
  CheckCircle2,
  X,
  Filter,
  XCircle,
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
  address: string;
  orderId: string;
  itemsOrdered: string;
  orderDate: string;
  productReceivedDate: string | null;
  amountDue: number;
  amountReceived: number;
  amountReceivedDate: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

// Mock data - Replace with API call
const mockPayments: Payment[] = [
  {
    id: "PAY-001",
    userId: "USR-001",
    username: "john_doe",
    contact: "+91 9876543210 | john@example.com",
    address: "123 Main St, City, State 12345",
    orderId: "ORD-001",
    itemsOrdered: "Helmet (1), Jacket (1)",
    orderDate: "2025-01-15",
    productReceivedDate: "2025-01-20",
    amountDue: 15000,
    amountReceived: 15000,
    amountReceivedDate: "2025-01-15",
    paymentMethod: "Online",
    paymentStatus: "Paid",
  },
  {
    id: "PAY-002",
    userId: "USR-002",
    username: "jane_smith",
    contact: "+91 9876543211 | jane@example.com",
    address: "456 Oak Ave, City, State 12346",
    orderId: "ORD-002",
    itemsOrdered: "Boots (2), Gloves (2)",
    orderDate: "2025-01-16",
    productReceivedDate: null,
    amountDue: 8000,
    amountReceived: 4000,
    amountReceivedDate: "2025-01-16",
    paymentMethod: "COD",
    paymentStatus: "Partial",
  },
  {
    id: "PAY-003",
    userId: "USR-003",
    username: "bob_wilson",
    contact: "+91 9876543212 | bob@example.com",
    address: "789 Pine Rd, City, State 12347",
    orderId: "ORD-003",
    itemsOrdered: "Lights (1), Mounts (3)",
    orderDate: "2025-01-17",
    productReceivedDate: null,
    amountDue: 5000,
    amountReceived: 0,
    amountReceivedDate: null,
    paymentMethod: "Bank Transfer",
    paymentStatus: "Pending",
  },
];

const AdminPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus[]>([]);
  const [methodFilter, setMethodFilter] = useState<PaymentMethod[]>([]);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalDue = payments.reduce((sum, p) => sum + p.amountDue, 0);
    const totalReceived = payments.reduce((sum, p) => sum + p.amountReceived, 0);
    const onlinePayments = payments.filter((p) => p.paymentMethod === "Online").length;
    return { totalDue, totalReceived, onlinePayments };
  }, [payments]);

  // Filter and sort payments
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
    if (statusFilter.length > 0) {
      filtered = filtered.filter((p) => statusFilter.includes(p.paymentStatus));
    }

    // Method filter
    if (methodFilter.length > 0) {
      filtered = filtered.filter((p) => methodFilter.includes(p.paymentMethod));
    }

    // Sort
    if (sortField) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortField as keyof Payment];
        let bVal: any = b[sortField as keyof Payment];

        if (sortField === "orderDate" || sortField === "amountReceivedDate") {
          aVal = new Date(aVal || 0).getTime();
          bVal = new Date(bVal || 0).getTime();
        }

        if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [payments, searchQuery, statusFilter, methodFilter, sortField, sortDirection]);

  // Pagination
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredPayments.slice(start, end);
  }, [filteredPayments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize);

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle row selection
  const toggleRowSelection = (paymentId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(paymentId)) {
      newSelected.delete(paymentId);
    } else {
      newSelected.add(paymentId);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedPayments.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedPayments.map((p) => p.id)));
    }
  };

  // Handle delete
  const handleDelete = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (paymentToDelete) {
      setPayments(payments.filter((p) => p.id !== paymentToDelete));
      toast.success("Payment record deleted successfully");
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
      setSelectedRows(new Set());
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;
    setPayments(payments.filter((p) => !selectedRows.has(p.id)));
    toast.success(`${selectedRows.size} payment record(s) deleted successfully`);
    setSelectedRows(new Set());
  };

  // Handle navigation to user
  const handleUserClick = (userId: string) => {
    navigate(`/admin/users#user-${userId}`);
    // Scroll to user after navigation
    setTimeout(() => {
      const element = document.getElementById(`user-${userId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // Fallback: navigate to user detail page
        navigate(`/admin/users/${userId}`);
      }
    }, 100);
  };

  // Handle PDF export
  const handleExportPDF = async (selectedOnly = false) => {
    setIsExporting(true);
    try {
      // Dynamic import of jsPDF
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text("BlackPiston Garage", 14, 20);
      doc.setFontSize(12);
      doc.text("Payment Status Report", 14, 28);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

      // Filters info
      let yPos = 42;
      if (searchQuery || statusFilter.length > 0 || methodFilter.length > 0) {
        doc.setFontSize(10);
        doc.text("Filters Applied:", 14, yPos);
        yPos += 6;
        if (searchQuery) {
          doc.text(`Search: ${searchQuery}`, 20, yPos);
          yPos += 6;
        }
        if (statusFilter.length > 0) {
          doc.text(`Status: ${statusFilter.join(", ")}`, 20, yPos);
          yPos += 6;
        }
        if (methodFilter.length > 0) {
          doc.text(`Method: ${methodFilter.join(", ")}`, 20, yPos);
          yPos += 6;
        }
        yPos += 4;
      }

      // Table data
      const dataToExport = selectedOnly
        ? filteredPayments.filter((p) => selectedRows.has(p.id))
        : filteredPayments;

      if (dataToExport.length === 0) {
        doc.text("No data to export", 14, yPos);
        doc.save("payment-status-report.pdf");
        setIsExporting(false);
        return;
      }

      // Table headers
      const headers = [
        "Payment ID",
        "Username",
        "Order ID",
        "Amount Due",
        "Amount Received",
        "Status",
        "Method",
      ];

      // Table rows
      const rows = dataToExport.map((p) => [
        p.id,
        p.username,
        p.orderId,
        `₹${p.amountDue.toLocaleString()}`,
        `₹${p.amountReceived.toLocaleString()}`,
        p.paymentStatus,
        p.paymentMethod,
      ]);

      // Simple table (jsPDF doesn't have built-in table, so we'll create a simple one)
      doc.setFontSize(8);
      let startY = yPos + 10;
      const rowHeight = 7;
      const colWidths = [25, 30, 25, 25, 25, 20, 25];
      let xPos = 14;

      // Headers
      headers.forEach((header, i) => {
        doc.rect(xPos, startY, colWidths[i], rowHeight);
        doc.text(header, xPos + 2, startY + 5);
        xPos += colWidths[i];
      });

      // Rows
      rows.forEach((row, rowIndex) => {
        startY += rowHeight;
        xPos = 14;
        row.forEach((cell, colIndex) => {
          doc.rect(xPos, startY, colWidths[colIndex], rowHeight);
          doc.text(String(cell), xPos + 2, startY + 5);
          xPos += colWidths[colIndex];
        });

        // New page if needed
        if (startY > 270) {
          doc.addPage();
          startY = 20;
        }
      });

      doc.save(`payment-status-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success(`PDF exported successfully (${dataToExport.length} records)`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF. Please install jspdf: npm install jspdf");
    } finally {
      setIsExporting(false);
    }
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
          <Button
            onClick={() => handleExportPDF(false)}
            disabled={isExporting}
            className="bg-gradient-flame hover:opacity-90"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Download Data"}
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

        {/* Filters and Search */}
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
                    placeholder="Search by username, order ID, payment ID, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={statusFilter.join(",") || "all"}
                onValueChange={(value) =>
                  setStatusFilter(value === "all" ? [] : (value.split(",") as PaymentStatus[]))
                }
              >
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
              <Select
                value={methodFilter.join(",") || "all"}
                onValueChange={(value) =>
                  setMethodFilter(value === "all" ? [] : (value.split(",") as PaymentMethod[]))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="COD">COD</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchQuery || statusFilter.length > 0 || methodFilter.length > 0) && (
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter([]);
                    setMethodFilter([]);
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedRows.size > 0 && (
          <Card className="bg-primary/10 border-primary/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedRows.size} payment(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportPDF(true)}
                    disabled={isExporting}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRows.size === paginatedPayments.length && paginatedPayments.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("id")}
                      >
                        Payment ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("username")}
                      >
                        Username
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Items Ordered</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("orderDate")}
                      >
                        Order Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Product Received</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("amountDue")}
                      >
                        Amount Due
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort("amountReceived")}
                      >
                        Amount Received
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Received Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={16} className="text-center py-8 text-muted-foreground">
                        No payment records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.has(payment.id)}
                            onCheckedChange={() => toggleRowSelection(payment.id)}
                            aria-label={`Select ${payment.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="h-auto p-0 font-normal text-primary hover:underline"
                            onClick={() => handleUserClick(payment.userId)}
                          >
                            {payment.username}
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm">{payment.contact}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {payment.address}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="h-auto p-0 font-mono text-xs text-primary hover:underline"
                            onClick={() => navigate(`/admin/orders?orderId=${payment.orderId}`)}
                          >
                            {payment.orderId}
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm">{payment.itemsOrdered}</TableCell>
                        <TableCell className="text-sm">{payment.orderDate}</TableCell>
                        <TableCell className="text-sm">
                          {payment.productReceivedDate || (
                            <span className="text-muted-foreground">Not received</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{payment.amountDue.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{payment.amountReceived.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.amountReceivedDate || (
                            <span className="text-muted-foreground">-</span>
                          )}
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
                                onClick={() => navigate(`/admin/orders?orderId=${payment.orderId}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Order
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Note
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment record? This action cannot be undone.
              An audit log entry will be created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminPayments;




