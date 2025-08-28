# Comprehensive NLP Search System Test Suite
## Based on Industry Standards Research (MS MARCO, TREC, Zillow, PostgreSQL)

### **TEST CATEGORIES (100+ Test Cases)**

## **1. MULTI-INTENT DETECTION TESTING**

### **A. Intent Classification Accuracy**
```javascript
// Test Suite 1: Single Intent Detection
const singleIntentTests = [
  { query: "Sacramento", expectedIntent: "location", expectedScore: "> 0.7" },
  { query: "memory care", expectedIntent: "careType", expectedScore: "> 0.7" },
  { query: "under $4000", expectedIntent: "price", expectedScore: "> 0.7" },
  { query: "Atria Senior Living", expectedIntent: "company", expectedScore: "> 0.7" },
  { query: "best senior living", expectedIntent: "general", expectedScore: "> 0.5" }
];

// Test Suite 2: Multi-Intent Detection  
const multiIntentTests = [
  { 
    query: "Sacramento memory care", 
    expectedIntents: { location: "> 0.3", careType: "> 0.4" }, 
    expectedDominant: "careType",
    expectedResults: "> 0" 
  },
  { 
    query: "Sacramento under $5000", 
    expectedIntents: { location: "> 0.3", price: "> 0.4" }, 
    expectedDominant: "price",
    expectedResults: "> 0" 
  },
  { 
    query: "Atria memory care California", 
    expectedIntents: { company: "> 0.5", careType: "> 0.4", location: "> 0.3" },
    expectedDominant: "company",
    expectedResults: "> 0" 
  }
];
```

### **B. Edge Case Intent Detection**
```javascript
const intentEdgeCases = [
  // Geographic Edge Cases
  { query: "", expectedBehavior: "empty query handling" },
  { query: "   ", expectedBehavior: "whitespace handling" },
  { query: "xyz123", expectedBehavior: "invalid location graceful fail" },
  { query: "Sacramento, XX", expectedBehavior: "invalid state code handling" },
  { query: "90210", expectedBehavior: "ZIP code detection" },
  
  // Price Edge Cases  
  { query: "under $0", expectedBehavior: "zero price handling" },
  { query: "under $999999999", expectedBehavior: "extreme price handling" },
  { query: "under $abc", expectedBehavior: "invalid price format" },
  { query: "free", expectedBehavior: "free price detection" },
  { query: "$2000-$4000", expectedBehavior: "price range detection" },
  
  // Care Type Edge Cases
  { query: "memory", expectedBehavior: "partial care type match" },
  { query: "alzheimers disease care", expectedBehavior: "long care type phrase" },
  { query: "nursing home facility", expectedBehavior: "care type synonyms" },
  
  // Company Edge Cases
  { query: "brookdale senior", expectedBehavior: "partial company name" },
  { query: "ATRIA", expectedBehavior: "case insensitive company" },
  { query: "sunrise senior living llc", expectedBehavior: "company with suffix" }
];
```

## **2. SEARCH RESULT ACCURACY TESTING**

### **A. Geographic Precision Tests**
```javascript
const geographicTests = [
  // Exact Location Matches
  { 
    query: "Sacramento", 
    validation: {
      allResults: "must have city = 'Sacramento' OR state contains 'CA'",
      minResults: 5,
      maxResponseTime: "800ms"
    }
  },
  { 
    query: "California", 
    validation: {
      allResults: "must have state = 'CA'",
      minResults: 100,
      maxResponseTime: "1000ms"
    }
  },
  
  // Multi-Location Tests
  { 
    query: "Los Angeles memory care", 
    validation: {
      locationFilter: "city = 'Los Angeles' OR nearby cities",
      careTypeFilter: "careTypes contains 'Memory Care'",
      combinedLogic: "AND operation, not OR",
      minResults: 1
    }
  }
];
```

### **B. Price Filtering Accuracy**
```javascript
const priceFilterTests = [
  // Exact Price Tests
  { 
    query: "under $4000", 
    validation: {
      allResults: "rentPerMonth < 4000 AND rentPerMonth IS NOT NULL",
      dataTypes: "all prices must be valid numbers",
      sorting: "results ordered by price ASC",
      edgeCases: "handle empty strings, invalid formats"
    }
  },
  { 
    query: "over $7000", 
    validation: {
      allResults: "rentPerMonth > 7000",
      minResults: 1,
      maxPrice: "< $50000 (sanity check)"
    }
  },
  
  // Price Range Tests
  { 
    query: "$3000 to $6000", 
    validation: {
      allResults: "rentPerMonth BETWEEN 3000 AND 6000",
      boundaries: "test 2999.99, 3000.00, 6000.00, 6000.01",
      sorting: "price ascending order"
    }
  },
  
  // Qualitative Price Tests
  { 
    query: "affordable senior living", 
    validation: {
      priceRange: "rentPerMonth < 4000 (based on market research)",
      resultCount: "> 50 communities",
      geographic: "nationwide results"
    }
  }
];
```

