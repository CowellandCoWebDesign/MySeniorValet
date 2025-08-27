#!/bin/bash

# MySeniorValet Frontend Test Runner
# This script runs comprehensive automated tests for the frontend

echo "================================================"
echo " MySeniorValet Frontend Testing Suite"
echo " Running comprehensive automated tests..."
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to run tests with nice formatting
run_test_suite() {
    local test_name=$1
    local test_path=$2
    
    echo -e "${BLUE}Running: ${test_name}${NC}"
    echo "------------------------------------------------"
    
    if npx jest $test_path --silent --colors; then
        echo -e "${GREEN}✓ ${test_name} passed${NC}"
    else
        echo -e "${RED}✗ ${test_name} failed${NC}"
        FAILED_TESTS+=("$test_name")
    fi
    echo ""
}

# Initialize array for failed tests
FAILED_TESTS=()

# Check if Jest is available
if ! npx jest --version > /dev/null 2>&1; then
    echo -e "${RED}Error: Jest is not installed. Please install Jest first.${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting Test Execution...${NC}"
echo ""

# Run different test suites
echo "================================================"
echo " UNIT TESTS"
echo "================================================"
echo ""

# Test Home Page
run_test_suite "Home Page Tests" "client/src/pages/myseniorvalet-home.test.tsx"

# Test AutocompleteSearch Component
run_test_suite "AutocompleteSearch Component Tests" "client/src/components/AutocompleteSearch.test.tsx"

# Test Community Detail Page
run_test_suite "Community Detail Page Tests" "client/src/pages/community-detail.test.tsx"

echo "================================================"
echo " INTEGRATION TESTS"
echo "================================================"
echo ""

# Test Search Flow Integration
run_test_suite "Search Flow Integration Tests" "tests/integration/search-flow.test.tsx"

echo "================================================"
echo " TEST COVERAGE REPORT"
echo "================================================"
echo ""

# Generate coverage report
echo -e "${BLUE}Generating coverage report...${NC}"
npx jest --coverage --silent --coverageReporters=text-summary client/src

echo ""
echo "================================================"
echo " TEST SUMMARY"
echo "================================================"
echo ""

# Check if any tests failed
if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed successfully!${NC}"
    echo ""
    echo "Your frontend is fully tested and ready for production."
else
    echo -e "${RED}✗ Some tests failed:${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}- ${test}${NC}"
    done
    echo ""
    echo "Please review and fix the failing tests."
    exit 1
fi

echo ""
echo "================================================"
echo " TESTING COMPLETE"
echo "================================================"