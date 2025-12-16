import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

const mockUsers = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    status: "Active",
    created: "2025-01-05",
  },
  {
    id: "USR-002",
    name: "Admin Rider",
    email: "admin@example.com",
    role: "admin",
    status: "Active",
    created: "2025-01-01",
  },
  {
    id: "USR-003",
    name: "Banned User",
    email: "banned@example.com",
    role: "user",
    status: "Banned",
    created: "2024-12-20",
  },
];

const AdminUsers = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage registered riders and access levels.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              User directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id} id={`user-${user.id}`}>
                    <TableCell className="font-mono text-xs">
                      {user.id}
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.role === "admin"
                            ? "bg-primary/10 text-primary border-primary/40"
                            : "bg-muted/60 text-muted-foreground border-border/60"
                        }
                      >
                        {user.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.status === "Active"
                            ? "bg-green-500/10 text-green-400 border-green-500/40"
                            : "bg-red-500/10 text-red-400 border-red-500/40"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.created}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="xs" variant="outline">
                          Change role
                        </Button>
                        <Button size="xs" variant="outline">
                          {user.status === "Active" ? "Ban" : "Unban"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;


