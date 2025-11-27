# Prompt-First Architecture Test Data

This directory contains test data files and scripts for validating the prompt-first architecture implementation.

## Test Files

Each test file represents a different startup scenario with varying complexity and industry vertical:

- **test_001_fintech.json** - Invoice financing platform for UK small businesses
- **test_002_edtech.json** - GCSE exam prep platform for UK students
- **test_003_saas.json** - Async-first project management tool for remote teams
- **test_004_healthcare.json** - Telemedicine platform for elderly patients
- **test_005_ecommerce.json** - Inventory forecasting tool for Shopify sellers

## Test File Structure

Each JSON file contains:

```json
{
  "testId": "001",
  "category": "FinTech",
  "description": "Brief description",
  "input": {
    "idea": "Full startup idea description (50-500 chars)",
    "targetMarket": "Target market specification",
    "problemStatement": "Problem being solved (optional)",
    "solutionHypothesis": "Proposed solution (optional)",
    "brandVibe": "Brand personality (optional)"
  },
  "expectedOutputCriteria": {
    "minimumFacts": 10,
    "requiredElements": [
      "Specific metrics and measurements",
      "Target market specifications",
      "Geographic signals"
    ],
    "forbiddenPhrases": [
      "Generic marketing phrases to avoid"
    ]
  },
  "qualityChecks": {
    "specificity": "What specific details should be present",
    "geographic": "Geographic market identification requirements",
    "actionability": "HOW the solution works",
    "avoidGeneric": "Generic phrases that indicate poor quality"
  }
}
```

## Running Tests

### Automated Test Suite

Run all tests automatically:

```bash
./test_data/run_api_tests.sh
```

This script will:
- Check if the dev server is running
- Run all 5 test cases sequentially
- Validate response structure
- Check for forbidden generic phrases
- Display summary statistics

**Prerequisites:**
- Dev server must be running: `npm run dev`
- Optional: Install `jq` for better JSON formatting (`brew install jq`)

### Manual API Testing

Test individual scenarios manually:

```bash
# Test FinTech example
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d @test_data/test_001_fintech.json | jq '.factsJson'

# Test EdTech example
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d "$(jq '.input' test_data/test_002_edtech.json)" | jq '.'
```

### Component Testing

Visit the test pages in your browser (with dev server running):

- **IdeaInputForm**: http://localhost:3000/test-idea-form
- **FactsReviewStep**: http://localhost:3000/test-facts-review

## Quality Validation

When reviewing API responses, score each fact on a 1-5 scale for:

1. **Specificity** (5 = has numbers/metrics, 1 = vague)
2. **Actionability** (5 = describes HOW, 1 = just describes WHAT)
3. **Geographic Accuracy** (5 = correct region/market, 1 = missing/wrong)
4. **Evidence Quality** (5 = cites exact user input, 1 = hallucinated)
5. **Avoids Generic Claims** (5 = specific, 1 = "helps businesses")
6. **Quantity** (5 = 15+ facts, 1 = <8 facts)
7. **Value Prop Clarity** (5 = clear benefits, 1 = unclear value)

**Pass Criteria**: Average score ≥ 4.0/5.0

## Expected Performance

- **Response Time**: < 30 seconds per request
- **Token Usage**: ~3,000-4,500 tokens per generation
- **Fact Count**: 10-15 atomic facts minimum
- **Error Rate**: < 5% validation failures

## Edge Cases to Test Manually

Beyond the 5 standard tests, consider testing:

1. **Vague Input**: "A social media app for students"
   - Should still generate 10+ facts by inferring reasonable specifics

2. **Non-English**: "Une application de gestion pour les restaurants français"
   - Should handle French input and generate appropriate facts

3. **Extreme Niche**: "B2B SaaS for nautical rope manufacturers in Norway"
   - Should handle highly specific niches without hallucinating

4. **Maximum Length**: 500 character idea description
   - Should process without truncation

5. **Minimum Length**: Exactly 50 characters
   - Should accept at minimum threshold

## Test Results Tracking

Create a spreadsheet or document to track results:

| Test ID | Category | Facts Count | Avg Quality Score | Response Time | Pass/Fail | Notes |
|---------|----------|-------------|-------------------|---------------|-----------|-------|
| 001     | FinTech  | 12          | 4.2/5.0          | 18s           | ✅ Pass   | Good specificity |
| 002     | EdTech   | 14          | 4.5/5.0          | 22s           | ✅ Pass   | Excellent metrics |
| ...     | ...      | ...         | ...              | ...           | ...       | ...   |

## Troubleshooting

### "Server not running" error
- Ensure dev server is running: `npm run dev`
- Check port 3000 is not in use: `lsof -i :3000`

### "jq: command not found"
- macOS: `brew install jq`
- Ubuntu/Debian: `sudo apt-get install jq`
- Or read raw JSON without jq

### Validation failures
- Check OpenAI API key is set: `echo $OPENAI_API_KEY`
- Review `/docs/PROMPT_FIRST_TESTING_GUIDE.md` for detailed debugging

### Slow response times (>30s)
- Check OpenAI API status: https://status.openai.com
- Verify network connection
- Consider reducing timeout in `lib/api-handler.ts`

## Next Steps After Testing

Once all tests pass with ≥4.0/5.0 quality scores:

1. ✅ Merge prompt-first branch to main
2. 🔄 Run database migration in production
3. 🎨 Complete UI integration in app/page.tsx
4. 📊 Set up analytics for A/B testing (70% idea / 30% URL)
5. 🚀 Deploy and monitor first 100 users

## Questions?

Refer to `/docs/PROMPT_FIRST_TESTING_GUIDE.md` for comprehensive testing instructions.
