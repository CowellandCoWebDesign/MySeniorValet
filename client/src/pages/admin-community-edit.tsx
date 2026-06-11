import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

const CARE_TYPES = [
  "Assisted Living",
  "Memory Care",
  "Independent Living",
  "Skilled Nursing",
  "HUD / Subsidized",
  "Continuing Care",
  "Respite Care",
  "Adult Day",
];

export default function AdminCommunityEdit() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const communityId = parseInt(id ?? "0");

  const { data: community, isLoading, error } = useQuery<any>({
    queryKey: ["/api/admin/communities", communityId],
    queryFn: () =>
      fetch(`/api/admin/communities/${communityId}`, { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Community not found or access denied");
        return r.json();
      }),
    enabled: !isNaN(communityId) && communityId > 0,
  });

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    website: "",
    description: "",
    rentPerMonth: "",
    careTypes: [] as string[],
    isVerified: false,
    isHidden: false,
  });

  useEffect(() => {
    if (community) {
      setForm({
        name: community.name ?? "",
        address: community.address ?? "",
        city: community.city ?? "",
        state: community.state ?? "",
        zipCode: community.zipCode ?? "",
        phone: community.phone ?? "",
        website: community.website ?? "",
        description: community.description ?? "",
        rentPerMonth: community.rentPerMonth ?? "",
        careTypes: community.careTypes ?? [],
        isVerified: community.isVerified ?? false,
        isHidden: community.isHidden ?? false,
      });
    }
  }, [community]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) =>
      apiRequest("PUT", `/api/admin/communities/${communityId}`, data),
    onSuccess: () => {
      toast({ title: "Community updated", description: "Changes saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/communities", communityId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/communities"] });
    },
    onError: async (err: any) => {
      let message = "Failed to save changes.";
      try {
        const body = await err?.response?.json?.();
        if (body?.errors?.length) message = body.errors.join(", ");
        else if (body?.message) message = body.message;
      } catch (_) {}
      toast({ title: "Update failed", description: message, variant: "destructive" });
    },
  });

  const toggleCareType = (type: string) => {
    setForm((prev) => ({
      ...prev,
      careTypes: prev.careTypes.includes(type)
        ? prev.careTypes.filter((t) => t !== type)
        : [...prev.careTypes, type],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading community…</div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <p className="text-gray-700 dark:text-gray-300">Community #{communityId} not found.</p>
            <Button variant="outline" onClick={() => navigate("/admin-mega-dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin-mega-dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit Community</h1>
            <p className="text-sm text-gray-500">ID #{communityId}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Core Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Core Information</CardTitle>
              <CardDescription>Name, address, and contact details</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Community Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    maxLength={2}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP</Label>
                  <Input
                    id="zipCode"
                    value={form.zipCode}
                    onChange={(e) => setForm((p) => ({ ...p, zipCode: e.target.value }))}
                    maxLength={10}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={form.website}
                  onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rentPerMonth">Monthly Rent / Pricing</Label>
                <Input
                  id="rentPerMonth"
                  value={form.rentPerMonth}
                  onChange={(e) => setForm((p) => ({ ...p, rentPerMonth: e.target.value }))}
                  placeholder="e.g. 3500"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={5}
                placeholder="Describe the community, services, and amenities…"
              />
            </CardContent>
          </Card>

          {/* Care Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Care Types</CardTitle>
              <CardDescription>Select all that apply</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CARE_TYPES.map((type) => (
                  <Badge
                    key={type}
                    variant={form.careTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer select-none px-3 py-1.5 text-sm"
                    onClick={() => toggleCareType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Moderation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Moderation</CardTitle>
              <CardDescription>Visibility and verification status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Verified</p>
                  <p className="text-xs text-gray-500">Mark as verified by admin review</p>
                </div>
                <div className="flex items-center gap-2">
                  {form.isVerified ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <Switch
                    checked={form.isVerified}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, isVerified: v }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Hidden from public</p>
                  <p className="text-xs text-gray-500">Hides listing from all public searches and maps</p>
                </div>
                <div className="flex items-center gap-2">
                  {form.isHidden ? (
                    <EyeOff className="w-4 h-4 text-red-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                  <Switch
                    checked={form.isHidden}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, isHidden: v }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin-mega-dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateMutation.isPending ? (
                <>Saving…</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
