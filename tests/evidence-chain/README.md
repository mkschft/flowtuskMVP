# Evidence Chain Tests

## Overview

These tests ensure that the evidence chain—the core moat of Flowtusk—never breaks across UI updates, refactors, or new features.

## What is the Evidence Chain?

The evidence chain links every generated output (ICPs, value props, emails, etc.) back to specific facts extracted from the user's website. This creates:

1. **Transparency**: Users see WHY the AI made each recommendation
2. **Trust**: Outputs are grounded in real data, not hallucinations
3. **Differentiation**: Our moat vs generic AI tools

## Test Files

- `hero-ui-evidence.test.ts` - Tests for Hero UI components (HeroICPCard, ExpandedResults)
- Future: `api-evidence.test.ts` - Tests for API responses
- Future: `db-evidence.test.ts` - Tests for database persistence

## Running Tests

### Run all tests
```bash
npm test
```

### Run evidence chain tests only
```bash
npm test evidence-chain
```

### Watch mode (during development)
```bash
npm test -- --watch
```

### Coverage report
```bash
npm test -- --coverage
```

## What We Test

### 1. Evidence Resolution
- Fact IDs resolve to actual facts
- Invalid IDs are handled gracefully
- Missing evidence doesn't break the UI

### 2. Cross-Component Consistency
- Same facts used across ICP and Value Prop
- Evidence integrity maintained across components
- No orphaned fact references

### 3. API Response Validation
- All ICPs have evidence arrays
- Facts have required fields (id, text, evidence)
- Primary ICP always has evidence

### 4. Performance
- Evidence resolution completes in <10ms for 100 facts
- No memory leaks with large fact sets

### 5. Error Handling
- Undefined factsJson
- Empty facts array
- Malformed fact IDs

## Test Structure

```typescript
describe('Evidence Chain - [Component]', () => {
  // Mock data
  const mockFactsJson = { ... };
  const mockICP = { ... };
  
  it('should resolve evidence correctly', () => {
    const resolved = resolveEvidence(mockICP.evidence, mockFactsJson);
    expect(resolved).toHaveLength(2);
  });
});
```

## Adding New Tests

When adding new components or features:

1. **Create test file**: `tests/evidence-chain/[feature]-evidence.test.ts`
2. **Test evidence resolution**: Ensure fact IDs resolve correctly
3. **Test error cases**: Missing data, invalid IDs, etc.
4. **Test performance**: For large datasets
5. **Run tests**: `npm test`

## Continuous Integration

These tests run automatically on:
- Every commit (pre-commit hook)
- Every PR (GitHub Actions)
- Every deployment (pre-deploy check)

If tests fail, the deployment is blocked until fixed.

## Why These Tests Matter

Evidence chain integrity is **critical** for:

1. **User Trust**: Without evidence, we're just another AI tool
2. **Debugging**: Evidence helps trace back issues to source data
3. **Legal**: Evidence provides audit trail for generated content
4. **Product Differentiation**: Our moat vs competitors

## Common Issues

### Issue: Test fails with "Cannot find fact ID"
**Solution**: Check that the fact ID in the mock ICP matches a fact in mockFactsJson

### Issue: Test fails with "Expected 2 but got 0"
**Solution**: Ensure resolveEvidence function is correctly filtering undefined results

### Issue: Performance test fails (>10ms)
**Solution**: Check if you're using `.find()` in a loop (use a Map instead)

## Best Practices

1. **Mock Data Quality**: Use realistic fact IDs and content
2. **Test Edge Cases**: Empty arrays, undefined values, etc.
3. **Keep Tests Fast**: Evidence tests should complete in <100ms total
4. **Test the Contract**: Test the interface, not implementation details

## Monitoring

In production, we also monitor:
- % of ICPs with evidence (target: 100%)
- Average evidence count per ICP (target: 3-5)
- Evidence resolution errors (target: 0%)

These metrics are tracked in PostHog and alerted in Slack.

## Resources

- Evidence chain architecture: `/docs/PROMPT_ARCHITECTURE_OVERHAUL.md`
- Prompt templates: `/lib/prompt-templates.ts` (READ-ONLY)
- Validators: `/lib/validators.ts`

