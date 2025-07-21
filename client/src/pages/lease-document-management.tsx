import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  Download,
  Eye,
  Brain,
  FileSignature,
  DollarSign,
  Calendar,
  User,
  MapPin
} from "lucide-react";

interface LeaseDocument {
  id: number;
  filename: string;
  uploadedAt: string;
  status: "uploaded" | "analyzing" | "analyzed" | "prepared" | "sent" | "signed" | "completed";
  aiAnalysis?: {
    rentAmount?: number;
    leaseStartDate?: string;
    leaseEndDate?: string;
    unitNumber?: string;
    securityDeposit?: number;
    petPolicy?: string;
    utilities?: string[];
    specialClauses?: string[];
    requiredSignatures?: number;
  };
  docusignEnvelopeId?: string;
  docusignStatus?: string;
}

interface ResidentInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
}

export default function LeaseDocumentManagement() {
  const params = useParams();
  const applicationId = parseInt(params.applicationId || "0");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Fetch lease documents
  const { data: leaseDocuments, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/applications", applicationId, "lease-documents"],
    enabled: !!applicationId,
  });

  // Fetch resident information
  const { data: residentInfo } = useQuery({
    queryKey: ["/api/applications", applicationId, "resident"],
    enabled: !!applicationId,
  });

  // Upload lease document
  const uploadLease = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("lease", file);
      formData.append("applicationId", applicationId.toString());
      
      const response = await fetch("/api/lease/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload lease");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Lease Uploaded",
        description: "The lease document has been uploaded and will be analyzed by AI.",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/applications", applicationId, "lease-documents"] 
      });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Analyze lease with AI
  const analyzeLease = useMutation({
    mutationFn: async (documentId: number) => {
      return apiRequest("POST", `/api/lease/${documentId}/analyze`);
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed the lease document and extracted key information.",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/applications", applicationId, "lease-documents"] 
      });
    },
  });

  // Prepare lease for DocuSign
  const prepareLease = useMutation({
    mutationFn: async (documentId: number) => {
      return apiRequest("POST", `/api/lease/${documentId}/prepare-docusign`, {
        residentInfo,
        applicationId,
      });
    },
    onSuccess: () => {
      toast({
        title: "DocuSign Prepared",
        description: "The lease is ready for community approval and signature placement.",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/applications", applicationId, "lease-documents"] 
      });
    },
  });

  // Send lease via DocuSign
  const sendLease = useMutation({
    mutationFn: async (documentId: number) => {
      return apiRequest("POST", `/api/lease/${documentId}/send-docusign`);
    },
    onSuccess: () => {
      toast({
        title: "Lease Sent",
        description: "The lease has been sent to the resident for signature.",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/applications", applicationId, "lease-documents"] 
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      await uploadLease.mutateAsync(selectedFile);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploaded":
        return <Upload className="h-4 w-4" />;
      case "analyzing":
        return <Brain className="h-4 w-4 animate-pulse" />;
      case "analyzed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "prepared":
        return <FileSignature className="h-4 w-4 text-blue-600" />;
      case "sent":
        return <Send className="h-4 w-4 text-orange-600" />;
      case "signed":
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "analyzing":
        return "default";
      case "analyzed":
        return "secondary";
      case "prepared":
        return "outline";
      case "sent":
        return "outline";
      case "signed":
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Lease Document Management</h1>
        <p className="text-muted-foreground mt-2">
          Upload, analyze, and prepare lease documents with AI assistance
        </p>
      </div>

      {/* Resident Information Card */}
      {residentInfo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Resident Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{residentInfo.firstName} {residentInfo.lastName}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{residentInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span>Emergency: {residentInfo.emergencyContact.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Application #{applicationId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Lease</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Lease Document</CardTitle>
              <CardDescription>
                Upload your community's lease agreement for AI analysis and preparation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertTitle>AI-Powered Analysis</AlertTitle>
                <AlertDescription>
                  Our AI will automatically extract key information from your lease including rent amount, 
                  dates, unit details, and special clauses. This information will be used to prepare 
                  the DocuSign document.
                </AlertDescription>
              </Alert>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="lease-upload"
                />
                <label
                  htmlFor="lease-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-12 w-12 text-gray-400" />
                  <span className="text-sm font-medium">
                    Click to upload lease PDF
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Maximum file size: 10MB
                  </span>
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload & Analyze"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <div className="space-y-4">
            {documentsLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Loading documents...</p>
                </CardContent>
              </Card>
            ) : leaseDocuments?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No lease documents uploaded yet</p>
                </CardContent>
              </Card>
            ) : (
              leaseDocuments?.map((doc: LeaseDocument) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-base">{doc.filename}</CardTitle>
                          <CardDescription>
                            Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(doc.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(doc.status)}
                          <span className="capitalize">{doc.status}</span>
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* AI Analysis Results */}
                    {doc.aiAnalysis && (
                      <div className="mb-6 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          AI Analysis Results
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          {doc.aiAnalysis.rentAmount && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>Rent: ${doc.aiAnalysis.rentAmount}/month</span>
                            </div>
                          )}
                          {doc.aiAnalysis.unitNumber && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>Unit: {doc.aiAnalysis.unitNumber}</span>
                            </div>
                          )}
                          {doc.aiAnalysis.leaseStartDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Start: {doc.aiAnalysis.leaseStartDate}</span>
                            </div>
                          )}
                          {doc.aiAnalysis.securityDeposit && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>Deposit: ${doc.aiAnalysis.securityDeposit}</span>
                            </div>
                          )}
                          {doc.aiAnalysis.petPolicy && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <span>Pets: {doc.aiAnalysis.petPolicy}</span>
                            </div>
                          )}
                          {doc.aiAnalysis.requiredSignatures && (
                            <div className="flex items-center gap-2">
                              <FileSignature className="h-4 w-4 text-muted-foreground" />
                              <span>Signatures: {doc.aiAnalysis.requiredSignatures}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {doc.status === "uploaded" && (
                        <Button 
                          size="sm"
                          onClick={() => analyzeLease.mutate(doc.id)}
                          disabled={analyzeLease.isPending}
                        >
                          <Brain className="h-4 w-4 mr-1" />
                          Analyze with AI
                        </Button>
                      )}
                      
                      {doc.status === "analyzed" && (
                        <Button 
                          size="sm"
                          onClick={() => prepareLease.mutate(doc.id)}
                          disabled={prepareLease.isPending}
                        >
                          <FileSignature className="h-4 w-4 mr-1" />
                          Prepare DocuSign
                        </Button>
                      )}
                      
                      {doc.status === "prepared" && (
                        <Button 
                          size="sm"
                          onClick={() => sendLease.mutate(doc.id)}
                          disabled={sendLease.isPending}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send to Resident
                        </Button>
                      )}
                      
                      {(doc.status === "signed" || doc.status === "completed") && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download Signed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Lease Workflow Process</CardTitle>
              <CardDescription>
                Track the progress of your lease document through the signing process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Workflow Steps */}
                <div className="relative">
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  <div className="space-y-8">
                    <WorkflowStep
                      icon={Upload}
                      title="Upload Lease"
                      description="Upload your community's standard lease agreement"
                      status="completed"
                    />
                    
                    <WorkflowStep
                      icon={Brain}
                      title="AI Analysis"
                      description="AI extracts key information and identifies signature locations"
                      status="completed"
                    />
                    
                    <WorkflowStep
                      icon={FileSignature}
                      title="DocuSign Preparation"
                      description="Lease is prepared with resident information and signature fields"
                      status="current"
                    />
                    
                    <WorkflowStep
                      icon={Eye}
                      title="Community Approval"
                      description="Review and approve the prepared document"
                      status="pending"
                    />
                    
                    <WorkflowStep
                      icon={Send}
                      title="Send to Resident"
                      description="Document is sent to resident for electronic signature"
                      status="pending"
                    />
                    
                    <WorkflowStep
                      icon={CheckCircle2}
                      title="Execution Complete"
                      description="Fully executed lease is available for download"
                      status="pending"
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">50% Complete</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface WorkflowStepProps {
  icon: React.ElementType;
  title: string;
  description: string;
  status: "completed" | "current" | "pending";
}

function WorkflowStep({ icon: Icon, title, description, status }: WorkflowStepProps) {
  return (
    <div className="relative flex items-start">
      <div
        className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ${
          status === "completed"
            ? "bg-green-600 text-white"
            : status === "current"
            ? "bg-primary text-primary-foreground"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="ml-4 flex-1">
        <h4 className={`font-medium ${status === "pending" ? "text-muted-foreground" : ""}`}>
          {title}
        </h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}