### **C. Care Type Precision Tests**
```javascript
const careTypeTests = [
  // Exact Care Type Matches
  { 
    query: "memory care", 
    validation: {
      allResults: "careTypes contains 'Memory Care' (case insensitive)",
      synonyms: "also match 'Alzheimer', 'Dementia'",
      exclusions: "exclude Assisted Living only",
      minResults: 100
    }
  },
  { 
    query: "assisted living", 
    validation: {
      allResults: "careTypes contains 'Assisted Living'",
      exclusions: "exclude Memory Care only, Independent Living only",
      overlap: "allow Mixed Care communities"
    }
  },
  
  // Care Type Combinations
  { 
    query: "memory care and assisted living", 
    validation: {
      allResults: "careTypes contains BOTH 'Memory Care' AND 'Assisted Living'",
      logic: "AND operation, not OR",
      minResults: 10
    }
  }
];
```

## **3. DATABASE QUERY VALIDATION**

### **A. PostgreSQL Casting Edge Cases**
```sql
-- Test Suite 3: PostgreSQL Price Casting
DO $$ 
DECLARE
    test_cases text[] := ARRAY[
        '3999.99',    -- Valid price
        '4000.00',    -- Boundary value  
        '4000.01',    -- Just over boundary
        '',           -- Empty string
        '   ',        -- Whitespace
        'abc',        -- Invalid text
        '12.34.56',   -- Double decimal
        '$4,000.00',  -- Currency format
        '-100',       -- Negative price
        '0',          -- Zero price
        '999999999',  -- Extreme price
        NULL::text    -- NULL value
    ];
    test_case text;
    result numeric;
    test_query text;
BEGIN
    FOREACH test_case IN ARRAY test_cases LOOP
        BEGIN
            -- Test the actual search engine price filter
            test_query := format('
                SELECT COUNT(*) FROM communities 
                WHERE (
                    rent_per_month IS NOT NULL 
                    AND rent_per_month != ''''
                    AND rent_per_month ~ ''^[0-9]+(\.[0-9]{1,2})?$''
                    AND CAST(NULLIF(TRIM(rent_per_month), '''') AS NUMERIC) < %s
                )', test_case);
            
            EXECUTE test_query INTO result;
            RAISE NOTICE 'Price filter test: % -> % results', test_case, result;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Price filter FAILED: % -> ERROR: %', test_case, SQLERRM;
        END;
    END LOOP;
END $$;
```

## **4. LEARN TAB Q&A VALIDATION**

### **A. NLP Endpoint Integration Tests**
```javascript
const learnModeTests = [
  // Basic Q&A Functionality
  { 
    endpoint: "/api/nlp/ask",
    question: "What is memory care?",
    validation: {
      responseTime: "< 3000ms",
      hasAnswer: "answer field not empty",
      confidence: "> 0.7",
      sources: "has sources array",
      contextRelevant: "answer mentions memory care"
    }
  },
  { 
    endpoint: "/api/nlp/search", 
    query: "memory care communities",
    validation: {
      responseTime: "< 1000ms",
      hasResults: "results array not empty",
      relevantResults: "results contain memory care"
    }
  },
  
  // Complex Multi-Turn Q&A
  { 
    conversation: [
      { question: "What is assisted living?", expectedContext: "assisted living basics" },
      { question: "How much does it cost?", expectedContext: "uses previous assisted living context" },
      { question: "What about memory care?", expectedContext: "switches context to memory care" }
    ],
    validation: {
      contextPreservation: "maintains conversation history",
      contextSwitching: "recognizes new topic changes"
    }
  }
];
```

### **B. Tabbed Interface Validation**
```javascript
const tabbedInterfaceTests = [
  // Tab Switching Tests
  { 
    test: "List to Map tab switch",
    actions: ["search 'Sacramento'", "switch to Map tab", "verify results persist"],
    validation: {
      dataPreservation: "search results maintained",
      uiState: "correct tab active",
      performance: "< 200ms switch time"
    }
  },
  { 
    test: "Map to Learn tab switch",
    actions: ["search 'memory care'", "switch to Learn tab", "verify Q&A interface"],
    validation: {
      contextTransfer: "search query available in Learn mode",
      uiComponents: "Q&A interface renders",
      accessibility: "keyboard navigation works"
    }
  },
  
  // State Management Tests
  { 
    test: "Browser back/forward",
    actions: ["search", "switch tabs", "use browser back", "verify state"],
    validation: {
      urlSynchronization: "URL reflects current tab",
      stateRecovery: "previous search results restored"
    }
  }
];
```

