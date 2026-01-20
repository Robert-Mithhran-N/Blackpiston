import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Package,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  Eye,
} from "lucide-react";
import {
  dashboardKPIs,
  recentOrders,
  recentPayments,
  lowStockAlerts,
  pendingBookings,
} from "@/data/adminMockData";

// Status colors
const getOrderStatusColor = (status: string) => {
  switch (status) {
    case 'New': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    case 'Confirmed': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50';
    case 'Packed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    case 'Shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    case 'Delivered': return 'bg-green-500/20 text-green-400 border-green-500/50';
    case 'Closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'Paid': return 'bg-green-500/20 text-green-400 border-green-500/50';
    case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    case 'Partial': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    case 'Refunded': return 'bg-red-500/20 text-red-400 border-red-500/50';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
};

const getBookingStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    case 'Confirmed': return 'bg-green-500/20 text-green-400 border-green-500/50';
    case 'In Progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    case 'Completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  href?: string;
}

const KPICard = ({ title, value, change, changeLabel, icon: Icon, trend, loading, href }: KPICardProps) => {
  const content = (
    <Card className={`relative overflow-hidden transition-all duration-200 ${href ? 'hover:border-primary/50 cursor-pointer' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : trend === 'down' ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : null}
                <span className={`text-xs ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {change > 0 ? '+' : ''}{change}% {changeLabel}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-flame opacity-50" />
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
};

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState("7d");
  const [isLoading] = useState(false);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening at BlackPiston Garage.
            </p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Gross Revenue"
            value={`₹${dashboardKPIs.grossRevenue.toLocaleString()}`}
            change={12}
            changeLabel="from last period"
            icon={DollarSign}
            trend="up"
            loading={isLoading}
            href="/admin/reports"
          />
          <KPICard
            title="Net Revenue"
            value={`₹${dashboardKPIs.netRevenue.toLocaleString()}`}
            change={8}
            changeLabel="from last period"
            icon={TrendingUp}
            trend="up"
            loading={isLoading}
            href="/admin/reports"
          />
          <KPICard
            title="Open Orders"
            value={dashboardKPIs.ordersOpen}
            icon={ShoppingCart}
            loading={isLoading}
            href="/admin/orders"
          />
          <KPICard
            title="Payments Pending"
            value={dashboardKPIs.paymentsPending}
            icon={CreditCard}
            loading={isLoading}
            href="/admin/payments"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <KPICard
            title="Low Stock Items"
            value={dashboardKPIs.lowStockCount}
            icon={Package}
            loading={isLoading}
            href="/admin/inventory"
          />
          <KPICard
            title="Today's Service Bookings"
            value={dashboardKPIs.todaysBookings}
            icon={Calendar}
            loading={isLoading}
            href="/admin/bookings"
          />
          <KPICard
            title="Completed Orders"
            value={dashboardKPIs.ordersClosed}
            change={23}
            changeLabel="this month"
            icon={CheckCircle}
            trend="up"
            loading={isLoading}
            href="/admin/orders"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from your store</CardDescription>
              </div>
              <Link to="/admin/orders">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium font-mono text-xs">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{order.total.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest payment activity</CardDescription>
              </div>
              <Link to="/admin/payments">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium font-mono text-xs">{payment.id}</TableCell>
                      <TableCell>{payment.customerName}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(payment.status)}>{payment.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{payment.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Bookings Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Low Stock Alerts */}
          <Card className="border-yellow-500/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <CardTitle>Low Stock Alerts</CardTitle>
                  <CardDescription>Items that need restocking</CardDescription>
                </div>
              </div>
              <Link to="/admin/inventory">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockAlerts.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${item.isCritical ? 'border-red-500/50 bg-red-500/5' : 'border-border'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${item.isCritical ? 'bg-red-500/20' : 'bg-yellow-500/20'
                        }`}>
                        <Package className={`h-5 w-5 ${item.isCritical ? 'text-red-400' : 'text-yellow-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.sku} • {item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${item.isCritical ? 'text-red-400' : 'text-yellow-400'}`}>
                        {item.currentStock} left
                      </p>
                      <p className="text-xs text-muted-foreground">Reorder at {item.reorderPoint}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Service Bookings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Today's Service Bookings</CardTitle>
                  <CardDescription>Workshop appointments for today</CardDescription>
                </div>
              </div>
              <Link to="/admin/bookings">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-xs text-muted-foreground">{booking.vehicleInfo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getBookingStatusColor(booking.status)}>{booking.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{booking.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link to="/admin/products">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <Package className="h-6 w-6 text-primary" />
                  <span>Add New Product</span>
                </Button>
              </Link>
              <Link to="/admin/orders">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  <span>Process Orders</span>
                </Button>
              </Link>
              <Link to="/admin/inventory">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  <span>Create PO</span>
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  <span>View Reports</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium">Payment Gateway</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium">Database</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium">Email Service</p>
                  <p className="text-xs text-muted-foreground">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium">Shipping API</p>
                  <p className="text-xs text-muted-foreground">Running</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;