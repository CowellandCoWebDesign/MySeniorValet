import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Shield,
  Camera,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "wouter";
import { getCommunityUrl } from "@/lib/community-url";

export default function AdminCommunities() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const itemsPerPage = 20;

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const { data: communitiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/communities', currentPage, searchTerm, stateFilter, typeFilter, verificationFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        state: stateFilter,
        type: typeFilter,
        verification: verificationFilter
      });
      return await apiRequest('GET', `/api/admin/communities?${params}`);
    },
    enabled: isAdmin
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/communities/stats'],
    queryFn: () => apiRequest('GET', '/api/admin/communities/stats'),
    enabled: isAdmin
  });

  const updateCommunityMutation = useMutation({
    mutationFn: async ({ id, updates }: any) => {
      return await apiRequest('PUT', `/api/admin/communities/${id}`, updates);
    },
    onSuccess: () => {
      toast({ title: "Community Updated", description: "The community has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
    },
    onError: (error: any) => {
      toast({ title: "Update Failed", description: error.message || "Failed to update community", variant: "destructive" });
    }
  });

  const deleteCommunityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/communities/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Community Removed", description: "The community has been hidden and deactivated." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities/stats'] });
    },
    onError: (error: any) => {
      toast({ title: "Delete Failed", description: error.message || "Failed to delete community", variant: "destructive" });
    }
  });

  const verifyCommunityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('POST', `/api/admin/communities/${id}/verify`, { verified: true });
    },
    onSuccess: () => {
      toast({ title: "Community Verified", description: "The listing has been marked as verified." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities/stats'] });
    }
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: number[]; action: 'verify' | 'hide' | 'delete' }) => {
      return await apiRequest('POST', '/api/admin/communities/bulk', { ids, action });
    },
    onSuccess: (_, { ids, action }) => {
      const label = action === 'verify' ? 'Verified' : action === 'hide' ? 'Hidden' : 'Deleted';
      toast({ title: `Bulk ${label}`, description: `${ids.length} communit${ids.length === 1 ? 'y' : 'ies'} ${label.toLowerCase()} successfully.` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/communities/stats'] });
    },
    onError: (error: any) => {
      toast({ title: "Bulk Action Failed", description: error.message || "Failed to apply bulk action", variant: "destructive" });
    }
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You need admin privileges to access this page.</p>
              <Button className="mt-4" onClick={() => window.location.href = "/"}>Return to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const communities = communitiesData?.communities || [];
  const totalCommunities = communitiesData?.total || 0;
  const totalPages = Math.ceil(totalCommunities / itemsPerPage);

  const pageIds = communities.map((c: any) => c.id as number);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id: number) => selectedIds.has(id));
  const somePageSelected = pageIds.some((id: number) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        pageIds.forEach((id: number) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        pageIds.forEach((id: number) => next.add(id));
        return next;
      });
    }
  };

  const toggleRow = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const statsData = stats as any;
  const total = statsData?.total || 0;
  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

  const activeFilterCount = [
    searchTerm !== '',
    stateFilter !== 'all',
    typeFilter !== 'all',
    verificationFilter !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm('');
    setStateFilter('all');
    setTypeFilter('all');
    setVerificationFilter('all');
    setCurrentPage(1);
  };

  // Page window for pagination
  const pageWindow = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (currentPage > 3) pages.push('…');
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) pages.push(p);
    if (currentPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  })();

  const statCards = [
    { label: 'Total', value: statsData?.total, icon: Building2, bg: 'bg-slate-500/10', color: 'text-slate-600 dark:text-slate-300', sub: '' },
    { label: 'Verified', value: statsData?.verified, icon: CheckCircle2, bg: 'bg-green-500/10', color: 'text-green-600', sub: `${pct(statsData?.verified)}% of total` },
    { label: 'Premium', value: statsData?.premium, icon: Star, bg: 'bg-yellow-500/10', color: 'text-yellow-500', sub: '' },
    { label: 'With Photos', value: statsData?.withPhotos, icon: Camera, bg: 'bg-blue-500/10', color: 'text-blue-600', sub: `${pct(statsData?.withPhotos)}%` },
    { label: 'With Pricing', value: statsData?.withPricing, icon: DollarSign, bg: 'bg-purple-500/10', color: 'text-purple-600', sub: `${pct(statsData?.withPricing)}%` },
    { label: 'Active This Month', value: statsData?.activeThisMonth, icon: RefreshCw, bg: 'bg-teal-500/10', color: 'text-teal-600', sub: '' },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Communities Management
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage and monitor all communities on the platform
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin-mega-dashboard">
                <Button variant="outline" size="sm">Back to Dashboard</Button>
              </Link>
              <Button size="sm">
                <Building2 className="h-4 w-4 mr-2" />
                Add Community
              </Button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {statCards.map(({ label, value, icon: Icon, bg, color, sub }) => (
              <Card key={label} className="overflow-hidden">
                <CardContent className="p-3 flex items-start gap-2.5">
                  <div className={`rounded-md p-1.5 shrink-0 ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground leading-none mb-1">{label}</p>
                    <p className={`text-lg font-bold leading-none ${color}`}>
                      {value !== undefined ? value.toLocaleString() : <Skeleton className="h-4 w-10 inline-block" />}
                    </p>
                    {sub && value > 0 && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    All Communities
                    {totalCommunities > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">
                        ({totalCommunities.toLocaleString()})
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>Browse and manage communities across the platform</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="shrink-0">
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filter bar */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search by name, city, or ID…"
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-9 h-9"
                  />
                </div>

                <Select value={stateFilter} onValueChange={v => { setStateFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[140px] h-9">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="PA">Pennsylvania</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="AZ">Arizona</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[170px] h-9">
                    <SelectValue placeholder="Care Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="assisted_living">Assisted Living</SelectItem>
                    <SelectItem value="memory_care">Memory Care</SelectItem>
                    <SelectItem value="independent_living">Independent Living</SelectItem>
                    <SelectItem value="skilled_nursing">Skilled Nursing</SelectItem>
                    <SelectItem value="55_plus">55+ Active Adult</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={verificationFilter} onValueChange={v => { setVerificationFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[130px] h-9">
                    <Shield className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>

                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-9 text-muted-foreground hover:text-foreground gap-1.5" onClick={clearFilters}>
                    <X className="h-3.5 w-3.5" />
                    Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                  </Button>
                )}
              </div>

              {/* Table */}
              {error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                  <AlertCircle className="h-10 w-10 opacity-40 text-destructive" />
                  <p className="font-medium text-destructive">Failed to load communities</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
                </div>
              ) : (
                <>
                  <div className="rounded-md border overflow-hidden">
                    <ScrollArea className="h-[520px]">
                      <Table>
                        <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                          <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-10 pl-3">
                              <Checkbox
                                checked={allPageSelected}
                                onCheckedChange={toggleSelectAll}
                                aria-label="Select all on page"
                                className={somePageSelected && !allPageSelected ? "opacity-60" : ""}
                              />
                            </TableHead>
                            <TableHead className="font-semibold w-[220px]">Community</TableHead>
                            <TableHead className="font-semibold">Location</TableHead>
                            <TableHead className="font-semibold">Type</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Pricing</TableHead>
                            <TableHead className="font-semibold text-center w-[60px]">Photos</TableHead>
                            <TableHead className="font-semibold">Updated</TableHead>
                            <TableHead className="text-right font-semibold w-[140px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Skeleton loading */}
                          {isLoading && Array.from({ length: 8 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell className="pl-3"><Skeleton className="h-4 w-4" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-28 rounded-full" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-6 mx-auto" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-7 w-24 ml-auto" /></TableCell>
                            </TableRow>
                          ))}

                          {/* Empty state */}
                          {!isLoading && communities.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={9}>
                                <div className="flex flex-col items-center justify-center py-14 gap-2 text-muted-foreground">
                                  <Building2 className="h-10 w-10 opacity-20" />
                                  <p className="font-medium">No communities found</p>
                                  {activeFilterCount > 0 && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}

                          {/* Data rows */}
                          {!isLoading && communities.map((community: any) => {
                            const careLabel = (community.care_type || '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
                            const isSelected = selectedIds.has(community.id);
                            return (
                              <TableRow key={community.id} className={`transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                                {/* Checkbox */}
                                <TableCell className="py-2.5 pl-3 w-10">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleRow(community.id)}
                                    aria-label={`Select ${community.name}`}
                                  />
                                </TableCell>
                                {/* Name */}
                                <TableCell className="py-2.5">
                                  <p className="font-medium text-sm truncate max-w-[200px]" title={community.name}>
                                    {community.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground/60 mt-0.5">ID #{community.id}</p>
                                </TableCell>

                                {/* Location */}
                                <TableCell className="py-2.5">
                                  <div className="flex items-center gap-1 text-sm">
                                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <span>{community.city}, {community.state}</span>
                                  </div>
                                  {community.zip_code && (
                                    <p className="text-xs text-muted-foreground/60 mt-0.5 ml-4">{community.zip_code}</p>
                                  )}
                                </TableCell>

                                {/* Type */}
                                <TableCell className="py-2.5">
                                  {careLabel ? (
                                    <Badge variant="outline" className="text-[11px] font-normal whitespace-nowrap">
                                      {careLabel}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-muted-foreground/40">—</span>
                                  )}
                                </TableCell>

                                {/* Status */}
                                <TableCell className="py-2.5">
                                  <div className="flex flex-col gap-1">
                                    {community.is_verified ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium w-fit">
                                        <CheckCircle2 className="h-3 w-3" /> Verified
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium w-fit">
                                        <XCircle className="h-3 w-3" /> Unverified
                                      </span>
                                    )}
                                    {community.tier && (
                                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 font-medium w-fit capitalize">
                                        <Star className="h-2.5 w-2.5" /> {community.tier}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>

                                {/* Pricing */}
                                <TableCell className="py-2.5">
                                  {community.pricing_from ? (
                                    <div>
                                      <span className="text-sm font-medium">
                                        ${Number(community.pricing_from).toLocaleString()}
                                        <span className="text-xs text-muted-foreground font-normal">/mo</span>
                                      </span>
                                      {community.pricing_to && (
                                        <p className="text-xs text-muted-foreground">to ${Number(community.pricing_to).toLocaleString()}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground/40">No pricing</span>
                                  )}
                                </TableCell>

                                {/* Photos */}
                                <TableCell className="py-2.5 text-center">
                                  <span className={`inline-flex items-center justify-center gap-0.5 text-xs font-medium tabular-nums ${(community.photos?.length || 0) > 0 ? 'text-blue-500' : 'text-muted-foreground/30'}`}>
                                    <Camera className="h-3 w-3" />
                                    {community.photos?.length || 0}
                                  </span>
                                </TableCell>

                                {/* Updated */}
                                <TableCell className="py-2.5">
                                  <p className="text-xs text-muted-foreground">
                                    {community.updated_at ? format(new Date(community.updated_at), 'MMM d, yyyy') : '—'}
                                  </p>
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="py-2.5 text-right">
                                  <div className="flex items-center gap-0.5 justify-end">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Link href={getCommunityUrl(community)}>
                                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                                            <Eye className="h-3.5 w-3.5" />
                                          </Button>
                                        </Link>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">View listing</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Link href={`/community-dashboard/${community.id}`}>
                                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-500 hover:text-blue-600">
                                            <Edit className="h-3.5 w-3.5" />
                                          </Button>
                                        </Link>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">Edit community</TooltipContent>
                                    </Tooltip>

                                    {!community.is_verified && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                                            disabled={verifyCommunityMutation.isPending}
                                            onClick={() => verifyCommunityMutation.mutate(community.id)}
                                          >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Mark as verified</TooltipContent>
                                      </Tooltip>
                                    )}

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                          disabled={deleteCommunityMutation.isPending}
                                          onClick={() => {
                                            if (confirm(`Delete "${community.name}"? This cannot be undone.`)) {
                                              deleteCommunityMutation.mutate(community.id);
                                            }
                                          }}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">Delete community</TooltipContent>
                                    </Tooltip>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>

                  {/* Pagination */}
                  {totalPages > 0 && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        {totalCommunities > 0 ? (
                          <>
                            Showing {((currentPage - 1) * itemsPerPage + 1).toLocaleString()}–
                            {Math.min(currentPage * itemsPerPage, totalCommunities).toLocaleString()} of{' '}
                            <span className="font-medium text-foreground">{totalCommunities.toLocaleString()}</span> communities
                          </>
                        ) : `Page ${currentPage} of ${totalPages}`}
                      </p>
                      {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Button>
                          {pageWindow.map((p, i) =>
                            p === '…' ? (
                              <span key={`ellipsis-${i}`} className="text-muted-foreground text-sm px-1">…</span>
                            ) : (
                              <Button
                                key={p}
                                variant={p === currentPage ? 'default' : 'outline'}
                                size="sm"
                                className="h-8 w-8 p-0 text-xs"
                                onClick={() => setCurrentPage(p as number)}
                              >
                                {p}
                              </Button>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border bg-background/95 backdrop-blur-sm shadow-xl px-4 py-3 animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-green-500/40 text-green-600 hover:bg-green-500/10 hover:text-green-700"
            disabled={bulkActionMutation.isPending}
            onClick={() => bulkActionMutation.mutate({ ids: Array.from(selectedIds), action: 'verify' })}
          >
            {bulkActionMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Verify ({selectedIds.size})
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-orange-500/40 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700"
            disabled={bulkActionMutation.isPending}
            onClick={() => bulkActionMutation.mutate({ ids: Array.from(selectedIds), action: 'hide' })}
          >
            {bulkActionMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
            Hide ({selectedIds.size})
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
            disabled={bulkActionMutation.isPending}
            onClick={() => {
              if (confirm(`Permanently delete ${selectedIds.size} communit${selectedIds.size === 1 ? 'y' : 'ies'}? This cannot be undone.`)) {
                bulkActionMutation.mutate({ ids: Array.from(selectedIds), action: 'delete' });
              }
            }}
          >
            {bulkActionMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete ({selectedIds.size})
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-1 text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedIds(new Set())}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </TooltipProvider>
  );
}
