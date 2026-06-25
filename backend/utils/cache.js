import NodeCache from 'node-cache';

// Initialize a global cache with a Time To Live of 1 second so external seed scripts reflect instantly
// checkperiod: 120 means the cache will check for expired keys every 2 minutes.
const myCache = new NodeCache({ stdTTL: 1, checkperiod: 120 });

export default myCache;
