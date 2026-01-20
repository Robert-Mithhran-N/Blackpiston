import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    UserCog,
    Shield,
    Key,
    MoreHorizontal,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Clock,
    CheckCircle,
    XCircle,
    Copy,
} from "lucide-react";
import { toast } from "sonner";
import { adminUsers, adminRoleOptions } from "@/data/adminMockData";
import { AdminUser, AdminRole } from "@/types/admin";

// Role badge colors
const getRoleBadgeColor = (role: AdminRole) => {
    switch (role) {
        case 'SuperAdmin': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
        case 'ProductManager': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        case 'OrderManager': return 'bg-green-500/20 text-green-400 border-green-500/50';
        case 'Accountant': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        case 'ServiceManager': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
        case 'Support': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
};

// Permission matrix config
const permissionModules = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'products', name: 'Products' },
    { id: 'orders', name: 'Orders' },
    { id: 'payments', name: 'Payments' },
    { id: 'customers', name: 'Customers' },
    { id: 'inventory', name: 'Inventory' },
    { id: 'bookings', name: 'Service Bookings' },
    { id: 'users', name: 'Admin Users' },
    { id: 'reports', name: 'Reports' },
    { id: 'settings', name: 'Settings' },
];

const permissionActions = ['view', 'create', 'edit', 'delete'];

// Mock API Keys
const mockApiKeys = [
    { id: 'KEY-001', name: 'Website Integration', key: 'bp_live_abc123...xyz', permissions: ['read:products', 'read:inventory'], createdAt: '2024-06-15', lastUsed: '2025-01-20', status: 'Active' as const },
    { id: 'KEY-002', name: 'Mobile App', key: 'bp_live_def456...uvw', permissions: ['read:products', 'write:orders', 'read:customers'], createdAt: '2024-08-20', lastUsed: '2025-01-19', status: 'Active' as const },
    { id: 'KEY-003', name: 'Test Key', key: 'bp_test_ghi789...rst', permissions: ['read:products'], createdAt: '2025-01-01', status: 'Revoked' as const },
];

