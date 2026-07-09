import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Wrench, Search, PenSquare, Trash2, Copy, Eye, MousePointerClick, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminServices, createService, updateService, deleteService, duplicateService } from "@/lib/api";
import { toast } from "sonner";

const AdminServices = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    image: "",
    status: "ACTIVE",
    visible: true,
    featured: false,
    displayOrder: 0,
    highlights: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["adminServices", searchTerm],
    queryFn: () => fetchAdminServices({ search: searchTerm }),
  });

  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminServices"] });
      toast.success("Service created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || "Failed to create service"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminServices"] });
      toast.success("Service updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || "Failed to update service"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminServices"] });
      toast.success("Service deleted successfully");
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete service"),
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminServices"] });
      toast.success("Service duplicated successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to duplicate service"),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "",
      image: "",
      status: "ACTIVE",
      visible: true,
      featured: false,
      displayOrder: 0,
      highlights: "",
    });
    setEditingService(null);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price?.toString() || "",
      duration: service.duration || "",
      category: service.category || "",
      image: service.image || "",
      status: service.status || "ACTIVE",
      visible: service.visible !== undefined ? service.visible : true,
      featured: service.featured || false,
      displayOrder: service.displayOrder || 0,
      highlights: service.highlights ? service.highlights.join("\n") : "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.price || !formData.duration) {
      toast.error("Please fill in all required fields (Name, Description, Price, Duration)");
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      displayOrder: Number(formData.displayOrder),
      highlights: formData.highlights.split("\n").map(h => h.trim()).filter(h => h.length > 0),
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleToggleVisible = (service: any, checked: boolean) => {
    updateMutation.mutate({ id: service.id, data: { visible: checked } });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">
              Configure garage services, availability, and pricing.
            </p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-flame hover:opacity-90">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add service
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingService ? "Edit Service" : "Add Service"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Service Name *</label>
                    <Input 
                      placeholder="e.g., Oil Change" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description *</label>
                    <Textarea 
                      placeholder="Details about the service..." 
                      rows={3} 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price (₹) *</label>
                      <Input 
                        type="number"
                        placeholder="e.g., 1500" 
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duration *</label>
                      <Input 
                        placeholder="e.g., 2 hours" 
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Input 
                        placeholder="e.g., Maintenance" 
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Display Order</label>
                      <Input 
                        type="number"
                        placeholder="0" 
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image URL</label>
                    <Input 
                      placeholder="https://..." 
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Highlights (One per line)</label>
                    <Textarea 
                      placeholder="Premium Oil\nFilter Change\nCheckup" 
                      rows={3} 
                      value={formData.highlights}
                      onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex flex-col justify-center gap-2 pt-6">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Visible to Public</label>
                        <Switch 
                          checked={formData.visible}
                          onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Featured</label>
                        <Switch 
                          checked={formData.featured}
                          onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button 
                      className="bg-gradient-flame hover:opacity-90 text-white" 
                      onClick={handleSubmit}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingService ? "Save Changes" : "Create Service"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">Total Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.services?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">Active & Visible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {data?.services?.filter((s: any) => s.status === 'ACTIVE' && s.visible).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {data?.services?.filter((s: any) => s.status === 'COMING_SOON').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {data?.services?.reduce((acc: number, s: any) => acc + (s.views || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              Service catalog
              {data?.pagination?.total !== undefined && (
                <Badge variant="secondary" className="ml-2 font-mono text-xs">
                  {data.pagination.total}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                Loading services...
              </div>
            ) : data?.services?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Wrench className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p>No services found</p>
                <p className="text-sm mt-1">Add your first service to offer to customers.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Service Info</TableHead>
                      <TableHead>Status & Visibility</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Analytics</TableHead>
                      <TableHead className="text-right w-48">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.services?.map((srv: any) => (
                      <TableRow key={srv.id} className="group">
                        <TableCell>
                          <div className="font-medium text-foreground flex items-center gap-2">
                            {srv.name}
                            {srv.featured && <Badge variant="secondary" className="text-[10px] h-4">Featured</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-sm">
                            {srv.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <span className="bg-muted px-1.5 py-0.5 rounded">⏱️ {srv.duration}</span>
                            <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase">{srv.category || "Uncategorized"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            <Badge
                              className={
                                srv.status === 'ACTIVE'
                                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                  : srv.status === 'COMING_SOON'
                                  ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                                  : "bg-muted/60 text-muted-foreground border-border/60"
                              }
                            >
                              {srv.status}
                            </Badge>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">Visible:</span>
                              <Switch 
                                checked={srv.visible} 
                                onCheckedChange={(checked) => handleToggleVisible(srv, checked)}
                                disabled={updateMutation.isPending}
                                className="scale-75 origin-left"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-medium text-foreground">
                          ₹{srv.price?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-3 text-muted-foreground text-xs font-mono">
                            <span className="flex items-center gap-1" title="Views"><Eye className="h-3 w-3" /> {srv.views || 0}</span>
                            <span className="flex items-center gap-1" title="Clicks"><MousePointerClick className="h-3 w-3" /> {srv.clicks || 0}</span>
                            <span className="flex items-center gap-1" title="Inquiries"><MessageSquare className="h-3 w-3" /> {srv.inquiries || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 hover:!bg-blue-500/20 hover:text-blue-500"
                              onClick={() => duplicateMutation.mutate(srv.id)}
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 hover:!bg-primary/20 hover:text-primary"
                              onClick={() => handleEdit(srv)}
                              title="Edit"
                            >
                              <PenSquare className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 hover:!bg-red-500/20 hover:text-red-500"
                              onClick={() => handleDeleteClick(srv.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Service</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this service? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
