const noop = () => '';
const chainable = () => {
  const fn = () => api;
  const api = {
    text: noop,
    html: noop,
    attr: noop,
    find: chainable,
    each: () => api,
    first: chainable,
    map: () => ({ get: () => [] }),
    get: () => [],
    toArray: () => [],
    length: 0
  };
  return api;
};

const load = () => {
  const $ = () => chainable();
  $.html = noop;
  $.text = noop;
  return $;
};

module.exports = { load, contains: () => false, merge: () => [] };
