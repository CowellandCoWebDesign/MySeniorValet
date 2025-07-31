/**
 * Weaviate Index Manager Component
 * Admin component for managing vector database indexing
 */

import React, { useState, useEffect } from 'react';
import { Database, Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IndexingStatus {
  isHealthy: boolean;
  isInitialized: boolean;
  className: string;
}

export function WeaviateIndexManager() {
  const [status, setStatus] = useState<IndexingStatus | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [indexedCount, setIndexedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [batchSize, setBatchSize] = useState(100);
  const [totalBatches, setTotalBatches] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/weaviate/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const indexCommunities = async (limit: number = batchSize, offset: number = 0) => {
    setIsIndexing(true);
    setError(null);

    try {
      const response = await fetch('/api/weaviate/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit, offset }),
      });

      const data = await response.json();

      if (data.success) {
        setIndexedCount(prev => prev + data.indexedCount);
        return data.indexedCount;
      } else {
        throw new Error(data.message || 'Indexing failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Indexing failed';
      setError(errorMessage);
      throw err;
    }
  };

  const performBatchIndexing = async () => {
    setIsIndexing(true);
    setError(null);
    setIndexedCount(0);
    setCurrentBatch(0);

    // Estimate total communities (could be fetched from API)
    const estimatedTotal = 25000;
    const calculatedBatches = Math.ceil(estimatedTotal / batchSize);
    setTotalBatches(calculatedBatches);

    try {
      let offset = 0;
      let batchCount = 0;
      let totalIndexed = 0;

      while (true) {
        const indexed = await indexCommunities(batchSize, offset);
        
        if (indexed === 0) {
          // No more communities to index
          break;
        }

        totalIndexed += indexed;
        batchCount++;
        offset += batchSize;

        setCurrentBatch(batchCount);
        setIndexingProgress((batchCount / calculatedBatches) * 100);

        // Prevent infinite loops
        if (batchCount >= calculatedBatches) {
          break;
        }

        // Small delay between batches to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`✅ Batch indexing completed: ${totalIndexed} communities indexed`);
      
    } catch (err) {
      console.error('Batch indexing failed:', err);
    } finally {
      setIsIndexing(false);
      setIndexingProgress(100);
      await loadStatus();
    }
  };

  const resetIndex = async () => {
    if (!confirm('Are you sure you want to reset the index? This will delete all indexed communities.')) {
      return;
    }

    // This would require a delete endpoint in the API
    console.log('Reset functionality would go here');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Database className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Weaviate Index Manager</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Vector Database
        </Badge>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className={`h-5 w-5 ${status?.isHealthy ? 'text-green-600' : 'text-red-600'}`} />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Connection</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${status?.isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">{status?.isHealthy ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Schema</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${status?.isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm">{status?.isInitialized ? 'Ready' : 'Initializing'}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Class Name</Label>
              <div className="text-sm mt-1 font-mono">{status?.className || 'Loading...'}</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={loadStatus} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Indexing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Indexing Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batchSize">Batch Size</Label>
              <Input
                id="batchSize"
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                min={1}
                max={1000}
                disabled={isIndexing}
              />
            </div>
            <div>
              <Label>Progress</Label>
              <div className="text-sm text-gray-600 mt-1">
                {indexedCount} communities indexed
              </div>
            </div>
          </div>

          {isIndexing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Batch {currentBatch} of {totalBatches}</span>
                <span>{Math.round(indexingProgress)}%</span>
              </div>
              <Progress value={indexingProgress} className="w-full" />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={performBatchIndexing}
              disabled={isIndexing || !status?.isHealthy}
              className="flex items-center gap-2"
            >
              {isIndexing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Indexing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Start Batch Indexing
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => indexCommunities(10, 0)}
              disabled={isIndexing || !status?.isHealthy}
              variant="outline"
            >
              Test Index (10 communities)
            </Button>

            <Button 
              onClick={resetIndex}
              disabled={isIndexing}
              variant="destructive"
            >
              Reset Index
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800 text-sm font-medium">Indexing Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {indexedCount > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-800 text-sm font-medium">Indexing Progress</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Successfully indexed {indexedCount} communities into Weaviate vector database.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-900 mb-2">About Vector Indexing</h3>
          <div className="text-blue-800 text-sm space-y-1">
            <p>• Communities are converted to vector embeddings using OpenAI's text-embedding-3-small model</p>
            <p>• Semantic search works by finding communities with similar vector representations</p>
            <p>• Start with a test index to verify functionality before full batch indexing</p>
            <p>• Batch size of 100 is recommended for balance between speed and stability</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}