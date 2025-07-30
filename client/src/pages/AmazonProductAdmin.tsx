import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AlertCircle, RefreshCw, CheckCircle, ShoppingCart, Link2, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface AmazonProduct {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  price: string;
  rating: string;
  reviews: string;
  affiliateCode?: string;
}

interface ProductsResponse {
  products: AmazonProduct[];
  total: number;
  disclaimer: string;
  _version: string;
}

export default function AmazonProductAdmin() {
  const { toast } = useToast();
  const [syncStatus, setSyncStatus] = useState<string>("");

  // Fetch current Amazon products
  const { data: products, isLoading: productsLoading } = useQuery<ProductsResponse>({
    queryKey: ["/api/amazon-products/images"],
  });

  // Sync products mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/amazon-products/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sync');
      }
      return response.json();
    },
    onMutate: () => {
      setSyncStatus("Syncing with Amazon Product API...");
    },
    onSuccess: (data) => {
      setSyncStatus("");
      toast({
        title: "Sync Complete",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/amazon-products/images"] });
    },
    onError: (error: any) => {
      setSyncStatus("");
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Amazon products",
        variant: "destructive",
      });
    },
  });

  // Validate links mutation
  const validateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/amazon-products/validate-links');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to validate');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Validation Complete",
        description: `${data.summary.valid} valid links, ${data.summary.invalid} invalid links (${data.summary.percentageValid} success rate)`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Validation Failed",
        description: error.message || "Failed to validate affiliate links",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Amazon Product Integration - Phase 2</h1>
        <p className="text-muted-foreground">
          Real-time product data synchronization and affiliate link management
        </p>
      </div>

      {/* Status Alert */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Phase 2 Features</AlertTitle>
        <AlertDescription>
          • Real-time pricing from Amazon Product API<br />
          • Automatic affiliate link validation<br />
          • Product availability tracking<br />
          • AI-generated images for copyright compliance
        </AlertDescription>
      </Alert>

      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Sync Product Data
            </CardTitle>
            <CardDescription>
              Update prices and availability from Amazon Product API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="w-full"
            >
              {syncMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {syncStatus || "Syncing..."}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync with Amazon API
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Note: Set AMAZON_ACCESS_KEY and AMAZON_SECRET_KEY to enable real-time pricing.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Validate Affiliate Links
            </CardTitle>
            <CardDescription>
              Check all Amazon affiliate links are working correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => validateMutation.mutate()}
              disabled={validateMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {validateMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Validate All Links
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Products Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Amazon Products ({products?.total || 0})
          </CardTitle>
          <CardDescription>
            Current products in the database with affiliate tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : products?.products ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {products.products.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {product.category} • {product.rating}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">{product.price}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {product.reviews}
                      </p>
                    </div>
                    <Badge variant={product.affiliateCode ? "default" : "secondary"}>
                      {product.affiliateCode ? "Affiliate Active" : "No Affiliate"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No products found
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Status */}
      <div className="mt-6 text-sm text-muted-foreground text-center">
        <p>Phase 2 Implementation Complete</p>
        <p>Real-time pricing • Affiliate link validation • AI-generated images</p>
      </div>
    </div>
  );
}