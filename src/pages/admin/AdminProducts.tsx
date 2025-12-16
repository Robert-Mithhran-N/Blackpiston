import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, ImageUp, ShoppingBag } from "lucide-react";

const mockProducts = [
  {
    id: "PRD-001",
    name: "Carbon full-face helmet",
    category: "Helmet",
    price: "₹18,500",
    stock: 6,
    status: "Active",
  },
  {
    id: "PRD-002",
    name: "Armoured riding jacket",
    category: "Jacket",
    price: "₹12,000",
    stock: 2,
    status: "Active",
  },
  {
    id: "PRD-003",
    name: "Track boots",
    category: "Boots",
    price: "₹9,500",
    stock: 0,
    status: "Inactive",
  },
];

const AdminProducts = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Products / Gear
            </h1>
            <p className="text-muted-foreground">
              Manage riding gear inventory and visibility.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-flame hover:opacity-90">
                <Plus className="mr-1.5 h-4 w-4" />
                Add product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add / Edit Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Product name" />
                <div className="flex gap-3">
                  <Select defaultValue="Helmet">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Helmet">Helmet</SelectItem>
                      <SelectItem value="Jacket">Jacket</SelectItem>
                      <SelectItem value="Boots">Boots</SelectItem>
                      <SelectItem value="Gloves">Gloves</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Price" />
                  <Input placeholder="Stock" />
                </div>
                <Button variant="outline" className="w-full justify-center">
                  <ImageUp className="mr-1.5 h-4 w-4" />
                  Upload images
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Product catalog
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProducts.map((prod) => (
                  <TableRow key={prod.id}>
                    <TableCell className="font-mono text-xs">
                      {prod.id}
                    </TableCell>
                    <TableCell>{prod.name}</TableCell>
                    <TableCell>{prod.category}</TableCell>
                    <TableCell>{prod.price}</TableCell>
                    <TableCell>{prod.stock}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          prod.status === "Active"
                            ? "bg-green-500/10 text-green-400 border-green-500/40"
                            : "bg-muted/60 text-muted-foreground border-border/60"
                        }
                      >
                        {prod.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="xs" variant="outline">
                        Edit
                      </Button>
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

export default AdminProducts;


