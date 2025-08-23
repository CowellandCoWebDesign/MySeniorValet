import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, CheckCircle2, MapPin, DollarSign, Home, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TestQuery {
  category: string;
  queries: {
    text: string;
    description: string;
    icon?: any;
  }[];
}

const testQueries: TestQuery[] = [
  {
    category: "🏠 Location Recognition",
    queries: [
      { text: "Senior living in California under $4000", description: "State recognition + price", icon: MapPin },
      { text: "Memory care in Dallas Texas", description: "City and state parsing", icon: MapPin },
      { text: "Communities in Miami Florida", description: "Florida state recognition", icon: MapPin },
      { text: "Assisted living in New York", description: "New York state parsing", icon: MapPin },
    ]
  },
  {
    category: "💰 Price Understanding",
    queries: [
      { text: "$3500 memory care facilities", description: "Standalone price as budget", icon: DollarSign },
      { text: "Cheap assisted living communities", description: "Budget keyword → $3000 max", icon: DollarSign },
      { text: "Luxury senior living starting at $7000", description: "Premium pricing", icon: DollarSign },
      { text: "Budget senior housing maximum $2500", description: "Explicit max price", icon: DollarSign },
    ]
  },
  {
    category: "🎯 Complex Queries",
    queries: [
      { text: "Pet friendly under $4500 in Phoenix Arizona", description: "Amenity + price + location", icon: Sparkles },
      { text: "Affordable memory care up to $3000", description: "Budget + care type", icon: Sparkles },
      { text: "High end facilities from $8000", description: "Luxury keyword + min price", icon: Sparkles },
      { text: "Inexpensive HUD housing in North Carolina", description: "HUD + budget + state", icon: Sparkles },
    ]
  }
];

export default function NaturalLanguageTest() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await apiRequest("POST", "/api/natural-language/search", { query: searchQuery });
      setResults(response);
    } catch (err: any) {
      setError(err.message || "Failed to process query");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = (testQuery: string) => {
    handleSearch(testQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🚀 Natural Language Search Testing
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Test our Wave 2 improvements: Enhanced state recognition, price parsing, and complex queries
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Search Input */}
        <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder="Try: 'Cheap assisted living in California' or 'Memory care under $4000'"
                className="flex-1 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={() => handleSearch(query)}
                disabled={loading || !query}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Query Suggestions */}
        <div className="grid md:grid-cols-3 gap-4">
          {testQueries.map((category, idx) => (
            <Card key={idx} className="bg-slate-800/50 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-purple-300">{category.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {category.queries.map((q, qIdx) => (
                  <Button
                    key={qIdx}
                    variant="outline"
                    className="w-full justify-start text-left bg-slate-700/30 hover:bg-slate-700/50 border-purple-500/30 text-white"
                    onClick={() => handleQuickTest(q.text)}
                  >
                    <div className="flex items-start gap-2 w-full">
                      {q.icon && <q.icon className="h-4 w-4 mt-1 text-purple-400 flex-shrink-0" />}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{q.text}</div>
                        <div className="text-xs text-gray-400">{q.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="bg-red-900/20 border-red-500/50">
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-4">
            {/* Parsed Intent */}
            <Card className="bg-slate-800/50 border-green-500/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Parsed Intent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Location */}
                  {results.parsed?.location && (
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">Location</span>
                      </div>
                      <div className="space-y-1">
                        {results.parsed.location.city && (
                          <Badge variant="outline" className="bg-blue-900/30 border-blue-500/50">
                            City: {results.parsed.location.city}
                          </Badge>
                        )}
                        {results.parsed.location.state && (
                          <Badge variant="outline" className="bg-blue-900/30 border-blue-500/50 ml-2">
                            State: {results.parsed.location.state}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price Range */}
                  {results.parsed?.priceRange && (
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-green-300">Price Range</span>
                      </div>
                      <div className="space-y-1">
                        {results.parsed.priceRange.min && (
                          <Badge variant="outline" className="bg-green-900/30 border-green-500/50">
                            Min: ${results.parsed.priceRange.min}
                          </Badge>
                        )}
                        {results.parsed.priceRange.max && (
                          <Badge variant="outline" className="bg-green-900/30 border-green-500/50 ml-2">
                            Max: ${results.parsed.priceRange.max}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Care Types */}
                  {results.parsed?.careTypes && results.parsed.careTypes.length > 0 && (
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-300">Care Types</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {results.parsed.careTypes.map((type: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-purple-900/30 border-purple-500/50">
                            {type.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {results.parsed?.amenities && results.parsed.amenities.length > 0 && (
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-300">Amenities</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {results.parsed.amenities.map((amenity: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-yellow-900/30 border-yellow-500/50">
                            {amenity.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confidence Score */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-400">Confidence:</span>
                  <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${(results.confidence || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-300">
                    {Math.round((results.confidence || 0) * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{results.resultCount || 0}</p>
                    <p className="text-sm text-gray-400">Communities Found</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/50">
                      {results.searchMethod || 'Unknown'} Search
                    </Badge>
                  </div>
                </div>
                {results.explanation && (
                  <p className="mt-4 text-sm text-gray-300 italic">"{results.explanation}"</p>
                )}
              </CardContent>
            </Card>

            {/* Raw JSON (for debugging) */}
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                View Raw Response (for developers)
              </summary>
              <Card className="mt-2 bg-slate-900/50 border-slate-700">
                <CardContent className="pt-4">
                  <pre className="text-xs text-gray-400 overflow-auto">
                    {JSON.stringify(results.parsed, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}