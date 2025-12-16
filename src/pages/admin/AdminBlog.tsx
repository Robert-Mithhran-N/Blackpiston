import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, ImageUp } from "lucide-react";

const mockPosts = [
  {
    id: "POST-001",
    title: "Building the perfect track weapon",
    category: "Track",
    status: "Published",
    date: "2025-01-10",
  },
  {
    id: "POST-002",
    title: "Street setup guide for daily riders",
    category: "Street",
    status: "Draft",
    date: "2025-01-20",
  },
];

const AdminBlog = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
            <p className="text-muted-foreground">
              Create and manage BlackPiston stories.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-flame hover:opacity-90">
                <Plus className="mr-1.5 h-4 w-4" />
                New post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create blog post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Title" />
                <div className="flex gap-3">
                  <Input placeholder="Slug" className="flex-1" />
                  <Input placeholder="Category" className="w-40" />
                </div>
                <Button variant="outline" size="sm">
                  <ImageUp className="mr-1.5 h-4 w-4" />
                  Featured image
                </Button>
                <Textarea
                  placeholder="Write your content here..."
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-mono text-xs">
                      {post.id}
                    </TableCell>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.category}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          post.status === "Published"
                            ? "bg-green-500/10 text-green-400 border-green-500/40"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/40"
                        }
                      >
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{post.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="xs" variant="outline">
                          Edit
                        </Button>
                        <Button size="xs" variant="outline">
                          {post.status === "Published"
                            ? "Unpublish"
                            : "Publish"}
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

export default AdminBlog;


