
// Duplicate Prevention System
const processedCommunities = new Set<string>();
const processedSearches = new Set<string>();

export function isDuplicateCommunity(name: string, address: string): boolean {
  const key = `${name.toLowerCase().trim()}|${address.toLowerCase().trim()}`;
  return processedCommunities.has(key);
}

export function markCommunityProcessed(name: string, address: string): void {
  const key = `${name.toLowerCase().trim()}|${address.toLowerCase().trim()}`;
  processedCommunities.add(key);
}

export function isDuplicateSearch(city: string, state: string): boolean {
  const key = `${city.toLowerCase()}|${state.toLowerCase()}`;
  return processedSearches.has(key);
}

export function markSearchProcessed(city: string, state: string): void {
  const key = `${city.toLowerCase()}|${state.toLowerCase()}`;
  processedSearches.add(key);
}

export function resetDuplicateTracking(): void {
  processedCommunities.clear();
  processedSearches.clear();
}

export function getDuplicateStats() {
  return {
    processedCommunities: processedCommunities.size,
    processedSearches: processedSearches.size
  };
}
