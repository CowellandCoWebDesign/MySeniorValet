import React from 'react';
import MapboxWorking from '@/components/MapboxWorking';
import RentalMapboxReplit from '@/components/RentalMapboxReplit';

export default function MapboxTest() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Mapbox Test Page</h1>
      <p className="mb-4">This is a basic working example of Mapbox with static data.</p>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Basic Mapbox Example</h2>
        <div className="h-96 border rounded-lg">
          <MapboxWorking />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Replit-Optimized Mapbox</h2>
        <div className="h-96 border rounded-lg">
          <RentalMapboxReplit 
            communities={[]} 
            onCommunityClick={() => {}} 
            className="w-full h-full"
          />
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="font-semibold mb-2 text-blue-900">Replit + Mapbox Instructions:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
          <li><strong>Click "Open in new tab"</strong> above for best map experience</li>
          <li>Mapbox needs direct WebGL access, which can be limited in Replit's iframe</li>
          <li>If map doesn't load here, it should work perfectly in new tab</li>
          <li>Once working, navigate to /rentals to see the full map with real data</li>
        </ul>
      </div>
    </div>
  );
}