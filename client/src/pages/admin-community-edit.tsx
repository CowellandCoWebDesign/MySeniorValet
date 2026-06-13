import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Save, AlertCircle, CheckCircle, Eye, EyeOff,
  Upload, Plus, Trash2, Star, ArrowUp, ArrowDown, Image, Link2, X, Loader2
} from "lucide-react";

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

const COMMON_AMENITIES = [
  "Restaurant-Style Dining",
  "Fitness Center",
  "Swimming Pool",
  "Beauty Salon",
  "Library",
  "Transportation Services",
  "Pet Friendly",
  "Outdoor Garden",
  "Activity Room",
  "Movie Theater",
  "Chapel",
  "24/7 Security",
  "On-Site Laundry",
  "Concierge",
  "Housekeeping",
  "Wi-Fi",
  "Pharmacy",
  "Physical Therapy",
  "Occupational Therapy",
];

export default function AdminCommunityEdit() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

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
    amenities: [] as string[],
    isVerified: false,
    isFeaturedBrand: false,
    isHidden: false,
    adminRatingOverride: "" as string,
    adminRatingNote: "" as string,
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");
  const [photoTab, setPhotoTab] = useState<"url" | "upload">("url");
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        amenities: community.amenities ?? [],
        isVerified: community.isVerified ?? false,
        isFeaturedBrand: community.isFeaturedBrand ?? false,
        isHidden: community.isHidden ?? false,
        adminRatingOverride: community.adminRatingOverride != null ? String(community.adminRatingOverride) : "",
        adminRatingNote: community.adminRatingNote ?? "",
      });
      setPhotos(community.photos ?? []);
    }
  }, [community]);

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["/api/admin/communities"] });
    qc.invalidateQueries({ queryKey: ["/api/communities"] });
    qc.invalidateQueries({ queryKey: [`/api/communities/${communityId}`] });
    qc.invalidateQueries({ queryKey: ["/api/communities/by-slug"] });
  };

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) =>
      apiRequest("PUT", `/api/admin/communities/${communityId}`, data),
    onSuccess: () => {
      toast({ title: "Community updated", description: "Changes saved successfully." });
      invalidateAll();
    },
    onError: (err: any) => {
      let message = "Failed to save changes.";
      try {
        const jsonMatch = err?.message?.match(/^\d+: (.+)$/s);
        if (jsonMatch) {
          const body = JSON.parse(jsonMatch[1]);
          if (body?.errors?.length) message = body.errors.join(", ");
          else if (body?.message) message = body.message;
        }
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

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (!trimmed || form.amenities.includes(trimmed)) return;
    setForm((prev) => ({ ...prev, amenities: [...prev.amenities, trimmed] }));
    setCustomAmenity("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  // ─── Photo mutations ──────────────────────────────────────────────────────
  const addPhotoUrl = async () => {
    const url = photoUrlInput.trim();
    if (!url) return;
    try {
      const res = await fetch(`/api/admin/communities/${communityId}/photos/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add photo");
      setPhotos(data.photos);
      setPhotoUrlInput("");
      toast({ title: "Photo added" });
      invalidateAll();
    } catch (err: any) {
      toast({ title: "Failed to add photo", description: err.message, variant: "destructive" });
    }
  };

  const uploadPhotoFile = async (file: File) => {
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch(`/api/admin/communities/${communityId}/photos/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setPhotos(data.photos);
      toast({ title: "Photo uploaded" });
      invalidateAll();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = async (url: string) => {
    try {
      const res = await fetch(`/api/admin/communities/${communityId}/photos`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove photo");
      setPhotos(data.photos);
      toast({ title: "Photo removed" });
      invalidateAll();
    } catch (err: any) {
      toast({ title: "Failed to remove photo", description: err.message, variant: "destructive" });
    }
  };

  const setPrimary = async (url: string) => {
    try {
      const res = await fetch(`/api/admin/communities/${communityId}/photos/primary`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set primary");
      setPhotos(data.photos);
      toast({ title: "Primary photo updated" });
      invalidateAll();
    } catch (err: any) {
      toast({ title: "Failed to set primary", description: err.message, variant: "destructive" });
    }
  };

  const movePhoto = async (index: number, direction: "up" | "down") => {
    const next = [...photos];
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    try {
      const res = await fetch(`/api/admin/communities/${communityId}/photos/reorder`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reorder");
      setPhotos(data.photos);
      invalidateAll();
      toast({ title: "Photos reordered" });
    } catch (err: any) {
      toast({ title: "Failed to reorder", description: err.message, variant: "destructive" });
    }
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

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Amenities</CardTitle>
              <CardDescription>Select common amenities or add custom ones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {COMMON_AMENITIES.map((a) => (
                  <Badge
                    key={a}
                    variant={form.amenities.includes(a) ? "default" : "outline"}
                    className="cursor-pointer select-none px-3 py-1.5 text-sm"
                    onClick={() => toggleAmenity(a)}
                  >
                    {a}
                  </Badge>
                ))}
              </div>
              {/* Custom amenities already selected but not in COMMON_AMENITIES */}
              {form.amenities.filter(a => !COMMON_AMENITIES.includes(a)).map((a) => (
                <Badge
                  key={a}
                  variant="default"
                  className="cursor-pointer select-none px-3 py-1.5 text-sm"
                  onClick={() => toggleAmenity(a)}
                >
                  {a} <X className="ml-1 h-3 w-3 inline" />
                </Badge>
              ))}
              <div className="flex gap-2">
                <Input
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  placeholder="Add custom amenity…"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomAmenity}>
                  <Plus className="w-4 h-4" />
                </Button>
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
                  <p className="font-medium text-sm">Featured Brand</p>
                  <p className="text-xs text-gray-500">Mark as a highlighted/featured senior living brand</p>
                </div>
                <div className="flex items-center gap-2">
                  {form.isFeaturedBrand ? (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <Star className="w-4 h-4 text-gray-400" />
                  )}
                  <Switch
                    checked={form.isFeaturedBrand}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, isFeaturedBrand: v }))}
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

          {/* Manual Rating Override */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Manual Rating Override
              </CardTitle>
              <CardDescription>
                Use only for verified external ratings (e.g. state inspection scores). Leave blank to show ratings from real user reviews only.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminRatingOverride">Rating (1.0 – 5.0)</Label>
                <Input
                  id="adminRatingOverride"
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={form.adminRatingOverride}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((p) => ({ ...p, adminRatingOverride: v }));
                  }}
                  placeholder="e.g. 4.2"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  When set, this overrides the platform-calculated rating. Clear to revert to user reviews.
                </p>
              </div>
              <div>
                <Label htmlFor="adminRatingNote">Source / Note</Label>
                <Input
                  id="adminRatingNote"
                  value={form.adminRatingNote}
                  onChange={(e) => setForm((p) => ({ ...p, adminRatingNote: e.target.value }))}
                  placeholder="e.g. State inspection report – May 2026"
                  className="mt-1"
                />
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
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </div>
        </form>

        {/* Photo Gallery — outside the profile form so saves are independent */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Image className="w-4 h-4" />
              Photo Gallery
            </CardTitle>
            <CardDescription>
              Manage community photos. The first photo is the primary/cover image. Changes apply immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add photo controls */}
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setPhotoTab("url")}
                className={`text-sm px-3 py-1.5 rounded border transition-colors ${photoTab === "url" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                <Link2 className="w-3 h-3 inline mr-1" />Add URL
              </button>
              <button
                type="button"
                onClick={() => setPhotoTab("upload")}
                className={`text-sm px-3 py-1.5 rounded border transition-colors ${photoTab === "upload" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                <Upload className="w-3 h-3 inline mr-1" />Upload File
              </button>
            </div>

            {photoTab === "url" && (
              <div className="flex gap-2">
                <Input
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPhotoUrl(); } }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addPhotoUrl} disabled={!photoUrlInput.trim()}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            )}

            {photoTab === "upload" && (
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhotoFile(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                >
                  {photoUploading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading…</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" />Choose Image</>
                  )}
                </Button>
                <p className="text-xs text-gray-500">JPEG, PNG, WebP, GIF · max 10 MB</p>
              </div>
            )}

            {/* Photo grid */}
            {photos.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-10 text-center text-gray-400">
                <Image className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No photos yet. Add a URL or upload a file above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((url, idx) => (
                  <div
                    key={url}
                    className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${idx === 0 ? "border-yellow-400" : "border-transparent"}`}
                  >
                    <img
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-36 object-cover bg-gray-100 dark:bg-gray-800"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='144' viewBox='0 0 200 144'%3E%3Crect fill='%23374151' width='200' height='144'/%3E%3Ctext fill='%239CA3AF' font-size='13' font-family='sans-serif' x='50%25' y='50%25' text-anchor='middle' dy='.35em'%3EImage unavailable%3C/text%3E%3C/svg%3E";
                      }}
                    />

                    {idx === 0 && (
                      <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-900" /> Primary
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      {idx !== 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="w-full text-xs"
                          onClick={() => setPrimary(url)}
                        >
                          <Star className="w-3 h-3 mr-1" /> Set Primary
                        </Button>
                      )}
                      <div className="flex gap-1 w-full">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="flex-1 text-xs"
                          disabled={idx === 0}
                          onClick={() => movePhoto(idx, "up")}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="flex-1 text-xs"
                          disabled={idx === photos.length - 1}
                          onClick={() => movePhoto(idx, "down")}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="w-full text-xs"
                        onClick={() => removePhoto(url)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {photos.length > 0 && (
              <p className="text-xs text-gray-400">
                {photos.length} photo{photos.length !== 1 ? "s" : ""}. Hover a photo to set as primary, reorder, or remove.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
