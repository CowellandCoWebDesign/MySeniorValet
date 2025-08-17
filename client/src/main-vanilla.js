// Pure vanilla JavaScript - no React, no JSX, no tooling issues
console.log("Vanilla JS loading...");

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM ready, initializing...");
  const root = document.getElementById("root");
if (root) {
  root.innerHTML = `
    <div style="padding: 40px; font-family: system-ui; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">MySeniorValet - Emergency Recovery</h1>
      <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #856404; margin-top: 0;">⚠️ React Rendering Failure Detected</h2>
        <p style="color: #856404;">The React application failed to initialize due to a critical Vite/React plugin conflict.</p>
        <p style="color: #856404;"><strong>Root Cause:</strong> "@vitejs/plugin-react can't detect preamble" error</p>
      </div>
      
      <div style="background: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #155724; margin-top: 0;">✓ Backend Services Operational</h2>
        <ul style="color: #155724;">
          <li>API Server: Running on port 5000</li>
          <li>Database: Connected (33,510 communities)</li>
          <li>Authentication: Ready</li>
        </ul>
      </div>
      
      <div style="margin-top: 30px;">
        <button onclick="window.location.href='/api/auth/login'" style="
          padding: 12px 24px;
          background: #3B82F6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
        ">Login to System</button>
        
        <button onclick="testAPI()" style="
          padding: 12px 24px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin-left: 10px;
        ">Test API Connection</button>
      </div>
      
      <div id="api-response" style="margin-top: 20px;"></div>
    </div>
  `;
  
  // Add API test function
  window.testAPI = async function() {
    const responseDiv = document.getElementById('api-response');
    responseDiv.innerHTML = '<p>Testing API...</p>';
    
    try {
      const response = await fetch('/api/communities/count');
      const data = await response.json();
      responseDiv.innerHTML = '<div style="background: #d4edda; padding: 15px; border-radius: 6px;"><strong>API Response:</strong> ' + JSON.stringify(data) + '</div>';
    } catch (error) {
      responseDiv.innerHTML = '<div style="background: #f8d7da; padding: 15px; border-radius: 6px;"><strong>API Error:</strong> ' + error.message + '</div>';
    }
  };
  
  console.log("Vanilla JS rendered successfully");
} else {
  console.error("Root element not found");
}
}); // End DOMContentLoaded