## **5. PERFORMANCE & STRESS TESTING**

### **A. Response Time Benchmarks**
```javascript
const performanceTests = [
  // Basic Performance
  { query: "Sacramento", maxResponseTime: "800ms", target: "< 500ms" },
  { query: "memory care", maxResponseTime: "600ms", target: "< 400ms" },
  { query: "under $5000", maxResponseTime: "1000ms", target: "< 700ms" },
  
  // Complex Query Performance  
  { query: "Sacramento memory care under $5000", maxResponseTime: "1200ms", target: "< 900ms" },
  { query: "Atria assisted living California over $6000", maxResponseTime: "1500ms", target: "< 1000ms" },
  
  // High Load Tests
  { concurrentQueries: 10, maxResponseTime: "2000ms", successRate: "> 95%" },
  { concurrentQueries: 50, maxResponseTime: "5000ms", successRate: "> 90%" }
];
```

## **6. END-TO-END USER JOURNEY TESTING**

### **A. Complete Search Flows**
```javascript
const userJourneyTests = [
  // Scenario 1: Location + Care Type Search
  {
    journey: [
      { action: "visit homepage", validation: "page loads" },
      { action: "search 'Sacramento memory care'", validation: "results appear" },
      { action: "switch to Map tab", validation: "map shows pins" },
      { action: "switch to Learn tab", validation: "Q&A interface loads" },
      { action: "ask 'What is memory care?'", validation: "gets answer" }
    ],
    successCriteria: "complete flow under 30 seconds"
  },
  
  // Scenario 2: Price-Focused Search
  {
    journey: [
      { action: "search 'under $4000'", validation: "price-filtered results" },
      { action: "verify all results under $4000", validation: "price accuracy" },
      { action: "sort by price", validation: "correct ordering" },
      { action: "click community details", validation: "detailed view loads" }
    ],
    successCriteria: "accurate price filtering throughout"
  }
];
```

## **7. ERROR HANDLING & EDGE CASES**

### **A. System Resilience Tests**
```javascript
const errorHandlingTests = [
  // Network Issues
  { scenario: "API timeout", expectedBehavior: "graceful error message" },
  { scenario: "Database unavailable", expectedBehavior: "retry mechanism" },
  { scenario: "Partial data load", expectedBehavior: "show available results" },
  
  // Input Validation
  { scenario: "SQL injection attempt", expectedBehavior: "safely sanitized" },
  { scenario: "XSS script injection", expectedBehavior: "properly escaped" },
  { scenario: "Extremely long query", expectedBehavior: "length validation" },
  
  // Data Edge Cases
  { scenario: "Community with no price", expectedBehavior: "show 'Contact for pricing'" },
  { scenario: "Community with invalid care types", expectedBehavior: "exclude from care type searches" },
  { scenario: "Duplicate communities", expectedBehavior: "deduplicated results" }
];
```

## **TESTING IMPLEMENTATION PROTOCOL**

### **Phase 1: Automated Basic Functionality (Required: 100% Pass)**
1. Execute all single-intent detection tests
2. Validate basic search result accuracy
3. Test PostgreSQL price casting edge cases
4. Verify Learn tab endpoint connectivity

### **Phase 2: Multi-Intent Integration (Required: 95% Pass)**
1. Test combined location + care type searches
2. Validate complex price filtering
3. Test tabbed interface state management
4. Verify Q&A conversation flows

### **Phase 3: Performance & Stress Testing (Required: 90% Pass)**
1. Response time benchmarks under load
2. Concurrent user simulation
3. Database query optimization validation
4. Memory usage monitoring

### **Phase 4: End-to-End User Journeys (Required: 95% Pass)**
1. Complete search workflows
2. Cross-tab functionality
3. Error recovery scenarios
4. Accessibility compliance

### **PASS/FAIL CRITERIA**

**SYSTEM IS FUNCTIONAL ONLY IF:**
- ✅ All basic intent detection tests pass (100%)
- ✅ Multi-intent searches return relevant results (95%)
- ✅ Price filtering works accurately with edge cases (95%)
- ✅ Learn tab Q&A provides meaningful responses (90%)
- ✅ Tabbed interface maintains state correctly (95%)
- ✅ Performance meets response time targets (90%)
- ✅ End-to-end journeys complete successfully (95%)

**CRITICAL FAILURES (SYSTEM NOT FUNCTIONAL):**
- ❌ "Sacramento memory care" returns 0 results
- ❌ Price filtering throws database errors
- ❌ Intent detection fails on basic queries
- ❌ Learn tab endpoints are unreachable
- ❌ Tab switching loses search state
- ❌ Response times exceed 5 seconds regularly

This comprehensive test suite is based on industry standards from MS MARCO, TREC Deep Learning, Zillow's search quality framework, and PostgreSQL best practices research.