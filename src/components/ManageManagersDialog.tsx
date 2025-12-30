import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  assignedEventsCount: number;
  status: "active" | "inactive";
}

// Mock managers data
const initialManagers: Manager[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    mobile: "+1234567890",
    address: "123 Main St, City",
    emergencyContactName: "Jane Smith",
    emergencyContactPhone: "+1234567891",
    assignedEventsCount: 3,
    status: "active",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@example.com",
    mobile: "+1987654321",
    assignedEventsCount: 1,
    status: "active",
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@example.com",
    mobile: "+1122334455",
    assignedEventsCount: 0,
    status: "inactive",
  },
];

const ManageManagersDialog = () => {
  const [open, setOpen] = useState(false);
  const [managers, setManagers] = useState<Manager[]>(initialManagers);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setSelectedManager(null);
    resetForm();
    setEditDialogOpen(true);
  };

  const handleEdit = (manager: Manager) => {
    setIsCreating(false);
    setSelectedManager(manager);
    setFormData({
      firstName: manager.firstName,
      lastName: manager.lastName,
      email: manager.email,
      mobile: manager.mobile,
      address: manager.address || "",
      emergencyContactName: manager.emergencyContactName || "",
      emergencyContactPhone: manager.emergencyContactPhone || "",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (manager: Manager) => {
    if (manager.assignedEventsCount > 0) {
      toast.error("Cannot delete manager with active events");
      return;
    }
    setSelectedManager(manager);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedManager) {
      setManagers(managers.filter(m => m.id !== selectedManager.id));
      toast.success(`Manager "${selectedManager.firstName} ${selectedManager.lastName}" deleted`);
    }
    setDeleteDialogOpen(false);
    setSelectedManager(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreating) {
      const newManager: Manager = {
        id: Date.now().toString(),
        ...formData,
        assignedEventsCount: 0,
        status: "active",
      };
      setManagers([...managers, newManager]);
      toast.success(`Manager "${formData.firstName} ${formData.lastName}" created`);
    } else if (selectedManager) {
      setManagers(managers.map(m => 
        m.id === selectedManager.id 
          ? { ...m, ...formData }
          : m
      ));
      toast.success(`Manager "${formData.firstName} ${formData.lastName}" updated`);
    }
    
    setEditDialogOpen(false);
    resetForm();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Manage Event Managers
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Managers</DialogTitle>
            <DialogDescription>View and manage event managers</DialogDescription>
          </DialogHeader>

          <div className="flex justify-end mb-4">
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Manager
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Assigned Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell className="font-medium">
                    {manager.firstName} {manager.lastName}
                  </TableCell>
                  <TableCell>{manager.email}</TableCell>
                  <TableCell>{manager.mobile}</TableCell>
                  <TableCell>{manager.assignedEventsCount}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={manager.status === "active" ? "default" : "secondary"}
                    >
                      {manager.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(manager)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(manager)}
                        disabled={manager.assignedEventsCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Manager Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Add New Manager" : "Edit Manager"}</DialogTitle>
            <DialogDescription>
              {isCreating ? "Fill in the details to add a new event manager" : "Update manager details"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile *</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">
                {isCreating ? "Add Manager" : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Manager</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedManager?.firstName} {selectedManager?.lastName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageManagersDialog;
