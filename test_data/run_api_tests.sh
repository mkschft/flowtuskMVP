#!/bin/bash

# Prompt-First Architecture API Test Script
# Usage: ./test_data/run_api_tests.sh

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3000/api/analyze-idea"
TEST_DATA_DIR="./test_data"

echo "🧪 ========================================="
echo "   PROMPT-FIRST API TEST SUITE"
echo "=========================================="
echo ""

# Check if server is running
echo "🔍 Checking if dev server is running..."
if ! curl -s -f -o /dev/null "$API_URL" --max-time 2 2>/dev/null; then
    echo -e "${RED}❌ Error: Dev server not running at $API_URL${NC}"
    echo "   Please run: npm run dev"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: 'jq' not installed. Install for better JSON formatting:${NC}"
    echo "   macOS: brew install jq"
    echo "   Ubuntu: sudo apt-get install jq"
    echo ""
fi

# Test function
run_test() {
    local test_file=$1
    local test_name=$(basename "$test_file" .json)

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Running Test: $test_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Extract input from test file
    local input=$(jq -c '.input' "$test_file")

    # Display test input
    echo "📥 Input:"
    echo "$input" | jq '.'
    echo ""

    # Make API call
    echo "⏳ Calling API..."
    local start_time=$(date +%s)

    local response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "$input")

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Check for errors
    if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
        echo -e "${RED}❌ Test Failed: API returned an error${NC}"
        echo "$response" | jq '.'
        echo ""
        return 1
    fi

    # Validate response structure
    local facts_count=$(echo "$response" | jq '.factsJson.facts | length')
    local brand_name=$(echo "$response" | jq -r '.factsJson.brand.name')
    local target_region=$(echo "$response" | jq -r '.factsJson.targetMarket.primaryRegion')

    echo -e "${GREEN}✓ API call successful${NC}"
    echo "⏱️  Response time: ${duration}s"
    echo ""

    # Display summary
    echo "📊 Response Summary:"
    echo "   • Facts generated: $facts_count"
    echo "   • Brand name: $brand_name"
    echo "   • Target region: $target_region"
    echo ""

    # Validate against expected criteria
    local min_facts=$(jq -r '.expectedOutputCriteria.minimumFacts' "$test_file")

    if [ "$facts_count" -ge "$min_facts" ]; then
        echo -e "${GREEN}✓ Fact count validation passed ($facts_count >= $min_facts)${NC}"
    else
        echo -e "${RED}❌ Fact count validation failed ($facts_count < $min_facts)${NC}"
    fi

    # Display first 2 facts for manual review
    echo ""
    echo "🔍 Sample Facts (first 2):"
    echo "$response" | jq -r '.factsJson.facts[0:2][] | "   • \(.text)"'
    echo ""

    # Check for forbidden phrases
    echo "🚫 Checking for generic phrases..."
    local forbidden_found=0
    while IFS= read -r phrase; do
        if echo "$response" | jq -r '.factsJson.facts[].text' | grep -iq "$phrase"; then
            echo -e "${YELLOW}⚠️  Found forbidden phrase: \"$phrase\"${NC}"
            forbidden_found=1
        fi
    done < <(jq -r '.expectedOutputCriteria.forbiddenPhrases[]' "$test_file")

    if [ $forbidden_found -eq 0 ]; then
        echo -e "${GREEN}✓ No generic phrases detected${NC}"
    fi

    echo ""
    echo -e "${GREEN}✅ Test completed: $test_name${NC}"
    echo ""
}

# Run all tests
test_files=$(ls "$TEST_DATA_DIR"/test_*.json 2>/dev/null || echo "")

if [ -z "$test_files" ]; then
    echo -e "${RED}❌ No test files found in $TEST_DATA_DIR${NC}"
    exit 1
fi

total_tests=0
passed_tests=0

for test_file in $test_files; do
    total_tests=$((total_tests + 1))
    if run_test "$test_file"; then
        passed_tests=$((passed_tests + 1))
    fi
    sleep 2  # Rate limiting between tests
done

# Summary
echo "=========================================="
echo "📈 TEST SUMMARY"
echo "=========================================="
echo "Total tests: $total_tests"
echo "Passed: $passed_tests"
echo "Failed: $((total_tests - passed_tests))"
echo ""

if [ $passed_tests -eq $total_tests ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review output above.${NC}"
    exit 1
fi
