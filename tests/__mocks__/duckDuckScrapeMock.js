const SafeSearchType = { STRICT: 0, MODERATE: -1, OFF: -2 };

const search = async () => ({ noResults: true, results: [] });

module.exports = { search, SafeSearchType };
