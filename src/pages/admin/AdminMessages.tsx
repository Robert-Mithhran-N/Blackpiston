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
import { MessagesSquare } from "lucide-react";

const mockMessages = [
  {
    id: "MSG-001",
    name: "Rahul Verma",
    email: "rahul@example.com",
    message: "Looking to book a track setup session next month.",
    date: "2025-01-18",
    status: "Unread",
  },
  {
    id: "MSG-002",
    name: "Priya Nair",
    email: "priya@example.com",
    message: "Do you offer pickup and drop for bikes?",
    date: "2025-01-19",
    status: "Read",
  },
];

const AdminMessages = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">
              View customer inquiries and contact requests.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessagesSquare className="h-4 w-4 text-primary" />
              Inbox
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMessages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="font-mono text-xs">
                      {msg.id}
                    </TableCell>
                    <TableCell>{msg.name}</TableCell>
                    <TableCell>{msg.email}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {msg.message}
                    </TableCell>
                    <TableCell>{msg.date}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          msg.status === "Unread"
                            ? "bg-primary/10 text-primary border-primary/40"
                            : "bg-muted/60 text-muted-foreground border-border/60"
                        }
                      >
                        {msg.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="xs" variant="outline">
                          Mark as read
                        </Button>
                        <Button size="xs" variant="outline">
                          Delete
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

export default AdminMessages;


