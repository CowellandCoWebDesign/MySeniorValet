import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NavigationHeader } from '@/components/NavigationHeader';

export default function TestMapViews() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  const testLocations = [
    { name: 'San Francisco', bounds: { swLat: 37.7, swLng: -122.5, neLat: 37.85, neLng: -122.35 }},
    { name: 'Oakland', bounds: { swLat: 37.73, swLng: -122.28, neLat: 37.82, neLng: -122.16 }},
    { name: 'Sacramento', bounds: { swLat: 38.5, swLng: -121.6, neLat: 38.65, neLng: -121.4 }},
    { name: 'Los Angeles', bounds: { swLat: 33.9, swLng: -118.5, neLat: 34.2, neLng: -118.1 }},
    { name: 'San Diego', bounds: { swLat: 32.6, swLng: -117.3, neLat: 32.8, neLng: -117.0 }},
    { name: 'Fresno', bounds: { swLat: 36.7, swLng: -119.9, neLat: 36.85, neLng: -119.7 }},
    { name: 'San Jose', bounds: { swLat: 37.2, swLng: -122.0, neLat: 37.4, neLng: -121.8 }},
    { name: 'Berkeley', bounds: { swLat: 37.85, swLng: -122.3, neLat: 37.9, neLng: -122.2 }},
    { name: 'Palo Alto', bounds: { swLat: 37.38, swLng: -122.2, neLat: 37.47, neLng: -122.1 }},
    { name: 'Santa Cruz', bounds: { swLat: 36.95, swLng: -122.1, neLat: 37.0, neLng: -121.95 }}
  ];

  const testAllLocations = async () => {
    setLoading(true);
    const newResults = [];

    for (const location of testLocations) {
      try {
        const params = new URLSearchParams({
          swLat: location.bounds.swLat.toString(),
          swLng: location.bounds.swLng.toString(),
          neLat: location.bounds.neLat.toString(),
          neLng: location.bounds.neLng.toString(),
          limit: '500'
        });

        const response = await fetch(`/api/communities/search/spatial?${params}`);
        const data = await response.json();
        
        newResults.push({
          location: location.name,
          count: data.length,
          communities: data.slice(0, 5).map((c: any) => c.name),
          bounds: location.bounds
        });
      } catch (error) {
        newResults.push({
          location: location.name,
          count: 0,
          error: error.message,
          bounds: location.bounds
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  useEffect(() => {
    testAllLocations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="Map View Test" 
        subtitle="Community counts by area"
      />
      <div className="p-6 max-w-6xl mx-auto">
      
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-900">
          This test shows how many communities are found in different areas when you pan the map.
          Each area shows the exact number of communities that would appear in the list view.
        </p>
      </div>

      <Button 
        onClick={testAllLocations} 
        disabled={loading}
        className="mb-6"
      >
        {loading ? 'Testing...' : 'Run Test for All Locations'}
      </Button>

      <div className="grid gap-4">
        {results.length === 0 && !loading && (
          <p className="text-gray-600">Click the button above to test different map areas</p>
        )}
        {results.map((result, index) => (
          <Card 
            key={index} 
            className={`p-4 cursor-pointer transition-all ${
              selectedTest?.location === result.location ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedTest(result)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">{result.location}</h2>
                <p className="text-sm text-gray-600 mb-2">
                  Viewport: [{result.bounds.swLat.toFixed(2)}, {result.bounds.swLng.toFixed(2)}] to [{result.bounds.neLat.toFixed(2)}, {result.bounds.neLng.toFixed(2)}]
                </p>
                {result.error ? (
                  <p className="text-red-600">Error: {result.error}</p>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {result.count} communities
                    </p>
                    {result.communities.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">First 5 communities:</p>
                        <ul className="text-sm text-gray-600">
                          {result.communities.map((name: string, i: number) => (
                            <li key={i} className="truncate">• {name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/map-search?lat=${(result.bounds.swLat + result.bounds.neLat) / 2}&lng=${(result.bounds.swLng + result.bounds.neLng) / 2}&zoom=12`;
                  }}
                >
                  View on Map
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedTest && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Selected Test Details: {selectedTest.location}</h3>
          <p className="text-sm">
            This area contains {selectedTest.count} communities. When you navigate to this area on the map,
            the list should show exactly {selectedTest.count} communities.
          </p>
        </div>
      )}
    </div>
  );
}