const AdminUsers = () => {
    const [users, setUsers] = useState<AdminUser[]>(adminUsers);
    const [apiKeys, setApiKeys] = useState(mockApiKeys);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const [showApiKey, setShowApiKey] = useState<string | null>(null);

    // Stats
    const stats = useMemo(() => {
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.status === 'Active').length;
        const with2FA = users.filter(u => u.twoFactorEnabled).length;
        const activeApiKeys = apiKeys.filter(k => k.status === 'Active').length;
        return { totalUsers, activeUsers, with2FA, activeApiKeys };
    }, [users, apiKeys]);

    // Filter users
    const filteredUsers = useMemo(() => {
        let filtered = [...users];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (user) =>
                    user.name.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query) ||
                    user.id.toLowerCase().includes(query)
            );
        }

        if (roleFilter !== "all") {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        return filtered;
    }, [users, searchQuery, roleFilter]);

    // Handlers
    const handleViewUser = (user: AdminUser) => {
        setSelectedUser(user);
        setIsUserModalOpen(true);
    };

    const handleEditPermissions = (user: AdminUser) => {
        setSelectedUser(user);
        setIsPermissionModalOpen(true);
    };

    const handleToggleUserStatus = (userId: string) => {
        setUsers(users.map(u =>
            u.id === userId
                ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
                : u
        ));
        toast.success("User status updated");
    };

    const handleDeleteUser = (userId: string) => {
        setUsers(users.filter(u => u.id !== userId));
        toast.success("User deleted");
    };

    const handleCopyApiKey = (key: string) => {
        navigator.clipboard.writeText(key);
        toast.success("API key copied to clipboard");
    };

    const handleRevokeApiKey = (keyId: string) => {
        setApiKeys(apiKeys.map(k =>
            k.id === keyId ? { ...k, status: 'Revoked' as const } : k
        ));
        toast.success("API key revoked");
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Users & Roles</h1>
                        <p className="text-muted-foreground">Manage admin access and permissions</p>
                    </div>
                    <Button className="bg-gradient-flame hover:opacity-90">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Admin User
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">{stats.activeUsers}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">2FA Enabled</CardTitle>
                            <Shield className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">{stats.with2FA}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
                            <Key className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeApiKeys}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="users">
                    <TabsList>
                        <TabsTrigger value="users">Admin Users</TabsTrigger>
                        <TabsTrigger value="roles">Role Permissions</TabsTrigger>
                        <TabsTrigger value="apikeys">API Keys</TabsTrigger>
                    </TabsList>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-4 mt-4">
                        {/* Filters */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by name or email..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            {adminRoleOptions.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Users Table */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead className="text-center">2FA</TableHead>
                                                <TableHead>Last Login</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-12">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                        No users found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-gradient-flame flex items-center justify-center">
                                                                    <span className="text-white font-medium">
                                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{user.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {user.twoFactorEnabled ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "—"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                className={
                                                                    user.status === 'Active'
                                                                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                                        : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                                                                }
                                                            >
                                                                {user.status}
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
                                                                    <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit User
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleEditPermissions(user)}>
                                                                        <Shield className="mr-2 h-4 w-4" />
                                                                        Edit Permissions
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                                                                        {user.status === 'Active' ? (
                                                                            <>
                                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                                Deactivate
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                                Activate
                                                                            </>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-destructive"
                                                                        onClick={() => handleDeleteUser(user.id)}
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
                    </TabsContent>

                    {/* Roles Tab */}
                    <TabsContent value="roles" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Permission Matrix</CardTitle>
                                <CardDescription>Configure module access for each role</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-48">Module</TableHead>
                                                {adminRoleOptions.map((role) => (
                                                    <TableHead key={role.value} className="text-center">
                                                        <Badge className={getRoleBadgeColor(role.value as AdminRole)}>
                                                            {role.label}
                                                        </Badge>
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {permissionModules.map((module) => (
                                                <TableRow key={module.id}>
                                                    <TableCell className="font-medium">{module.name}</TableCell>
                                                    {adminRoleOptions.map((role) => {
                                                        const isSuperAdmin = role.value === 'SuperAdmin';
                                                        const hasAccess = isSuperAdmin || Math.random() > 0.3; // Mock access

                                                        return (
                                                            <TableCell key={role.value} className="text-center">
                                                                <div className="flex justify-center gap-1">
                                                                    {isSuperAdmin ? (
                                                                        <Badge className="bg-green-500/20 text-green-400 text-xs">Full</Badge>
                                                                    ) : hasAccess ? (
                                                                        <div className="flex gap-0.5">
                                                                            <div className="h-2 w-2 rounded-full bg-green-500" title="View" />
                                                                            <div className="h-2 w-2 rounded-full bg-blue-500" title="Create" />
                                                                            <div className="h-2 w-2 rounded-full bg-yellow-500" title="Edit" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-2 w-2 rounded-full bg-muted" title="No Access" />
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* API Keys Tab */}
                    <TabsContent value="apikeys" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>API Keys</CardTitle>
                                    <CardDescription>Manage API access for integrations</CardDescription>
                                </div>
                                <Button onClick={() => setIsApiKeyModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create API Key
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>API Key</TableHead>
                                                <TableHead>Permissions</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead>Last Used</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-12">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {apiKeys.map((key) => (
                                                <TableRow key={key.id}>
                                                    <TableCell className="font-medium">{key.name}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                                {showApiKey === key.id ? key.key : key.key.substring(0, 12) + '...'}
                                                            </code>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => setShowApiKey(showApiKey === key.id ? null : key.id)}
                                                            >
                                                                {showApiKey === key.id ? (
                                                                    <EyeOff className="h-3 w-3" />
                                                                ) : (
                                                                    <Eye className="h-3 w-3" />
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => handleCopyApiKey(key.key)}
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {key.permissions.slice(0, 2).map((perm) => (
                                                                <Badge key={perm} variant="secondary" className="text-xs">
                                                                    {perm}
                                                                </Badge>
                                                            ))}
                                                            {key.permissions.length > 2 && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    +{key.permissions.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{key.createdAt}</TableCell>
                                                    <TableCell className="text-sm">{key.lastUsed || "—"}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                key.status === 'Active'
                                                                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                                    : 'bg-red-500/20 text-red-400 border-red-500/50'
                                                            }
                                                        >
                                                            {key.status}
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
                                                                <DropdownMenuItem onClick={() => handleCopyApiKey(key.key)}>
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    Copy Key
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit Permissions
                                                                </DropdownMenuItem>
                                                                {key.status === 'Active' && (
                                                                    <DropdownMenuItem
                                                                        className="text-destructive"
                                                                        onClick={() => handleRevokeApiKey(key.id)}
                                                                    >
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        Revoke Key
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* User Detail Modal */}
                <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                    <DialogContent>
                        {selectedUser && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>User Details</DialogTitle>
                                    <DialogDescription>Admin user information</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-full bg-gradient-flame flex items-center justify-center">
                                            <span className="text-white text-xl font-bold">
                                                {selectedUser.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold">{selectedUser.name}</p>
                                            <p className="text-muted-foreground">{selectedUser.email}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label className="text-muted-foreground">Role</Label>
                                            <div className="mt-1">
                                                <Badge className={getRoleBadgeColor(selectedUser.role)}>{selectedUser.role}</Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Status</Label>
                                            <div className="mt-1">
                                                <Badge
                                                    className={
                                                        selectedUser.status === 'Active'
                                                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                            : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                                                    }
                                                >
                                                    {selectedUser.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">2FA Status</Label>
                                            <div className="mt-1 flex items-center gap-2">
                                                {selectedUser.twoFactorEnabled ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                        <span className="text-green-500">Enabled</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Disabled</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Last Login</Label>
                                            <p className="mt-1">
                                                {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <Label className="text-muted-foreground">Permissions</Label>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {selectedUser.permissions.map((perm, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {perm.module}: {perm.actions.join(', ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>
                                        Close
                                    </Button>
                                    <Button>Edit User</Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Permission Edit Modal */}
                <Dialog open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Permissions</DialogTitle>
                            <DialogDescription>
                                Configure permissions for {selectedUser?.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Module</TableHead>
                                        <TableHead className="text-center">View</TableHead>
                                        <TableHead className="text-center">Create</TableHead>
                                        <TableHead className="text-center">Edit</TableHead>
                                        <TableHead className="text-center">Delete</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permissionModules.map((module) => (
                                        <TableRow key={module.id}>
                                            <TableCell className="font-medium">{module.name}</TableCell>
                                            {permissionActions.map((action) => (
                                                <TableCell key={action} className="text-center">
                                                    <Switch defaultChecked={Math.random() > 0.3} />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPermissionModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-gradient-flame hover:opacity-90"
                                onClick={() => {
                                    toast.success("Permissions updated");
                                    setIsPermissionModalOpen(false);
                                }}
                            >
                                Save Permissions
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create API Key Modal */}
                <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create API Key</DialogTitle>
                            <DialogDescription>Generate a new API key for integrations</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="keyName">Key Name</Label>
                                <Input id="keyName" placeholder="e.g., Mobile App Integration" />
                            </div>
                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['read:products', 'write:products', 'read:orders', 'write:orders', 'read:customers', 'read:inventory'].map((perm) => (
                                        <div key={perm} className="flex items-center gap-2">
                                            <Switch />
                                            <Label className="text-sm">{perm}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsApiKeyModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-gradient-flame hover:opacity-90"
                                onClick={() => {
                                    toast.success("API key created");
                                    setIsApiKeyModalOpen(false);
                                }}
                            >
                                Create Key
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
