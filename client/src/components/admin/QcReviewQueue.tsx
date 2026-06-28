import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { RemovalRequestModal } from "@/components/RemovalRequestModal";
import {
  ShieldCheck,
  EyeOff,
  Sparkles,
  Trash2,
  RefreshCw,
  Loader2,
  MapPin,
  Globe,
  Phone,
  ImageIcon,
  FileText,
  Filter,
} from "lucide-react";

interface QcCommunity {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  care_types: string[] | null;
  data_quality_flags: string[] | null;
  is_hidden: boolean;
  is_active: boolean;
  flag_status: string | null;
  senior_classification: string | null;
  quality_score: number | null;
  quality_tier: string | null;
  data_source: string | null;
  enrichment_status: string | null;
  website: string | null;
  phone: string | null;
  photo_count: number;
  description: string | null;
}

interface ReasonCount {
  id: string;
  label: string;
  count: number;
}

interface QcQueueResponse {
  communities: QcCommunity[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  backlogTotal: number;
  reasons: ReasonCount[];
  reviewed: boolean;
}

type QcAction = "restore" | "keep-hidden" | "enrich";

const CLASSIFICATION_OPTIONS = [
  { value: "all", label: "Any classification" },
  { value: "non_senior", label: "Non-senior" },
  { value: "senior", label: "Senior" },
  { value: "unknown", label: "Unknown" },
  { value: "unscored", label: "Unscored" },
];

const TIER_OPTIONS = [
  { value: "all", label: "Any tier" },
  { value: "featured", label: "Featured" },
  { value: "verified", label: "Verified" },
  { value: "good", label: "Good" },
  { value: "thin", label: "Thin" },
  { value: "empty", label: "Empty" },
  { value: "unscored", label: "Unscored" },
];

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== "all") usp.set(k, String(v));
  }
  return usp.toString();
}

