import React from 'react';
import MapboxWorking from '@/components/MapboxWorking';

export default function MapboxTest() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Mapbox Test Page</h1>
      <p className="mb-4">This is a basic working example of Mapbox with static data.</p>
      
      <MapboxWorking />
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Test Results:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Map should load with street tiles</li>
          <li>3 red markers should be visible (SF, LA, SD)</li>
          <li>Click markers to see popups</li>
          <li>Navigation controls on top-right</li>
        </ul>
      </div>
    </div>
  );
}