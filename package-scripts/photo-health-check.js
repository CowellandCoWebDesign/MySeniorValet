#!/usr/bin/env node

/**
 * Photo Health Check Script Runner
 * 
 * This script provides a convenient way to run photo health checks
 * from the command line with various options.
 */

const { spawn } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  cleanup: false,
  limit: 100,
  priority: null,
  verbose: false
};

// Parse arguments
args.forEach(arg => {
  if (arg === '--cleanup') {
    options.cleanup = true;
  } else if (arg === '--verbose') {
    options.verbose = true;
  } else if (arg.startsWith('--limit=')) {
    options.limit = parseInt(arg.split('=')[1]) || 100;
  } else if (arg.startsWith('--priority=')) {
    options.priority = arg.split('=')[1];
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Photo Health Check Script

Usage: npm run photo-health-check [options]

Options:
  --cleanup              Automatically remove invalid photos
  --limit=N             Limit to N communities (default: 100)
  --priority=high       Only check high-priority communities
  --verbose             Show detailed output
  --help, -h            Show this help message

Examples:
  npm run photo-health-check
  npm run photo-health-check -- --cleanup --limit=50
  npm run photo-health-check -- --verbose --priority=high
`);
    process.exit(0);
  }
});

// Build command arguments for tsx
const scriptPath = path.join(__dirname, '../server/scripts/photo-health-check.ts');
const tsxArgs = [scriptPath];

// Add options as arguments
if (options.cleanup) tsxArgs.push('--cleanup');
if (options.verbose) tsxArgs.push('--verbose');
if (options.limit !== 100) tsxArgs.push(`--limit=${options.limit}`);
if (options.priority) tsxArgs.push(`--priority=${options.priority}`);

console.log('🔍 Starting Photo Health Check...');
console.log(`📊 Options: ${JSON.stringify(options, null, 2)}`);

// Execute the TypeScript script using tsx
const child = spawn('npx', ['tsx', ...tsxArgs], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('error', (error) => {
  console.error('❌ Failed to start photo health check:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Photo Health Check completed successfully!');
  } else {
    console.error(`❌ Photo Health Check failed with exit code ${code}`);
  }
  process.exit(code);
});