export function QcReviewQueue() {
  const { toast } = useToast();

  // Filters
  const [reason, setReason] = useState<string>("");
  const [source, setSource] = useState("");
  const [sourceInput, setSourceInput] = useState("");
  const [seniorClassification, setSeniorClassification] = useState("all");
  const [tier, setTier] = useState("all");
  const [scoreMin, setScoreMin] = useState("");
  const [scoreMax, setScoreMax] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [page, setPage] = useState(1);

  // Selection
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Dialogs
  const [confirmBulk, setConfirmBulk] = useState<null | { action: QcAction; ids: number[] }>(null);
  const [removalTarget, setRemovalTarget] = useState<QcCommunity | null>(null);
  const [bulkRemoval, setBulkRemoval] = useState<null | QcCommunity[]>(null);

  const queryString = buildQueryString({
    reason,
    source,
    seniorClassification,
    tier,
    scoreMin,
    scoreMax,
    search,
    reviewed: reviewed ? "true" : "false",
    page,
    limit: 50,
  });

  const queryKey = ["/api/admin/communities/qc-queue", queryString];

  const { data, isLoading, isFetching, refetch } = useQuery<QcQueueResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/admin/communities/qc-queue?${queryString}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load QC queue");
      return res.json();
    },
  });

  const communities = data?.communities ?? [];
  const reasons = data?.reasons ?? [];

  const actionMutation = useMutation({
    mutationFn: async ({ action, ids }: { action: QcAction; ids: number[] }) => {
      return apiRequest("POST", "/api/admin/communities/qc-action", { action, ids });
    },
    onSuccess: (result: any, variables) => {
      const { action, ids } = variables;
      let description = "";
      if (action === "restore") {
        description = `${ids.length} ${ids.length === 1 ? "community" : "communities"} restored to public.`;
      } else if (action === "keep-hidden") {
        description = `${ids.length} ${ids.length === 1 ? "community" : "communities"} confirmed hidden.`;
      } else {
        const restored = Array.isArray(result?.results)
          ? result.results.filter((r: any) => r.restored).length
          : 0;
        description = `Enriched ${ids.length}; ${restored} auto-restored after gaining content.`;
      }
      toast({ title: "Done", description });
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/admin/communities/qc-queue"] });
    },
    onError: (err: any) => {
      toast({
        title: "Action failed",
        description: err?.message || "Could not complete the action.",
        variant: "destructive",
      });
    },
  });

  const isActing = actionMutation.isPending;

  const runAction = (action: QcAction, ids: number[]) => {
    if (ids.length === 0) return;
    actionMutation.mutate({ action, ids });
  };

  // Bulk restore is broad and changes public visibility — confirm first.
  const requestBulk = (action: QcAction) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === "restore") {
      setConfirmBulk({ action, ids });
    } else {
      runAction(action, ids);
    }
  };

  const allOnPageSelected =
    communities.length > 0 && communities.every((c) => selected.has(c.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        communities.forEach((c) => next.delete(c.id));
      } else {
        communities.forEach((c) => next.add(c.id));
      }
      return next;
    });
  };

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applyTextFilters = () => {
    setSource(sourceInput.trim());
    setSearch(searchInput.trim());
    setPage(1);
  };

  const selectReason = (id: string) => {
    setReason((prev) => (prev === id ? "" : id));
    setPage(1);
    setSelected(new Set());
  };

  const selectedCount = selected.size;

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-xl font-bold">QC Review &amp; Resolution Queue</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Adjudicate hidden &amp; deactivated communities. Showing real flags, score,
                  classification &amp; source — nothing invented.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {(data?.backlogTotal ?? 0).toLocaleString()}{" "}
                {reviewed ? "reviewed" : "in backlog"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                data-testid="button-qc-refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reason filter pills */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={reason === "" ? "default" : "outline"}
              size="sm"
              onClick={() => selectReason("")}
              data-testid="filter-reason-all"
            >
              All reasons
            </Button>
            {reasons.map((r) => (
              <Button
                key={r.id}
                variant={reason === r.id ? "default" : "outline"}
                size="sm"
                onClick={() => selectReason(r.id)}
                data-testid={`filter-reason-${r.id}`}
              >
                {r.label}
                <Badge
                  variant="secondary"
                  className="ml-2 px-1.5 py-0 text-xs"
                >
                  {r.count.toLocaleString()}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Secondary filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Filter className="w-3 h-3" /> Search name / city
              </Label>
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyTextFilters()}
                placeholder="e.g. Sunrise, Toronto"
                data-testid="input-qc-search"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data source contains</Label>
              <Input
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyTextFilters()}
                placeholder="e.g. HUD, Perplexity, Ontario"
                data-testid="input-qc-source"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Senior classification</Label>
              <Select
                value={seniorClassification}
                onValueChange={(v) => {
                  setSeniorClassification(v);
                  setPage(1);
                }}
              >
                <SelectTrigger data-testid="select-qc-classification">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSIFICATION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Quality tier</Label>
              <Select
                value={tier}
                onValueChange={(v) => {
                  setTier(v);
                  setPage(1);
                }}
              >
                <SelectTrigger data-testid="select-qc-tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Score band (0–100)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={scoreMin}
                  onChange={(e) => setScoreMin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setPage(1)}
                  placeholder="min"
                  data-testid="input-qc-score-min"
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={scoreMax}
                  onChange={(e) => setScoreMax(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setPage(1)}
                  placeholder="max"
                  data-testid="input-qc-score-max"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={applyTextFilters} data-testid="button-qc-apply">
                Apply filters
              </Button>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="qc-reviewed"
                  checked={reviewed}
                  onCheckedChange={(v) => {
                    setReviewed(!!v);
                    setPage(1);
                    setSelected(new Set());
                  }}
                  data-testid="checkbox-qc-reviewed"
                />
                <Label htmlFor="qc-reviewed" className="text-sm cursor-pointer">
                  Show reviewed (kept-hidden) items
                </Label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {(data?.total ?? 0).toLocaleString()} match current filters
            </p>
          </div>

          {/* Bulk action bar */}
          {selectedCount > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-2 rounded-lg border bg-muted/40 px-4 py-2">
              <span className="text-sm font-medium">{selectedCount} selected</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => requestBulk("restore")}
                  disabled={isActing}
                  data-testid="button-bulk-restore"
                >
                  <ShieldCheck className="w-4 h-4 mr-1" /> Restore
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => requestBulk("keep-hidden")}
                  disabled={isActing}
                  data-testid="button-bulk-keep-hidden"
                >
                  <EyeOff className="w-4 h-4 mr-1" /> Keep hidden
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => requestBulk("enrich")}
                  disabled={isActing}
                  data-testid="button-bulk-enrich"
                >
                  <Sparkles className="w-4 h-4 mr-1" /> Enrich
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={() => {
                    const chosen = communities.filter((c) => selected.has(c.id));
                    if (chosen.length > 0) setBulkRemoval(chosen);
                  }}
                  disabled={isActing}
                  data-testid="button-bulk-removal"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Send to removal…
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelected(new Set())}
                  disabled={isActing}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading queue…
            </div>
          ) : communities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <ShieldCheck className="w-10 h-10 mb-3 opacity-40" />
              <p className="font-medium">Nothing to review here</p>
              <p className="text-sm">
                {reviewed
                  ? "No reviewed items match these filters."
                  : "This part of the backlog is clear."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={toggleAll}
                  data-testid="checkbox-qc-select-all"
                />
                <span className="text-xs text-muted-foreground">Select all on page</span>
              </div>
              {communities.map((c) => (
                <QcRow
                  key={c.id}
                  community={c}
                  checked={selected.has(c.id)}
                  onToggle={() => toggleOne(c.id)}
                  onAction={(a) => runAction(a, [c.id])}
                  onRemoval={() => setRemovalTarget(c)}
                  disabled={isActing}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isFetching}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk restore confirmation */}
      <AlertDialog
        open={!!confirmBulk}
        onOpenChange={(open) => !open && setConfirmBulk(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore {confirmBulk?.ids.length} communities to public?</AlertDialogTitle>
            <AlertDialogDescription>
              These listings will become publicly visible again and their quality/protective
              flags will be cleared. You can re-hide them at any time. This does not delete
              anything.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmBulk) runAction(confirmBulk.action, confirmBulk.ids);
                setConfirmBulk(null);
              }}
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Removal flow — explicit, manual, authorized via existing removal-request flow */}
      <RemovalRequestModal
        open={!!removalTarget}
        onOpenChange={(open) => !open && setRemovalTarget(null)}
        entityType="community"
        entityId={removalTarget?.id}
        entityName={removalTarget?.name}
      />

      {/* Bulk removal — submits one removal request per selected community via the
          SAME removal-request flow. Still explicit & manual: an admin must fill in
          requestor + reason before anything is submitted; nothing is auto-removed. */}
      <BulkRemovalDialog
        communities={bulkRemoval}
        onClose={() => setBulkRemoval(null)}
        onSubmitted={() => {
          setBulkRemoval(null);
          setSelected(new Set());
        }}
      />
    </div>
  );
}

