#!/bin/bash
set -e
npm install
node scripts/post-merge-migrations.mjs
