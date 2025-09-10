const fs = require('fs');

const fixes = [
  // Fix authentication tests - response is {user: ...} not {data: {user: ...}}
  {
    old: `  await runTest('User Registration', async () => {
    const result = await makeRequest('POST', '/auth/quick-signup', {
      email: \`test_\${Date.now()}@example.com\`,
      password: 'testpass123'
    });
    return {
      success: result.success && result.data.user,
      details: result.data,
      error: result.error
    };
  });`,
    new: `  await runTest('User Registration', async () => {
    const result = await makeRequest('POST', '/auth/quick-signup', {
      email: \`test_\${Date.now()}@example.com\`,
      password: 'testpass123'
    });
    return {
      success: result.success && result.data && result.data.user,
      details: result.data ? result.data.user : 'No user data',
      error: result.error
    };
  });`
  },
  {
    old: `  await runTest('User Login', async () => {
    const result = await makeRequest('POST', '/auth/quick-login', {
      email: 'demo@example.com',
      password: 'demo123'
    });
    return {
      success: result.success && result.data.user,
      details: result.data,
      error: result.error
    };
  });`,
    new: `  await runTest('User Login', async () => {
    const result = await makeRequest('POST', '/auth/quick-login', {
      email: 'demo@example.com',
      password: 'demo123'
    });
    return {
      success: result.success && result.data && result.data.user,
      details: result.data ? result.data.user : 'No user data',
      error: result.error
    };
  });`
  },
  // Fix map bounds search to use correct parameter format
  {
    old: `  await runTest('Map Bounds Search', async () => {
    const bounds = {
      north: 34.0522,
      south: 33.9522,
      east: -118.1437,
      west: -118.3437
    };
    const result = await makeRequest('GET', \`/communities/search-fixed?north=\${bounds.north}&south=\${bounds.south}&east=\${bounds.east}&west=\${bounds.west}&limit=50\`);
    return {
      success: result.success && result.data.length > 0,
      details: \`Found \${result.data.length} communities\`,
      error: result.error
    };
  });`,
    new: `  await runTest('Map Bounds Search', async () => {
    const bounds = '-118.3437,33.9522,-118.1437,34.0522'; // west,south,east,north
    const result = await makeRequest('GET', \`/communities/search-fixed?bounds=\${bounds}&limit=50\`);
    return {
      success: result.success && result.data && result.data.length > 0,
      details: result.data ? \`Found \${result.data.length} communities\` : 'No data',
      error: result.error
    };
  });`
  },
  // Fix map clustering test
  {
    old: `  await runTest('Map Clustering', async () => {
    const result = await makeRequest('GET', '/communities/clusters-fixed?north=34.0522&south=33.9522&east=-118.1437&west=-118.3437&zoom=10');
    return {
      success: result.success && result.data.features,
      details: result.data,
      error: result.error
    };
  });`,
    new: `  await runTest('Map Clustering', async () => {
    const result = await makeRequest('GET', '/communities/clusters-fixed?north=34.0522&south=33.9522&east=-118.1437&west=-118.3437&zoom=10');
    return {
      success: result.success && result.data && result.data.features && result.data.features.length > 0,
      details: result.data ? \`Found \${result.data.features.length} clusters\` : 'No data',
      error: result.error
    };
  });`
  },
  // Fix similar communities test
  {
    old: `  await runTest('Similar Communities', async () => {
    const result = await makeRequest('GET', '/communities/264/similar');
    return {
      success: result.success && result.data.length > 0,
      details: \`Found \${result.data.length} similar communities\`,
      error: result.error
    };
  });`,
    new: `  await runTest('Similar Communities', async () => {
    const result = await makeRequest('GET', '/communities/264/similar');
    return {
      success: result.success && result.data && Array.isArray(result.data) && result.data.length > 0,
      details: result.data ? \`Found \${result.data.length} similar communities\` : 'No data',
      error: result.error
    };
  });`
  }
];

console.log('Reading comprehensive-platform-test.cjs...');
let content = fs.readFileSync('comprehensive-platform-test.cjs', 'utf8');

let fixCount = 0;
for (const fix of fixes) {
  if (content.includes(fix.old)) {
    content = content.replace(fix.old, fix.new);
    fixCount++;
    console.log(`✓ Fixed test expectation ${fixCount}`);
  } else {
    console.log(`⚠ Could not find pattern for fix ${fixCount + 1}`);
  }
}

console.log(`\nWriting updated file with ${fixCount} fixes...`);
fs.writeFileSync('comprehensive-platform-test.cjs', content);
console.log('✓ All test expectations updated!');