#!/bin/bash

# Start ChatKit Python microservice
echo "🚀 Starting ChatKit Python microservice on port 8001..."

# Export environment variables
export CHATKIT_SERVICE_PORT=8001

# Start the Python service
cd python && python chatkit_service.py