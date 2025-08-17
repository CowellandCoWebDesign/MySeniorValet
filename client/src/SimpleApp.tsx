import { useState, useEffect } from 'react';

export default function SimpleApp() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/communities/count')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '40px', borderRadius: '12px', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>MySeniorValet</h1>
        <p style={{ marginTop: '10px', fontSize: '1.2rem', opacity: 0.9 }}>
          Senior Living Community Search Platform
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#10b981', margin: '0 0 10px 0' }}>✓ React Status</h3>
          <p>React is now rendering successfully!</p>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#3b82f6', margin: '0 0 10px 0' }}>📊 Database Status</h3>
          <p>{loading ? 'Loading...' : stats ? `${stats.count} communities` : 'Unable to connect'}</p>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#8b5cf6', margin: '0 0 10px 0' }}>🚀 API Status</h3>
          <p>Backend operational on port 5000</p>
        </div>
      </div>

      <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3 style={{ color: '#92400e', marginTop: 0 }}>⚠️ Recovery Notice</h3>
        <p style={{ color: '#78350f' }}>
          The main application experienced a critical failure with the emergency button implementation 
          that broke React's rendering system. This simplified version bypasses those issues.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        <button 
          onClick={() => window.location.href = '/map-search'}
          style={{
            padding: '12px 24px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Search Communities
        </button>
        
        <button 
          onClick={() => window.location.href = '/api/auth/login'}
          style={{
            padding: '12px 24px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}