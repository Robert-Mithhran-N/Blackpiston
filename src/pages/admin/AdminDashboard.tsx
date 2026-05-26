import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  AlertTriangle,
  MessageSquare,
  Bell,
  CreditCard,
  Banknote,
  Wallet,
  TrendingUp,
  Plus,
  Check,
  Clock,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import {
  fetchDashboardStats,
  fetchLowStockProducts,
  fetchAdminRequests,
  fetchAdminPayments,
} from "@/lib/api";
import { CODPayment, SalesDataPoint } from "@/types/admin";

// ============================================================
// Dashboard Card Component
// ============================================================
interface DashboardCardProps {
  title: string;
  count: number | string;
  icon: React.ElementType;
  href: string;
  colorClass: string;
  bgColorClass: string;
  loading?: boolean;
  isWarning?: boolean;
}

const DashboardCard = ({
  title,
  count,
  icon: Icon,
  href,
  colorClass,
  bgColorClass,
  loading,
  isWarning,
}: DashboardCardProps) => {
  return (
    <Link to={href} className="block group">
      <Card
        className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer border-2 ${isWarning ? "border-yellow-500/50 hover:border-yellow-500" : "border-border hover:border-primary/50"
          }`}
      >
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <div
                className={`h-14 w-14 rounded-xl flex items-center justify-center mb-4 ${bgColorClass} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className={`h-7 w-7 ${colorClass}`} />
              </div>
              <div className={`text-4xl font-bold mb-2 ${colorClass}`}>
                {typeof count === "number" ? count.toLocaleString() : count}
              </div>
              <p className="text-muted-foreground font-medium">{title}</p>
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 ${colorClass.replace(
                  "text-",
                  "bg-"
                )} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

// ============================================================
// KPI Card Component
// ============================================================
interface KPICardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  colorClass: string;
  bgColorClass: string;
  loading?: boolean;
}

const KPICard = ({ title, value, icon: Icon, colorClass, bgColorClass, loading }: KPICardProps) => (
  <Card className="border-2 border-border">
    <CardContent className="p-4 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bgColorClass}`}>
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
      <div>
        {loading ? (
          <>
            <Skeleton className="h-6 w-24 mb-1" />
            <Skeleton className="h-4 w-20" />
          </>
        ) : (
          <>
            <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </>
        )}
      </div>
    </CardContent>
  </Card>
);

// ============================================================
// Main Dashboard Component
// ============================================================
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSummary, setPaymentSummary] = useState({ onlineTotal: 0, codTotal: 0, combinedTotal: 0 });
  const [codPayments, setCodPayments] = useState<CODPayment[]>([]);
  const [isCODModalOpen, setIsCODModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [totalOrders, setTotalOrders] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [salesData, setSalesData] = useState<Record<string, SalesDataPoint[]>>({
    weekly: [], monthly: [], yearly: [],
  });

  // COD form state
  const [codForm, setCodForm] = useState({
    orderId: "",
    amount: "",
    dateReceived: new Date().toISOString().split("T")[0],
  });

  // Fetch dashboard data from API
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchDashboardStats(),
      fetchLowStockProducts(),
      fetchAdminRequests(),
      fetchAdminPayments(),
    ])
      .then(([statsData, lowStockData, requestsData, paymentsData]) => {
        // Dashboard stats
        const totalOrd = statsData.dashboardStats?.totalOrders || 0;
        setTotalOrders(totalOrd);
        setLowStockCount(lowStockData.lowStockProducts?.length || 0);
        setRequestsCount(requestsData.pagination?.total || requestsData.requests?.length || 0);

        // Payment summary
        const payments = paymentsData.payments || [];
        const onlineTotal = payments
          .filter((p: any) => p.paymentMethod !== 'COD')
          .reduce((sum: number, p: any) => sum + (p.amountReceived || 0), 0);
        const codTotal = payments
          .filter((p: any) => p.paymentMethod === 'COD')
          .reduce((sum: number, p: any) => sum + (p.amountReceived || 0), 0);
        setPaymentSummary({ onlineTotal, codTotal, combinedTotal: onlineTotal + codTotal });

        // Generate sales data from stats (or use provided)
        if (statsData.salesData) {
          setSalesData(statsData.salesData);
        } else {
          // Fallback placeholder sales data
          setSalesData({
            weekly: [
              { period: "Mon", unitsSold: totalOrd ? Math.round(totalOrd / 7) : 0 },
              { period: "Tue", unitsSold: 0 }, { period: "Wed", unitsSold: 0 },
              { period: "Thu", unitsSold: 0 }, { period: "Fri", unitsSold: 0 },
              { period: "Sat", unitsSold: 0 }, { period: "Sun", unitsSold: 0 },
            ],
            monthly: [{ period: "This Month", unitsSold: totalOrd }],
            yearly: [{ period: "This Year", unitsSold: totalOrd }],
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
        toast.error("Failed to load dashboard data");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // COD Payment handler
  const handleAddCOD = () => {
    const amount = parseFloat(codForm.amount);
    if (!codForm.orderId || isNaN(amount) || amount <= 0) {
      toast.error("Please fill all fields correctly");
      return;
    }

    const newCOD: CODPayment = {
      id: `COD-${String(codPayments.length + 1).padStart(3, "0")}`,
      orderId: codForm.orderId,
      amount,
      dateReceived: codForm.dateReceived,
      createdAt: new Date().toISOString(),
    };

    setCodPayments([...codPayments, newCOD]);
    setPaymentSummary((prev) => ({
      ...prev,
      codTotal: prev.codTotal + amount,
      combinedTotal: prev.combinedTotal + amount,
    }));

    setCodForm({ orderId: "", amount: "", dateReceived: new Date().toISOString().split("T")[0] });
    setIsCODModalOpen(false);
    toast.success("COD payment added successfully");
  };

  // Get current sales data
  const currentSalesData: SalesDataPoint[] = salesData[selectedRange];
  const totalUnitsSold = currentSalesData.reduce((sum, d) => sum + d.unitsSold, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Select a section to manage.</p>
          </div>
        </div>

        {/* Dashboard Cards Grid - Main 3 Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Orders"
            count={totalOrders}
            icon={ShoppingCart}
            href="/admin/orders"
            colorClass="text-blue-500"
            bgColorClass="bg-blue-500/10"
            loading={isLoading}
          />
          <DashboardCard
            title="Low Stock Alerts"
            count={lowStockCount}
            icon={AlertTriangle}
            href="/admin/low-stock"
            colorClass="text-yellow-500"
            bgColorClass="bg-yellow-500/10"
            loading={isLoading}
            isWarning={lowStockCount > 0}
          />
          <DashboardCard
            title="Product Requests"
            count={requestsCount}
            icon={MessageSquare}
            href="/admin/requests"
            colorClass="text-purple-500"
            bgColorClass="bg-purple-500/10"
            loading={isLoading}
          />
        </div>

        {/* Payment Summary Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Payment Summary
              </CardTitle>
              <CardDescription>Revenue breakdown by payment method</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCODModalOpen(true)}
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add COD Payment
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <KPICard
                title="Online Payments"
                value={formatCurrency(paymentSummary.onlineTotal)}
                icon={CreditCard}
                colorClass="text-green-500"
                bgColorClass="bg-green-500/10"
                loading={isLoading}
              />
              <KPICard
                title="COD Payments"
                value={formatCurrency(paymentSummary.codTotal)}
                icon={Banknote}
                colorClass="text-orange-500"
                bgColorClass="bg-orange-500/10"
                loading={isLoading}
              />
              <KPICard
                title="Total Revenue"
                value={formatCurrency(paymentSummary.combinedTotal)}
                icon={TrendingUp}
                colorClass="text-primary"
                bgColorClass="bg-primary/10"
                loading={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sales Graph Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Products Sold Analytics
              </CardTitle>
              <CardDescription>
                Total units sold: <span className="font-semibold text-foreground">{totalUnitsSold.toLocaleString()}</span>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedRange} onValueChange={(v) => setSelectedRange(v as "weekly" | "monthly" | "yearly")}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Select value={chartType} onValueChange={(v) => setChartType(v as "bar" | "line")}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart data={currentSalesData}>
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number, name: string) => [
                          name === "unitsSold" ? `${value} units` : `${value}%`,
                          name === "unitsSold" ? "Units Sold" : "Percentage",
                        ]}
                      />
                      <Bar dataKey="unitsSold" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={currentSalesData}>
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number, name: string) => [
                          name === "unitsSold" ? `${value} units` : `${value}%`,
                          name === "unitsSold" ? "Units Sold" : "Percentage",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="unitsSold"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* COD Payment Modal */}
        <Dialog open={isCODModalOpen} onOpenChange={setIsCODModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add COD Payment</DialogTitle>
              <DialogDescription>Record a Cash on Delivery payment received</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID *</Label>
                <Input
                  id="orderId"
                  value={codForm.orderId}
                  onChange={(e) => setCodForm({ ...codForm, orderId: e.target.value })}
                  placeholder="ORD-2025-XXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Received (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={codForm.amount}
                  onChange={(e) => setCodForm({ ...codForm, amount: e.target.value })}
                  placeholder="45999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateReceived">Date Received *</Label>
                <Input
                  id="dateReceived"
                  type="date"
                  value={codForm.dateReceived}
                  onChange={(e) => setCodForm({ ...codForm, dateReceived: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCODModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-primary to-orange-600 hover:opacity-90" onClick={handleAddCOD}>
                Add Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
