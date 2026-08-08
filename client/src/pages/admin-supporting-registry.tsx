import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";

/**
 * Admin page for the Supporting-Community Registry (Task #483).
 *
 * Focused review surface for the controlled referral-support registry:
 *   - effective eligibility + public gate status,
 *   - operator families (approve / revoke),
 *   - proposed community matches (approve / revoke),
 *   - individual approvals + permanent exclusions.
 *
 * Community-level exclusions ALWAYS override family inheritance and individual
 * approval. The public gate only becomes enabled after seeding succeeds and the
 * eligible count is > 0.
 */

interface GateResponse {
  gate: { enabled: boolean; seededAt?: string; eligibleCount?: number; reason?: string };
  eligibility: {
    eligibleCount: number;
    familyInheritedCount: number;
    individuallyApprovedCount: number;
    excludedCount: number;
  };
}

const STATUSES = ["approved", "proposed", "rejected", "revoked"] as const;

export default function AdminSupportingRegistry() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [approval, setApproval] = useState({ name: "", city: "", state: "" });
  const [exclusion, setExclusion] = useState({
    name: "",
    city: "",
    state: "",
    reason: "other",
    note: "",
  });

  const gateQuery = useQuery<GateResponse>({ queryKey: ["/api/admin/registry/gate"] });
  const familiesQuery = useQuery<{ families: any[] }>({
    queryKey: [`/api/admin/registry/families${statusFilter ? `?status=${statusFilter}` : ""}`],
  });
  const matchesQuery = useQuery<{ matches: any[] }>({
    queryKey: ["/api/admin/registry/matches?status=proposed"],
  });
  const approvalsQuery = useQuery<{ approvals: any[] }>({ queryKey: ["/api/admin/registry/approvals"] });
  const exclusionsQuery = useQuery<{ exclusions: any[] }>({ queryKey: ["/api/admin/registry/exclusions"] });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/registry/gate"] });
    queryClient.invalidateQueries();
  };

  const familyStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("POST", `/api/admin/registry/families/${id}/status`, { status }),
    onSuccess: invalidateAll,
  });
  const matchStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("POST", `/api/admin/registry/matches/${id}/status`, { status }),
    onSuccess: invalidateAll,
  });
  const revokeApproval = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/admin/registry/approvals/${id}/revoke`, {}),
    onSuccess: invalidateAll,
  });
  const addApproval = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/registry/approvals", approval),
    onSuccess: () => {
      setApproval({ name: "", city: "", state: "" });
      invalidateAll();
    },
  });
  const addExclusion = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/registry/exclusions", exclusion),
    onSuccess: () => {
      setExclusion({ name: "", city: "", state: "", reason: "other", note: "" });
      invalidateAll();
    },
  });

  const el = gateQuery.data?.eligibility;
  const gate = gateQuery.data?.gate;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        title="Supporting-Community Registry"
        subtitle="Controlled referral-support allowlist for public offerings"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Link href="/admin">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </Link>

        {/* Gate + eligibility */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label="Public gate"
            value={gate?.enabled ? "ENABLED" : "disabled"}
            highlight={gate?.enabled}
          />
          <StatCard label="Eligible" value={el?.eligibleCount ?? "—"} />
          <StatCard label="Family-inherited" value={el?.familyInheritedCount ?? "—"} />
          <StatCard label="Individually approved" value={el?.individuallyApprovedCount ?? "—"} />
          <StatCard label="Excluded" value={el?.excludedCount ?? "—"} />
        </section>

        {/* Operator families */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Operator families</h2>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Table
            headers={["Name", "Status", "Aliases", "Domains", "Matches", "Proposed", "Actions"]}
            rows={(familiesQuery.data?.families ?? []).map((f: any) => [
              f.name,
              <Badge key="s" status={f.status} />,
              f.alias_count,
              f.domain_count,
              f.match_count,
              f.proposed_match_count,
              <div key="a" className="flex gap-2">
                {f.status !== "approved" && (
                  <Button size="sm" onClick={() => familyStatus.mutate({ id: f.id, status: "approved" })}>
                    Approve
                  </Button>
                )}
                {f.status === "approved" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => familyStatus.mutate({ id: f.id, status: "revoked" })}
                  >
                    Revoke
                  </Button>
                )}
              </div>,
            ])}
          />
        </section>

        {/* Proposed matches queue */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Proposed community matches (review queue)</h2>
          <Table
            headers={["Community", "City/State", "Family", "Method", "Actions"]}
            rows={(matchesQuery.data?.matches ?? []).map((m: any) => [
              m.community_name,
              `${m.community_city}, ${m.community_state}`,
              m.family_name,
              m.match_method,
              <div key="a" className="flex gap-2">
                <Button size="sm" onClick={() => matchStatus.mutate({ id: m.id, status: "approved" })}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => matchStatus.mutate({ id: m.id, status: "rejected" })}
                >
                  Reject
                </Button>
              </div>,
            ])}
          />
        </section>

        {/* Individual approvals */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Individually approved communities</h2>
          <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto] mb-4 rounded-lg border bg-white p-3">
            <Input
              aria-label="Community name to approve"
              placeholder="Community name"
              value={approval.name}
              onChange={(e) => setApproval({ ...approval, name: e.target.value })}
            />
            <Input
              aria-label="Approval city"
              placeholder="City"
              value={approval.city}
              onChange={(e) => setApproval({ ...approval, city: e.target.value })}
            />
            <Input
              aria-label="Approval state"
              placeholder="State"
              value={approval.state}
              onChange={(e) => setApproval({ ...approval, state: e.target.value })}
            />
            <Button
              disabled={
                addApproval.isPending ||
                !approval.name.trim() ||
                !approval.city.trim() ||
                !approval.state.trim()
              }
              onClick={() => addApproval.mutate()}
            >
              Approve community
            </Button>
          </div>
          <Table
            headers={["Name", "City/State", "Status", "Actions"]}
            rows={(approvalsQuery.data?.approvals ?? []).map((a: any) => [
              a.name,
              `${a.city}, ${a.state}`,
              <Badge key="s" status={a.status} />,
              a.status === "approved" ? (
                <Button
                  key="r"
                  size="sm"
                  variant="destructive"
                  onClick={() => revokeApproval.mutate(a.id)}
                >
                  Revoke
                </Button>
              ) : (
                "—"
              ),
            ])}
          />
        </section>

        {/* Exclusions */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Permanent exclusions (override everything)</h2>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_2fr_auto] mb-4 rounded-lg border bg-white p-3">
            <Input
              aria-label="Community name to exclude"
              placeholder="Community name"
              value={exclusion.name}
              onChange={(e) => setExclusion({ ...exclusion, name: e.target.value })}
            />
            <Input
              aria-label="Exclusion city"
              placeholder="City"
              value={exclusion.city}
              onChange={(e) => setExclusion({ ...exclusion, city: e.target.value })}
            />
            <Input
              aria-label="Exclusion state"
              placeholder="State"
              value={exclusion.state}
              onChange={(e) => setExclusion({ ...exclusion, state: e.target.value })}
            />
            <select
              aria-label="Exclusion reason"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={exclusion.reason}
              onChange={(e) => setExclusion({ ...exclusion, reason: e.target.value })}
            >
              <option value="closed">Closed</option>
              <option value="no_referrals">Does not accept referrals</option>
              <option value="duplicate">Duplicate</option>
              <option value="other">Other</option>
            </select>
            <Input
              aria-label="Exclusion note"
              placeholder="Reason or evidence note"
              value={exclusion.note}
              onChange={(e) => setExclusion({ ...exclusion, note: e.target.value })}
            />
            <Button
              variant="destructive"
              disabled={
                addExclusion.isPending ||
                !exclusion.name.trim() ||
                !exclusion.city.trim() ||
                !exclusion.state.trim()
              }
              onClick={() => addExclusion.mutate()}
            >
              Exclude community
            </Button>
          </div>
          <Table
            headers={["Name", "City/State", "Reason", "Note"]}
            rows={(exclusionsQuery.data?.exclusions ?? []).map((x: any) => [
              x.name,
              `${x.city}, ${x.state}`,
              x.reason,
              x.note ?? "—",
            ])}
          />
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "bg-green-50 border-green-300" : "bg-white"}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const color =
    status === "approved"
      ? "bg-green-100 text-green-800"
      : status === "proposed"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-gray-200 text-gray-700";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{status}</span>;
}

function Table({ headers, rows }: { headers: string[]; rows: any[][] }) {
  return (
    <div className="overflow-x-auto border rounded-lg bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2 font-medium text-gray-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-3 py-4 text-center text-gray-400">
                No records.
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-t">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
