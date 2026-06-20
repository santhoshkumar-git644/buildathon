import NodeCache from 'node-cache';

// Initialize a global cache with a standard Time To Live of 300 seconds (5 minutes)
// checkperiod: 120 means the cache will check for expired keys every 2 minutes.
const myCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

export default myCache;
