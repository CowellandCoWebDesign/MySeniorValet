#!/bin/bash

# Test the chatkit search directly
curl -X POST http://localhost:5000/api/chatkit/stream \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Find senior living communities in San Jose, California",
    "thread_id": "thread_test_123"
  }'