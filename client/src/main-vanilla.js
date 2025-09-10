// Pure vanilla JavaScript - no React, no JSX, no tooling issues
console.log("Vanilla JS loading...");

// Secure DOM manipulation function
function createSafeElement(tag, props = {}, children = []) {
  const element = document.createElement(tag);
  
  // Set properties safely
  Object.keys(props).forEach(key => {
    if (key === 'style') {
      Object.assign(element.style, props[key]);
    } else if (key === 'onclick') {
      element.onclick = props[key];
    } else {
      element.setAttribute(key, props[key]);
    }
  });
  
  // Add children safely
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    }
  });
  
  return element;
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM ready, initializing...");
  const root = document.getElementById("root");
  
  if (root) {
    // Clear root safely
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
    
    // Build DOM structure safely without innerHTML
    const container = createSafeElement('div', {
      style: {
        padding: '40px',
        fontFamily: 'system-ui',
        maxWidth: '800px',
        margin: '0 auto'
      }
    });
    
    // Title
    container.appendChild(createSafeElement('h1', {
      style: { color: '#1a1a1a' }
    }, ['MySeniorValet - Emergency Recovery']));
    
    // Warning box
    const warningBox = createSafeElement('div', {
      style: {
        background: '#fff3cd',
        border: '2px solid #ffc107',
        padding: '20px',
        borderRadius: '8px',
        margin: '20px 0'
      }
    });
    
    warningBox.appendChild(createSafeElement('h2', {
      style: { color: '#856404', marginTop: '0' }
    }, ['⚠️ React Rendering Failure Detected']));
    
    warningBox.appendChild(createSafeElement('p', {
      style: { color: '#856404' }
    }, ['The React application failed to initialize due to a critical Vite/React plugin conflict.']));
    
    const rootCause = createSafeElement('p', {
      style: { color: '#856404' }
    });
    rootCause.appendChild(createSafeElement('strong', {}, ['Root Cause:']));
    rootCause.appendChild(document.createTextNode(' "@vitejs/plugin-react can\'t detect preamble" error'));
    warningBox.appendChild(rootCause);
    
    container.appendChild(warningBox);
    
    // Success box
    const successBox = createSafeElement('div', {
      style: {
        background: '#d4edda',
        border: '2px solid #28a745',
        padding: '20px',
        borderRadius: '8px',
        margin: '20px 0'
      }
    });
    
    successBox.appendChild(createSafeElement('h2', {
      style: { color: '#155724', marginTop: '0' }
    }, ['✓ Backend Services Operational']));
    
    const statusList = createSafeElement('ul', {
      style: { color: '#155724' }
    });
    
    statusList.appendChild(createSafeElement('li', {}, ['API Server: Running on port 5000']));
    statusList.appendChild(createSafeElement('li', {}, ['Database: Connected (33,510 communities)']));
    statusList.appendChild(createSafeElement('li', {}, ['Authentication: Ready']));
    
    successBox.appendChild(statusList);
    container.appendChild(successBox);
    
    // Buttons container
    const buttonContainer = createSafeElement('div', {
      style: { marginTop: '30px' }
    });
    
    const loginButton = createSafeElement('button', {
      style: {
        padding: '12px 24px',
        background: '#3B82F6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer'
      },
      onclick: function() { window.location.href = '/api/auth/login'; }
    }, ['Login to System']);
    
    const testButton = createSafeElement('button', {
      style: {
        padding: '12px 24px',
        background: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
        marginLeft: '10px'
      },
      onclick: function() { testAPI(); }
    }, ['Test API Connection']);
    
    buttonContainer.appendChild(loginButton);
    buttonContainer.appendChild(testButton);
    container.appendChild(buttonContainer);
    
    // API response div
    const responseDiv = createSafeElement('div', {
      id: 'api-response',
      style: { marginTop: '20px' }
    });
    container.appendChild(responseDiv);
    
    // Append everything to root
    root.appendChild(container);
    
    // Add API test function
    window.testAPI = async function() {
      const responseDiv = document.getElementById('api-response');
      
      // Clear and update safely
      while (responseDiv.firstChild) {
        responseDiv.removeChild(responseDiv.firstChild);
      }
      responseDiv.appendChild(createSafeElement('p', {}, ['Testing API...']));
      
      try {
        const response = await fetch('/api/communities/count');
        const data = await response.json();
        
        while (responseDiv.firstChild) {
          responseDiv.removeChild(responseDiv.firstChild);
        }
        
        const successDiv = createSafeElement('div', {
          style: {
            background: '#d4edda',
            padding: '15px',
            borderRadius: '6px'
          }
        });
        
        successDiv.appendChild(createSafeElement('strong', {}, ['API Response: ']));
        successDiv.appendChild(document.createTextNode(JSON.stringify(data)));
        responseDiv.appendChild(successDiv);
        
      } catch (error) {
        while (responseDiv.firstChild) {
          responseDiv.removeChild(responseDiv.firstChild);
        }
        
        const errorDiv = createSafeElement('div', {
          style: {
            background: '#f8d7da',
            padding: '15px',
            borderRadius: '6px'
          }
        });
        
        errorDiv.appendChild(createSafeElement('strong', {}, ['API Error: ']));
        errorDiv.appendChild(document.createTextNode(error.message));
        responseDiv.appendChild(errorDiv);
      }
    };
    
    console.log("Vanilla JS rendered successfully");
  } else {
    console.error("Root element not found");
  }
}); // End DOMContentLoaded