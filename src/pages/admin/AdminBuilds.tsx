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
import { Badge } from "@/components/ui/badge";
import { Plus, Factory, Search, PenSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminBuilds, createBuild, updateBuild, deleteBuild } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminBuilds = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuild, setEditingBuild] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    customerName: "",
    bikeModel: "",
    description: "",
    stage: "",
    status: "Planning",
    technician: "",
    image: "",
    gallery: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["adminBuilds", searchTerm],
    queryFn: () => fetchAdminBuilds({ search: searchTerm }),
  });

  const createMutation = useMutation({
    mutationFn: createBuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBuilds"] });
      toast.success("Build created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || "Failed to create build"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateBuild(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBuilds"] });
      toast.success("Build updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || "Failed to update build"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBuilds"] });
      toast.success("Build deleted successfully");
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete build"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      customerName: "",
      bikeModel: "",
      description: "",
      stage: "",
      status: "Planning",
      technician: "",
      image: "",
      gallery: "",
    });
    setEditingBuild(null);
  };

  const handleEdit = (build: any) => {
    setEditingBuild(build);
    setFormData({
      title: build.title,
      customerName: build.customerName,
      bikeModel: build.bikeModel,
      description: build.description || "",
      stage: build.stage || "",
      status: build.status || "Planning",
      technician: build.technician || "",
      image: build.image || "",
      gallery: build.gallery ? build.gallery.join(", ") : "",
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
    if (!formData.title || !formData.customerName || !formData.bikeModel) {
      toast.error("Please fill in all required fields (Title, Customer, Bike)");
      return;
    }

    const payload = {
      ...formData,
      gallery: formData.gallery ? formData.gallery.split(",").map((url) => url.trim()).filter(Boolean) : [],
    };

    if (editingBuild) {
      updateMutation.mutate({ id: editingBuild.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "planning":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-muted/50 text-muted-foreground";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Custom Builds</h1>
            <p className="text-muted-foreground">
              Track customer build projects and progress.
            </p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search builds..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-flame hover:opacity-90">
                  <Plus className="mr-1.5 h-4 w-4" />
                  New build
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingBuild ? "Edit Build" : "Create Build"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Build Title *</label>
                      <Input 
                        placeholder="e.g., The Dark Knight R1" 
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Customer Name *</label>
                      <Input 
                        placeholder="e.g., John Doe" 
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bike Model *</label>
                      <Input 
                        placeholder="e.g., Yamaha YZF-R1" 
                        value={formData.bikeModel}
                        onChange={(e) => setFormData({ ...formData, bikeModel: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Technician</label>
                      <Input 
                        placeholder="Assigned tech" 
                        value={formData.technician}
                        onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current Stage</label>
                      <Input 
                        placeholder="e.g., Engine Tuning, Final Assembly" 
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status *</label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(val) => setFormData({ ...formData, status: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Planning">Planning</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Main Image URL</label>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gallery URLs (comma separated)</label>
                    <Input 
                      placeholder="url1.jpg, url2.jpg" 
                      value={formData.gallery}
                      onChange={(e) => setFormData({ ...formData, gallery: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      placeholder="Build notes, specs, modifications..." 
                      rows={5} 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button 
                      className="bg-gradient-flame hover:opacity-90 text-white" 
                      onClick={handleSubmit}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingBuild ? "Save Changes" : "Create Build"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Factory className="h-4 w-4 text-primary" />
              Active builds
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
                Loading builds...
              </div>
            ) : data?.builds?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Factory className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p>No builds found</p>
                <p className="text-sm mt-1">Start a new project to track progress.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Build Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Current Stage</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.builds?.map((build: any) => (
                      <TableRow key={build.id} className="group">
                        <TableCell>
                          <div className="font-medium text-foreground">{build.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {build.bikeModel}
                          </div>
                          <div className="text-[10px] text-muted-foreground/50 mt-1 font-mono">
                            {build.id}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{build.customerName}</TableCell>
                        <TableCell className="text-muted-foreground">{build.stage || "N/A"}</TableCell>
                        <TableCell className="text-muted-foreground">{build.technician || "Unassigned"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-normal ${getStatusColor(build.status)}`}>
                            {build.status || "Planning"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 hover:!bg-primary/20 hover:text-primary"
                              onClick={() => handleEdit(build)}
                            >
                              <PenSquare className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 hover:!bg-red-500/20 hover:text-red-500"
                              onClick={() => handleDeleteClick(build.id)}
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
              <DialogTitle>Delete Build</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this build project? This action cannot be undone.
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

export default AdminBuilds;


