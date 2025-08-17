export default function TestApp() {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0' }}>
      <h1>Test App Loaded</h1>
      <p>If you can see this, React is working.</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}