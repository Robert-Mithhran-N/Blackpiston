import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
    AreaChart,
    Area,
} from "recharts";
import {
    Download,
    FileText,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Package,
    Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { salesByCategory, salesByMonth, topSellingProducts } from "@/data/adminMockData";

// Chart colors
const CHART_COLORS = [
    'hsl(24, 100%, 50%)', // Primary orange
    'hsl(200, 80%, 50%)', // Blue
    'hsl(150, 80%, 40%)', // Green
    'hsl(280, 70%, 50%)', // Purple
    'hsl(50, 90%, 50%)',  // Yellow
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                <p className="font-medium">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: ₹{entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// KPI data
const kpiData = {
    totalRevenue: 1250000,
    ordersCount: 156,
    avgOrderValue: 8012,
    grossMargin: 32.5,
    inventoryTurnover: 4.2,
    taxCollected: 225000,
};

// Monthly comparison data
const monthlyComparison = [
    { month: 'Jul', revenue: 95000, orders: 12, margin: 28 },
    { month: 'Aug', revenue: 120000, orders: 15, margin: 30 },
    { month: 'Sep', revenue: 145000, orders: 18, margin: 31 },
    { month: 'Oct', revenue: 175000, orders: 22, margin: 33 },
    { month: 'Nov', revenue: 210000, orders: 28, margin: 32 },
    { month: 'Dec', revenue: 280000, orders: 35, margin: 34 },
    { month: 'Jan', revenue: 225000, orders: 26, margin: 33 },
];

// Inventory turnover by category
const inventoryTurnover = [
    { category: 'Helmets', turnover: 5.2, stockValue: 450000 },
    { category: 'Riding Jackets', turnover: 3.8, stockValue: 380000 },
    { category: 'Riding Gloves', turnover: 6.1, stockValue: 120000 },
    { category: 'Riding Boots', turnover: 4.0, stockValue: 280000 },
    { category: 'Accessories', turnover: 8.5, stockValue: 95000 },
];

const AdminReports = () => {
    const [dateRange, setDateRange] = useState("30d");

    const handleExport = (format: 'csv' | 'pdf') => {
        toast.success(`Exporting report as ${format.toUpperCase()}...`);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                        <p className="text-muted-foreground">Business insights and performance metrics</p>
                    </div>
                    <div className="flex gap-2">
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                                <SelectItem value="year">This year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => handleExport('csv')}>
                            <Download className="mr-2 h-4 w-4" />
                            CSV
                        </Button>
                        <Button variant="outline" onClick={() => handleExport('pdf')}>
                            <FileText className="mr-2 h-4 w-4" />
                            PDF
                        </Button>
                    </div>
                </div>

                {/* KPI Summary */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{(kpiData.totalRevenue / 100000).toFixed(1)}L</div>
                            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3" /> +12% from last period
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpiData.ordersCount}</div>
                            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3" /> +8% from last period
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{kpiData.avgOrderValue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Per order</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpiData.grossMargin}%</div>
                            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3" /> +2.5% from last period
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inventory Turnover</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpiData.inventoryTurnover}x</div>
                            <p className="text-xs text-muted-foreground mt-1">Annual rate</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tax Collected</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{(kpiData.taxCollected / 1000).toFixed(0)}K</div>
                            <p className="text-xs text-muted-foreground mt-1">GST</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <Tabs defaultValue="sales">
                    <TabsList>
                        <TabsTrigger value="sales">Sales</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    </TabsList>

                    {/* Sales Tab */}
                    <TabsContent value="sales" className="space-y-6 mt-4">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Revenue Trend */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue Trend</CardTitle>
                                    <CardDescription>Monthly revenue over the last 7 months</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={salesByMonth}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="month" className="text-xs" />
                                                <YAxis className="text-xs" tickFormatter={(value) => `₹${value / 1000}K`} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="hsl(24, 100%, 50%)"
                                                    strokeWidth={2}
                                                    fillOpacity={1}
                                                    fill="url(#colorRevenue)"
                                                    name="Revenue"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sales by Category */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sales by Category</CardTitle>
                                    <CardDescription>Revenue distribution across categories</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={salesByCategory}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                    labelLine={false}
                                                >
                                                    {salesByCategory.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Monthly Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Performance Comparison</CardTitle>
                                <CardDescription>Revenue, orders, and margin trends</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyComparison}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="month" className="text-xs" />
                                            <YAxis yAxisId="left" className="text-xs" tickFormatter={(value) => `₹${value / 1000}K`} />
                                            <YAxis yAxisId="right" orientation="right" className="text-xs" tickFormatter={(value) => `${value}%`} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="hsl(24, 100%, 50%)"
                                                strokeWidth={2}
                                                name="Revenue"
                                                dot={{ fill: 'hsl(24, 100%, 50%)' }}
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="margin"
                                                stroke="hsl(150, 80%, 40%)"
                                                strokeWidth={2}
                                                name="Margin %"
                                                dot={{ fill: 'hsl(150, 80%, 40%)' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Products Tab */}
                    <TabsContent value="products" className="space-y-6 mt-4">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Top Selling Products */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Top Selling Products</CardTitle>
                                    <CardDescription>Best performing products by revenue</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">#</TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-center">Quantity Sold</TableHead>
                                                <TableHead className="text-right">Revenue</TableHead>
                                                <TableHead className="text-right">% of Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topSellingProducts.map((product, index) => {
                                                const totalRevenue = topSellingProducts.reduce((sum, p) => sum + p.revenue, 0);
                                                const percentage = ((product.revenue / totalRevenue) * 100).toFixed(1);

                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-bold text-primary">{index + 1}</TableCell>
                                                        <TableCell className="font-medium">{product.name}</TableCell>
                                                        <TableCell className="text-center">{product.quantity}</TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            ₹{product.revenue.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge variant="secondary">{percentage}%</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Product Revenue Chart */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Product Revenue Comparison</CardTitle>
                                    <CardDescription>Top 5 products by revenue</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topSellingProducts} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis type="number" className="text-xs" tickFormatter={(value) => `₹${value / 1000}K`} />
                                                <YAxis dataKey="name" type="category" className="text-xs" width={150} />
                                                <Tooltip
                                                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                                                />
                                                <Bar dataKey="revenue" fill="hsl(24, 100%, 50%)" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Inventory Tab */}
                    <TabsContent value="inventory" className="space-y-6 mt-4">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Inventory Turnover by Category */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventory Turnover by Category</CardTitle>
                                    <CardDescription>How fast inventory is selling</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={inventoryTurnover}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="category" className="text-xs" />
                                                <YAxis className="text-xs" />
                                                <Tooltip />
                                                <Bar dataKey="turnover" fill="hsl(200, 80%, 50%)" radius={[4, 4, 0, 0]} name="Turnover Rate" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stock Value by Category */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Stock Value by Category</CardTitle>
                                    <CardDescription>Current inventory value distribution</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={inventoryTurnover}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    dataKey="stockValue"
                                                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                                                    labelLine={false}
                                                >
                                                    {inventoryTurnover.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Inventory Summary Table */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Inventory Performance Summary</CardTitle>
                                    <CardDescription>Category-wise inventory metrics</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Category</TableHead>
                                                <TableHead className="text-center">Turnover Rate</TableHead>
                                                <TableHead className="text-right">Stock Value</TableHead>
                                                <TableHead className="text-center">Performance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inventoryTurnover.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.category}</TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="font-bold">{item.turnover}x</span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        ₹{item.stockValue.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            className={
                                                                item.turnover >= 5
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : item.turnover >= 3
                                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                                        : 'bg-red-500/20 text-red-400'
                                                            }
                                                        >
                                                            {item.turnover >= 5 ? 'Excellent' : item.turnover >= 3 ? 'Good' : 'Needs Attention'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default AdminReports;
