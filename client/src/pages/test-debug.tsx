import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, AlertCircle } from 'lucide-react';

export default function TestDebug() {
  const [tests, setTests] = useState({
    mapRendering: { status: 'testing', message: 'Checking map rendering...' },
    clusterData: { status: 'testing', message: 'Checking cluster data...' },
    spatialSearch: { status: 'testing', message: 'Checking spatial search...' },
    markerClick: { status: 'testing', message: 'Checking marker click handling...' },
    listToggle: { status: 'testing', message: 'Checking list toggle functionality...' }
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    // Test 1: Check cluster endpoint
    try {
      const clusterResponse = await fetch('/api/communities/clusters?bbox=-122.5,37.7,-122.3,37.9&zoom=12&viewport=true');
      if (clusterResponse.ok) {
        const clusterData = await clusterResponse.json();
        setTests(prev => ({
          ...prev,
          clusterData: { 
            status: 'passed', 
            message: `Cluster data loaded: ${clusterData.features.length} features` 
          }
        }));
      } else {
        throw new Error(`Cluster API failed: ${clusterResponse.status}`);
      }
    } catch (error: any) {
      setTests(prev => ({
        ...prev,
        clusterData: { status: 'failed', message: error.message }
      }));
    }

    // Test 2: Check spatial search
    try {
      const searchResponse = await fetch('/api/communities/search/spatial?swLat=37.7&swLng=-122.5&neLat=37.9&neLng=-122.3&limit=10');
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        setTests(prev => ({
          ...prev,
          spatialSearch: { 
            status: 'passed', 
            message: `Spatial search working: ${searchData.length} communities found` 
          }
        }));
      } else {
        throw new Error(`Spatial search failed: ${searchResponse.status}`);
      }
    } catch (error: any) {
      setTests(prev => ({
        ...prev,
        spatialSearch: { status: 'failed', message: error.message }
      }));
    }

    // Test 3: Map rendering status
    setTests(prev => ({
      ...prev,
      mapRendering: { 
        status: 'info', 
        message: 'Map rendering check requires visual verification' 
      }
    }));

    // Test 4: Marker click handling
    setTests(prev => ({
      ...prev,
      markerClick: { 
        status: 'info', 
        message: 'Marker click handling requires user interaction test' 
      }
    }));

    // Test 5: List toggle
    setTests(prev => ({
      ...prev,
      listToggle: { 
        status: 'info', 
        message: 'List toggle requires user interaction test' 
      }
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <X className="w-5 h-5 text-red-500" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Map Search Debug Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(tests).map(([testName, result]) => (
                <div key={testName} className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold capitalize">{testName.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-lg">Manual Test Instructions:</h3>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Test 1: Map Rendering</h4>
                <p className="text-sm">Go to the map search page and verify:</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  <li>Map loads with San Francisco as default location</li>
                  <li>Community markers are visible on the map</li>
                  <li>Map can be panned and zoomed smoothly</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Test 2: List Toggle</h4>
                <p className="text-sm">On the map search page:</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  <li>Click the blue floating button (bottom right) to open list</li>
                  <li>Verify list shows communities in current map view</li>
                  <li>Drag the panel handle to resize</li>
                  <li>Click X or red button to close</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Test 3: Marker Clicks</h4>
                <p className="text-sm">Click on community markers:</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  <li>Popup should appear with community info</li>
                  <li>Click "View Details" to navigate to community page</li>
                  <li>No console errors should appear</li>
                </ul>
              </div>

              <Button 
                onClick={() => window.location.href = '/map-search'}
                className="w-full mt-4"
              >
                Go to Map Search Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}