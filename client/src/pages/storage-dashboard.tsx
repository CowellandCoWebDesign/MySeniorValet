
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  HardDrive, 
  Database, 
  Image, 
  FileText, 
  Download, 
  Trash2,
  RefreshCw,
  Archive,
  BarChart3,
  Shield,
  Clock,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StorageStats {
  totalObjects: number;
  categories: Record<string, number>;
  totalSize: number;
}

export default function StorageDashboard() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/storage/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch storage statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await fetch('/api/storage/backup', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Backup Created",
          description: data.message,
        });
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create backup",
        variant: "destructive",
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const cleanupStorage = async () => {
    setCleanupLoading(true);
    try {
      const response = await fetch('/api/storage/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 })
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Cleanup Complete",
          description: data.message,
        });
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      toast({
        title: "Cleanup Failed",
        description: "Failed to cleanup storage",
        variant: "destructive",
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'community-photos': return Image;
      case 'backups': return Database;
      case 'api-cache': return RefreshCw;
      case 'reports': return FileText;
      case 'search-cache': return BarChart3;
      default: return HardDrive;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading storage statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Object Storage Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Manage your MySeniorValet platform storage and backups
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={createBackup} 
                disabled={backupLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {backupLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4 mr-2" />
                )}
                Create Backup
              </Button>
              <Button 
                onClick={cleanupStorage} 
                disabled={cleanupLoading}
                variant="outline"
              >
                {cleanupLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Cleanup Old Files
              </Button>
              <Button onClick={fetchStats} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Objects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalObjects.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <HardDrive className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatBytes(stats?.totalSize || 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(stats?.categories || {}).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Storage by Category</CardTitle>
            <CardDescription>Breakdown of stored objects by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats?.categories || {}).map(([category, count]) => {
                const Icon = getCategoryIcon(category);
                const percentage = ((count / (stats?.totalObjects || 1)) * 100).toFixed(1);
                
                return (
                  <div key={category} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {category.replace('-', ' ')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {count.toLocaleString()} objects
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{percentage}%</Badge>
                      <Progress value={parseFloat(percentage)} className="w-20 mt-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Storage Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Object Storage Benefits</CardTitle>
            <CardDescription>How Object Storage enhances your MySeniorValet platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Persistent photo storage across deployments</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Reduced API costs through intelligent caching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Automated backup and recovery system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Enhanced search performance with result caching</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Secure document storage for communities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Faster page loads with cached resources</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-purple-600" />
                  <span>Scalable storage that grows with your platform</span>
                </div>
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-5 w-5 text-green-600" />
                  <span>Automated cleanup and maintenance</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
