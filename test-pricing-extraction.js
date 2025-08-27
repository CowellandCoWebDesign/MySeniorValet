// Test pricing extraction logic
const testContents = [
  {
    name: "Test 1: Standard pricing format",
    content: "Assisted Living: $4,500 per month. Memory Care: $6,200 monthly. Independent Living: $3,800"
  },
  {
    name: "Test 2: Without dollar signs",
    content: "Assisted living costs 4500 per month, memory care is 6200, and independent living runs 3800"
  },
  {
    name: "Test 3: Mixed formats",
    content: "Our pricing: Assisted Living - $4,500, Memory Care pricing: $6,200, Independent Living from $3,800"
  },
  {
    name: "Test 4: No pricing numbers",
    content: "Assisted living: contact for pricing, Memory care: varies, Independent living: call us"
  },
  {
    name: "Test 5: With decimals",
    content: "Assisted Living: $4,500.00, Memory Care: $6,200.50, Independent Living: $3,800.99"
  }
];

function extractPricing(content) {
  const pricing = {};
  
  // More robust regex patterns for pricing extraction
  const assistedMatch = content.match(/assisted living:?\s*\$?([\d,]+(?:\.\d{2})?)/i) ||
                       content.match(/assisted living[^$]*\$\s*([\d,]+(?:\.\d{2})?)/i);
  if (assistedMatch && assistedMatch[1] && /\d/.test(assistedMatch[1])) {
    pricing.assistedLiving = `$${assistedMatch[1].replace(/,/g, '')}`;
  }
  
  const memoryMatch = content.match(/memory care:?\s*\$?([\d,]+(?:\.\d{2})?)/i) ||
                     content.match(/memory care[^$]*\$\s*([\d,]+(?:\.\d{2})?)/i);
  if (memoryMatch && memoryMatch[1] && /\d/.test(memoryMatch[1])) {
    pricing.memoryCare = `$${memoryMatch[1].replace(/,/g, '')}`;
  }
  
  const independentMatch = content.match(/independent living:?\s*\$?([\d,]+(?:\.\d{2})?)/i) ||
                          content.match(/independent living[^$]*\$\s*([\d,]+(?:\.\d{2})?)/i);
  if (independentMatch && independentMatch[1] && /\d/.test(independentMatch[1])) {
    pricing.independentLiving = `$${independentMatch[1].replace(/,/g, '')}`;
  }
  
  return pricing;
}

console.log("Testing pricing extraction logic:");
console.log("=================================\n");

testContents.forEach(test => {
  console.log(`${test.name}`);
  console.log(`Content: "${test.content}"`);
  const pricing = extractPricing(test.content);
  console.log("Extracted pricing:", pricing);
  console.log("---\n");
});

console.log("✅ Testing complete!");