// Debug script to identify where "Invalid community ID" is coming from

import { execSync } from 'child_process';

console.log('🔍 Debugging Mapping Route Interception Issue\n');

// Check the exact route registration order
console.log('1. Checking route registration in server/routes/index.ts:');
try {
  const routeIndex = execSync('grep -n "registerMapping\\|registerCommunity" server/routes/index.ts', { encoding: 'utf8' });
  console.log(routeIndex);
} catch (e) {
  console.log('Error reading route index');
}

// Find all "Invalid community ID" occurrences
console.log('\n2. All "Invalid community ID" occurrences:');
try {
  const errorSources = execSync('grep -rn "Invalid community ID" server/', { encoding: 'utf8' });
  console.log(errorSources);
} catch (e) {
  console.log('No results found');
}

// Check for middleware that might be intercepting
console.log('\n3. Checking for middleware with version "v4_streamlined_hero":');
try {
  const versionSources = execSync('grep -rn "v4_streamlined_hero" server/', { encoding: 'utf8' });
  console.log(versionSources);
} catch (e) {
  console.log('No version matches found');
}

// Check for global error handlers
console.log('\n4. Checking for global error handlers:');
try {
  const errorHandlers = execSync('grep -rn "app.use.*error\\|app.get.*\\*" server/', { encoding: 'utf8' });
  console.log(errorHandlers);
} catch (e) {
  console.log('No global handlers found');
}

console.log('\n✅ Debug complete');