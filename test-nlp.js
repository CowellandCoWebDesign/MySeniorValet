const stateMap = {
  'texas': 'TX',
  'california': 'CA'
};

const query = "memory care in texas";
const lower = "texas";
const result = stateMap[lower] || lower.toUpperCase();
console.log("Input:", lower);
console.log("Result:", result);