function BulkRemovalDialog({
  communities,
  onClose,
  onSubmitted,
}: {
  communities: QcCommunity[] | null;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    requestorName: "",
    requestorEmail: "",
    requestorRole: "owner",
    reason: "",
    legalBasis: "",
  });

  const list = communities ?? [];
  const canSubmit =
    form.requestorName.trim() !== "" &&
    form.requestorEmail.trim() !== "" &&
    form.reason.trim() !== "";

  const submit = async () => {
    if (!canSubmit || list.length === 0) return;
    setSubmitting(true);
    let ok = 0;
    let failed = 0;
    for (const c of list) {
      try {
        const res = await fetch("/api/removal-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            requestType: "community",
            entityId: c.id,
            entityName: c.name,
            requestorName: form.requestorName,
            requestorEmail: form.requestorEmail,
            requestorPhone: "",
            requestorRole: form.requestorRole,
            reason: form.reason,
            legalBasis: form.legalBasis,
            additionalNotes: `Bulk removal request submitted from admin QC review queue for ${list.length} communities.`,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success !== false) ok += 1;
        else failed += 1;
      } catch {
        failed += 1;
      }
    }
    setSubmitting(false);
    toast({
      title: "Removal requests submitted",
      description: `${ok} submitted${failed > 0 ? `, ${failed} failed` : ""}. Each goes through the standard manual review.`,
      variant: failed > 0 ? "destructive" : undefined,
    });
    setForm({ requestorName: "", requestorEmail: "", requestorRole: "owner", reason: "", legalBasis: "" });
    onSubmitted();
  };

  return (
    <Dialog open={list.length > 0} onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send {list.length} communities to removal flow</DialogTitle>
          <DialogDescription>
            This submits a formal removal request for each selected listing through the
            standard removal-request process. Nothing is deleted automatically — each
            request is reviewed and actioned manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="rounded-lg border bg-muted/40 p-3 max-h-32 overflow-y-auto text-sm">
            <ul className="list-disc list-inside space-y-0.5">
              {list.map((c) => (
                <li key={c.id} className="truncate">
                  {c.name}
                  {c.city ? ` — ${c.city}${c.state ? ", " + c.state : ""}` : ""}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Requestor name</Label>
              <Input
                value={form.requestorName}
                onChange={(e) => setForm({ ...form, requestorName: e.target.value })}
                data-testid="input-bulk-removal-name"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Requestor email</Label>
              <Input
                type="email"
                value={form.requestorEmail}
                onChange={(e) => setForm({ ...form, requestorEmail: e.target.value })}
                data-testid="input-bulk-removal-email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Requestor role</Label>
              <Select
                value={form.requestorRole}
                onValueChange={(v) => setForm({ ...form, requestorRole: v })}
              >
                <SelectTrigger data-testid="select-bulk-removal-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Business Owner</SelectItem>
                  <SelectItem value="authorized_representative">
                    Authorized Representative
                  </SelectItem>
                  <SelectItem value="legal_counsel">Legal Counsel</SelectItem>
                  <SelectItem value="platform_admin">Platform Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Legal basis (optional)</Label>
              <Select
                value={form.legalBasis || "none"}
                onValueChange={(v) => setForm({ ...form, legalBasis: v === "none" ? "" : v })}
              >
                <SelectTrigger data-testid="select-bulk-removal-legal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  <SelectItem value="accuracy">Inaccurate Information</SelectItem>
                  <SelectItem value="privacy">Privacy Concerns</SelectItem>
                  <SelectItem value="copyright">Copyright Infringement</SelectItem>
                  <SelectItem value="trademark">Trademark Violation</SelectItem>
                  <SelectItem value="other">Other Legal Reason</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Reason for removal</Label>
            <Textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Explain why these listings should be removed…"
              rows={3}
              data-testid="textarea-bulk-removal-reason"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={submit}
            disabled={!canSubmit || submitting}
            data-testid="button-bulk-removal-submit"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…
              </>
            ) : (
              `Submit ${list.length} removal requests`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function flagTone(flag: string): string {
  if (["clearly_fake", "synthetic_suspected", "non_senior"].includes(flag)) {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  }
  if (["geo_needs_review", "not_geocoded", "no_street_number"].includes(flag)) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
  }
  return "bg-muted text-muted-foreground";
}

function QcRow({
  community,
  checked,
  onToggle,
  onAction,
  onRemoval,
  disabled,
}: {
  community: QcCommunity;
  checked: boolean;
  onToggle: () => void;
  onAction: (a: QcAction) => void;
  onRemoval: () => void;
  disabled: boolean;
}) {
  const c = community;
  const flags = Array.isArray(c.data_quality_flags) ? c.data_quality_flags : [];
  const location = [c.city, c.state, c.country].filter(Boolean).join(", ");

  return (
    <div className="rounded-lg border p-3 hover:bg-muted/30 transition-colors" data-testid={`qc-row-${c.id}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={onToggle}
          className="mt-1"
          data-testid={`checkbox-qc-${c.id}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold truncate">{c.name}</span>
            {c.is_hidden && (
              <Badge variant="outline" className="text-xs">
                <EyeOff className="w-3 h-3 mr-1" /> Hidden
              </Badge>
            )}
            {!c.is_active && (
              <Badge variant="outline" className="text-xs border-red-300 text-red-700 dark:text-red-300">
                Deactivated
              </Badge>
            )}
            {c.flag_status && (
              <Badge variant="outline" className="text-xs">
                flag: {c.flag_status}
              </Badge>
            )}
          </div>

          {location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {location}
            </p>
          )}

          {/* Real signals */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            <Badge variant="secondary">
              Score: {c.quality_score ?? "—"}
            </Badge>
            <Badge variant="secondary">Tier: {c.quality_tier ?? "unscored"}</Badge>
            <Badge variant="secondary">
              Class: {c.senior_classification ?? "unscored"}
            </Badge>
            <Badge variant="secondary">Enrich: {c.enrichment_status ?? "—"}</Badge>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <ImageIcon className="w-3 h-3" /> {c.photo_count}
            </span>
            {c.website && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Globe className="w-3 h-3" /> site
              </span>
            )}
            {c.phone && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Phone className="w-3 h-3" /> phone
              </span>
            )}
          </div>

          {c.data_source && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              Source: {c.data_source}
            </p>
          )}

          {flags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {flags.map((f) => (
                <span
                  key={f}
                  className={`text-[11px] px-1.5 py-0.5 rounded ${flagTone(f)}`}
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          {c.description && (
            <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
              <FileText className="w-3 h-3 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{c.description}</span>
            </p>
          )}
        </div>

        {/* Per-item actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("restore")}
            disabled={disabled}
            data-testid={`button-restore-${c.id}`}
          >
            <ShieldCheck className="w-4 h-4 mr-1" /> Restore
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("keep-hidden")}
            disabled={disabled}
            data-testid={`button-keep-hidden-${c.id}`}
          >
            <EyeOff className="w-4 h-4 mr-1" /> Keep hidden
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("enrich")}
            disabled={disabled}
            data-testid={`button-enrich-${c.id}`}
          >
            <Sparkles className="w-4 h-4 mr-1" /> Enrich
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={onRemoval}
            disabled={disabled}
            data-testid={`button-removal-${c.id}`}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Removal…
          </Button>
        </div>
      </div>
    </div>
  );
}
