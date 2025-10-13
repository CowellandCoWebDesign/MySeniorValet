#!/usr/bin/env python3
import subprocess
import sys

# Run drizzle-kit push with automatic "create table" selection
process = subprocess.Popen(
    ['npx', 'drizzle-kit', 'push'],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

# Send the selection to create new table
stdout, stderr = process.communicate(input='\n')
print(stdout)
if stderr:
    print(stderr, file=sys.stderr)

sys.exit(process.returncode)