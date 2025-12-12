import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";

const Admin = () => {
  // TODO: Fetch stats from API
  const stats = [
    {
      title: "Total Revenue",
      value: "$0",
      change: "0%",
      trend: "up" as const,
      icon: DollarSign,
      description: "from last month",
    },
    {
      title: "Orders",
      value: "0",
      change: "0%",
      trend: "up" as const,
      icon: ShoppingCart,
      description: "from last month",
    },
    {
      title: "Products",
      value: "0",
      change: "0%",
      trend: "up" as const,
      icon: Package,
      description: "active products",
    },
    {
      title: "Customers",
      value: "0",
      change: "0%",
      trend: "up" as const,
      icon: Users,
      description: "total users",
    },
  ];

  // TODO: Fetch recent orders from API
  const recentOrders: Array<{
    id: string;
    customer: string;
    amount: string;
    status: string;
    date: string;
  }> = [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
          </div>
          <Button asChild>
            <Link to="/admin/products">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendIcon
                      className={`h-3 w-3 ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    />
                    <span
                      className={stat.trend === "up" ? "text-green-600" : "text-red-600"}
                    >
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground"> {stat.description}</span>
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-7">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest orders from your customers</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/orders">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Order ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No recent orders found
                          </td>
                        </tr>
                      ) : (
                        recentOrders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 text-sm font-medium">{order.id}</td>
                            <td className="py-3 px-4 text-sm">{order.customer}</td>
                            <td className="py-3 px-4 text-sm">{order.amount}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted">
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{order.date}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/products">
                  <Package className="mr-2 h-4 w-4" />
                  Manage Products
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/orders">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Orders
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;

