import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Phone, Star, User, Hospital } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface EmergencyContact {
  id?: number;
  userId?: number;
  name: string;
  relationship?: string;
  phone: string;
  isPrimary: boolean;
  contactType: string;
  notes?: string;
}

export function EmergencyContactsManager({ userId }: { userId: string }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState<EmergencyContact>({
    name: "",
    relationship: "",
    phone: "",
    isPrimary: false,
    contactType: "personal",
    notes: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch emergency contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: [`/api/emergency/contacts/${userId}`],
    enabled: !!userId,
  });

  // Add/Update contact mutation
  const saveMutation = useMutation({
    mutationFn: async (data: EmergencyContact) => {
      if (data.id) {
        return apiRequest("PUT", `/api/emergency/contacts/${data.id}`, data);
      } else {
        return apiRequest("POST", "/api/emergency/contacts", { ...data, userId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/emergency/contacts/${userId}`] });
      toast({
        title: "Success",
        description: editingContact ? "Contact updated successfully" : "Contact added successfully",
      });
      handleCloseDialog();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save contact",
        variant: "destructive",
      });
    },
  });

  // Delete contact mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/emergency/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/emergency/contacts/${userId}`] });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (contact?: EmergencyContact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData(contact);
    } else {
      setEditingContact(null);
      setFormData({
        name: "",
        relationship: "",
        phone: "",
        isPrimary: false,
        contactType: "personal",
        notes: "",
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingContact(null);
    setFormData({
      name: "",
      relationship: "",
      phone: "",
      isPrimary: false,
      contactType: "personal",
      notes: "",
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Error",
        description: "Name and phone number are required",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case "medical":
        return <Hospital className="h-5 w-5" />;
      case "facility":
        return <Hospital className="h-5 w-5" />;
      case "emergency_service":
        return <Phone className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
          <CardDescription>
            Add important contacts for quick access in emergencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add Contact Button */}
            <Button onClick={() => handleOpenDialog()} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Emergency Contact
            </Button>

            {/* Contacts List */}
            {isLoading ? (
              <div className="text-center py-4">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No emergency contacts added yet
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact: EmergencyContact) => (
                  <Card key={contact.id} className={contact.isPrimary ? "border-blue-500" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            contact.isPrimary ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"
                          }`}>
                            {getContactIcon(contact.contactType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{contact.name}</h4>
                              {contact.isPrimary && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="text-xs">Primary</span>
                                </div>
                              )}
                            </div>
                            {contact.relationship && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {contact.relationship}
                              </p>
                            )}
                            <p className="text-sm font-mono mt-1">
                              {formatPhone(contact.phone)}
                            </p>
                            {contact.notes && (
                              <p className="text-sm text-gray-500 mt-1">{contact.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(contact)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => contact.id && handleDelete(contact.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit Emergency Contact" : "Add Emergency Contact"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={formData.relationship || ""}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="Son, Daughter, Caregiver, etc."
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="contactType">Contact Type</Label>
              <Select
                value={formData.contactType}
                onValueChange={(value) => setFormData({ ...formData, contactType: value })}
              >
                <SelectTrigger id="contactType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="medical">Medical Provider</SelectItem>
                  <SelectItem value="facility">Facility Contact</SelectItem>
                  <SelectItem value="emergency_service">Emergency Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional information..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="primary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
              />
              <Label htmlFor="primary" className="cursor-pointer">
                Set as primary contact
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}