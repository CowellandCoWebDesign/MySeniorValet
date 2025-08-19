const fs = require('fs');

// Read the file
let content = fs.readFileSync('server/routes/careServicesRoutes.ts', 'utf8');

// Replace all instances of like(sql`LOWER(${communities.xyz})`, ...) with ilike(communities.xyz, ...)
content = content.replace(/like\(sql`LOWER\(\$\{communities\.(\w+)\}\)`, `([^`]+)`\)/g, 'ilike(communities.$1, `$2`)');

// Replace all instances of like(sql`LOWER(${communities.careTypes}::text)`, ...) with sql`LOWER(${communities.careTypes}::text) LIKE ...`
content = content.replace(/like\(sql`LOWER\(\$\{communities\.careTypes\}::text\)`, '([^']+)'\)/g, "sql`LOWER(\${communities.careTypes}::text) LIKE '$1'`");

// Write the file back
fs.writeFileSync('server/routes/careServicesRoutes.ts', content);

console.log('Fixed all SQL LOWER function issues');