import React from 'react';
import { useQuery } from '@tanstack/react-query';

export default function TestMap() {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['test-communities'],
    queryFn: async () => {
      const res = await fetch('/api/communities/search?limit=100');
      if (!res.ok) throw new Error('Fetch failed');
      return res.json();
    },
  });

  console.log('COMMUNITIES DATA:', data);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to load</div>;

  const validCommunities = Array.isArray(data) ? data.filter(
    (c) =>
      typeof c.latitude === 'number' &&
      typeof c.longitude === 'number' &&
      !isNaN(c.latitude) &&
      !isNaN(c.longitude)
  ) : [];

  return (
    <div className="h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Test Communities Data</h1>
      <div className="mb-4">
        <p>Total communities: {data.length}</p>
        <p>Valid coordinates: {validCommunities.length}</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
        <h2 className="font-semibold mb-2">Sample Communities (first 5):</h2>
        {validCommunities.slice(0, 5).map((community, index) => (
          <div key={community.id || index} className="mb-2 p-2 bg-white rounded">
            <p><strong>Name:</strong> {community.name}</p>
            <p><strong>Location:</strong> {community.city}, {community.state}</p>
            <p><strong>Coordinates:</strong> {community.latitude}, {community.longitude}</p>
          </div>
        ))}
      </div>
    </div>
  );
}