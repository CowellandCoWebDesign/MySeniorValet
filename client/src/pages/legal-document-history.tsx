import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Clock, 
  Shield, 
  Download, 
  Eye, 
  User, 
  Calendar,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Archive,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

interface DocumentVersion {
  id: number;
  documentType: string;
  version: string;
  title: string;
  effectiveDate: string;
  publishedDate?: string;
  status: string;
  changes: string[];
  authorName: string;
  approvedBy?: string;
  approvalDate?: string;
  complianceNotes: string[];
  metadata: {
    fileSize?: number;
    wordCount?: number;
  };
  isActive: boolean;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  checksum: string;
}

interface AuditEntry {
  id: number;
  documentType: string;
  version: string;
  action: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  ipAddress: string;
  details: string;
  severity: string;
  timestamp: string;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  review: "bg-yellow-100 text-yellow-800", 
  approved: "bg-green-100 text-green-800",
  active: "bg-blue-100 text-blue-800",
  superseded: "bg-orange-100 text-orange-800",
  archived: "bg-red-100 text-red-800"
};

const severityColors = {
  info: "text-blue-600",
  warning: "text-yellow-600", 
  critical: "text-red-600"
};

export default function LegalDocumentHistory() {
  const [selectedDocType, setSelectedDocType] = useState<string>("terms");
  const [auditDateRange, setAuditDateRange] = useState<string>("90d");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch document versions
  const { data: versionsData, isLoading: versionsLoading } = useQuery({
    queryKey: ['/api/legal/document-versions', selectedDocType],
    queryFn: async () => {
      const response = await fetch(`/api/legal/document-versions/${selectedDocType}`);
      if (!response.ok) throw new Error('Failed to fetch document versions');
      return response.json();
    }
  });

  // Fetch audit trail
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['/api/legal/audit-trail', selectedDocType, auditDateRange],
    queryFn: async () => {
      const response = await fetch(`/api/legal/audit-trail/${selectedDocType}?dateRange=${auditDateRange}`);
      if (!response.ok) throw new Error('Failed to fetch audit trail');
      return response.json();
    }
  });

  const versions: DocumentVersion[] = versionsData?.versions || [];
  const auditTrail: AuditEntry[] = auditData?.auditTrail || [];

  // Filter audit entries by search term
  const filteredAuditEntries = auditTrail.filter(entry =>
    entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return "Unknown";
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${Math.round(kb / 1024)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'review': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle2 className="h-4 w-4" />;
      case 'active': return <Shield className="h-4 w-4" />;
      case 'superseded': return <Archive className="h-4 w-4" />;
      case 'archived': return <Trash2 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'viewed': return <Eye className="h-4 w-4" />;
      case 'downloaded': return <Download className="h-4 w-4" />;
      case 'published': return <Shield className="h-4 w-4" />;
      case 'created': return <FileText className="h-4 w-4" />;
      case 'updated': return <Edit className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Legal Document Management System
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Document Version History & Audit Trail
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Complete version control and compliance tracking for all legal documents
          </p>
        </div>

        {/* Document Type Selector */}
        <div className="flex justify-center">
          <Select value={selectedDocType} onValueChange={setSelectedDocType}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="terms">Terms of Service</SelectItem>
              <SelectItem value="privacy">Privacy Policy</SelectItem>
              <SelectItem value="cookie">Cookie Policy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="versions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="versions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Versions
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          {/* Document Versions Tab */}
          <TabsContent value="versions">
            <div className="space-y-4">
              {versionsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading document versions...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {versions.map((version) => (
                    <Card key={version.id} className={`${version.isActive ? 'ring-2 ring-blue-500' : ''}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl">{version.title}</CardTitle>
                              <Badge className={statusColors[version.status as keyof typeof statusColors]}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(version.status)}
                                  {version.status.charAt(0).toUpperCase() + version.status.slice(1)}
                                </div>
                              </Badge>
                              {version.isActive && (
                                <Badge variant="default">Current Version</Badge>
                              )}
                            </div>
                            <CardDescription className="space-y-1">
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  Author: {version.authorName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Created: {format(new Date(version.createdAt), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">v{version.version}</Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Changes */}
                        {version.changes.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Changes in this version:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              {version.changes.map((change, idx) => (
                                <li key={idx}>{change}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {version.viewCount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Views</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {version.downloadCount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Downloads</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {formatFileSize(version.metadata.fileSize)}
                            </div>
                            <div className="text-xs text-gray-500">File Size</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              {version.metadata.wordCount?.toLocaleString() || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">Words</div>
                          </div>
                        </div>

                        {/* Compliance Notes */}
                        {version.complianceNotes.length > 0 && (
                          <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-2">Compliance Notes:</h4>
                            <div className="flex flex-wrap gap-2">
                              {version.complianceNotes.map((note, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {note}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
                          <span>Checksum: {version.checksum}</span>
                          {version.publishedDate && (
                            <span>Published: {format(new Date(version.publishedDate), 'MMM d, yyyy HH:mm')}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit">
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search audit entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={auditDateRange} onValueChange={setAuditDateRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {auditLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading audit trail...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAuditEntries.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={severityColors[entry.severity as keyof typeof severityColors]}>
                              {getActionIcon(entry.action)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}</span>
                                <Badge variant="outline" className="text-xs">
                                  v{entry.version}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{entry.details}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span>{entry.userName || 'Anonymous'} ({entry.userRole || 'guest'})</span>
                                <span>IP: {entry.ipAddress}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">
                              {format(new Date(entry.timestamp), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(entry.timestamp), 'HH:mm:ss')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredAuditEntries.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No audit entries found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Try adjusting your search term or date range.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}