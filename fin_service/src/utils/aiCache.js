/**
 * AI Analysis Cache Utility
 * 
 * Provides deterministic hashing and multi-tier caching (localStorage + Memory fallback)
 * for AI-generated financial insights, preventing redundant calls to the Gemini API.
 */

// In-memory fallback in case localStorage is unavailable or disabled
const memoryCache = new Map();

const STORAGE_PREFIX = "fin_ai_cache_";

/**
 * 32-bit FNV-1a non-cryptographic fast hashing algorithm.
 * 
 * @param {string} str - Input string to hash.
 * @returns {string} 8-character hexadecimal hash string.
 */
function fnv1aHash(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Recursively canonicalizes an object or array to ensure stable, key-sorted JSON serialization.
 * 
 * @param {*} value - Any JS value to normalize.
 * @returns {*} Normalized canonical structure.
 */
function canonicalize(value) {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (typeof value === "number") {
    // Round to 2 decimal places to avoid floating-point representation variances
    return Math.round(value * 100) / 100;
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (typeof value === "object") {
    const sortedKeys = Object.keys(value).sort();
    const sortedObj = {};
    for (const key of sortedKeys) {
      const val = value[key];
      if (val !== undefined) {
        sortedObj[key] = canonicalize(val);
      }
    }
    return sortedObj;
  }

  return String(value);
}

/**
 * Computes a deterministic hash for any arbitrary JS data structure.
 * 
 * @param {*} data - Input data to hash.
 * @returns {string} Deterministic 8-character hash string.
 */
export function computeDataHash(data) {
  try {
    const canonical = canonicalize(data);
    const serialized = JSON.stringify(canonical);
    return fnv1aHash(serialized);
  } catch (err) {
    console.warn("Error computing data hash, falling back to timestamp:", err);
    return fnv1aHash(String(Date.now()));
  }
}

/**
 * Computes a normalized hash specifically for personal financial data.
 * 
 * @param {Object} financialData
 * @returns {string}
 */
export function computeFinancialDataHash(financialData) {
  if (!financialData) return "empty_finances";
  
  const normalized = {
    income: financialData.income || 0,
    fixedExpenses: financialData.fixedExpenses || 0,
    variableExpenses: financialData.variableExpenses || 0,
    investments: financialData.investments || {},
    loans: financialData.loans || {},
    goals: financialData.goals || ""
  };
  
  return computeDataHash(normalized);
}

/**
 * Computes a hash for scenario simulation parameters.
 * 
 * @param {Object} currentData
 * @param {Object} scenarioParams
 * @returns {string}
 */
export function computeScenarioHash(currentData, scenarioParams) {
  return computeDataHash({
    current: currentData || {},
    scenario: scenarioParams || {}
  });
}

/**
 * Computes a hash for spending behavior transactions.
 * 
 * @param {Array} transactions
 * @param {string} [timeRange=""]
 * @returns {string}
 */
export function computeSpendingHash(transactions, timeRange = "") {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return "empty_transactions";
  }
  
  // Hash key transaction properties
  const sanitized = transactions.map(t => ({
    id: t.id || "",
    amount: t.amount,
    category: t.category,
    date: t.date
  }));
  
  return computeDataHash({
    timeRange,
    transactions: sanitized
  });
}

/**
 * Computes a hash for historical decision analyses.
 * 
 * @param {Array} decisions
 * @returns {string}
 */
export function computeBackwardHash(decisions) {
  if (!Array.isArray(decisions) || decisions.length === 0) {
    return "empty_decisions";
  }
  return computeDataHash(decisions);
}

/**
 * Computes a hash for custom questions with context.
 * 
 * @param {string} customPrompt
 * @param {Object} finances
 * @returns {string}
 */
export function computeQuestionHash(customPrompt, finances) {
  return computeDataHash({
    prompt: customPrompt || "",
    finances: finances || {}
  });
}

/**
 * Builds the composite storage key.
 * 
 * @param {string} userId
 * @param {string} category
 * @returns {string}
 */
function getStorageKey(userId, category) {
  const safeUser = userId || "guest";
  return `${STORAGE_PREFIX}${safeUser}_${category}`;
}

/**
 * Safe wrapper for localStorage.getItem
 */
function safeGetItem(key) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (err) {
    console.warn("localStorage read failed:", err);
  }
  return null;
}

/**
 * Safe wrapper for localStorage.setItem
 */
function safeSetItem(key, value) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch (err) {
    console.warn("localStorage write failed:", err);
  }
  return false;
}

/**
 * Safe wrapper for localStorage.removeItem
 */
function safeRemoveItem(key) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn("localStorage remove failed:", err);
  }
}

/**
 * Retrieves cached AI response if data hash matches.
 * 
 * @param {string} userId - User identifier.
 * @param {string} category - Category key (e.g. 'personal_advice', 'spending', 'scenario').
 * @param {string} dataHash - Expected hash of the current data.
 * @returns {string|null} Cached response string or null if cache miss / hash mismatch.
 */
export function getAiCache(userId, category, dataHash) {
  const key = getStorageKey(userId, category);
  
  let entry = null;
  const raw = safeGetItem(key);
  
  if (raw) {
    try {
      entry = JSON.parse(raw);
    } catch {
      entry = null;
    }
  }

  // Fallback to in-memory cache
  if (!entry && memoryCache.has(key)) {
    entry = memoryCache.get(key);
  }

  if (!entry) {
    return null;
  }

  // Check if hash matches
  if (entry.hash === dataHash && typeof entry.result === "string" && entry.result.length > 0) {
    return entry.result;
  }

  return null;
}

/**
 * Stores an AI response in cache for the specified user, category, and data hash.
 * 
 * @param {string} userId - User identifier.
 * @param {string} category - Category key.
 * @param {string} dataHash - Hash of input data.
 * @param {string} result - Generated AI response markdown.
 * @param {Object} [metadata={}] - Additional metadata.
 */
export function setAiCache(userId, category, dataHash, result, metadata = {}) {
  if (!result || typeof result !== "string") return;

  const key = getStorageKey(userId, category);
  const entry = {
    hash: dataHash,
    result,
    timestamp: Date.now(),
    metadata
  };

  // Write to memory cache
  memoryCache.set(key, entry);

  // Write to persistent storage
  safeSetItem(key, JSON.stringify(entry));
}

/**
 * Returns cache metadata (timestamp, age, validity) for UI display.
 * 
 * @param {string} userId
 * @param {string} category
 * @param {string} [dataHash]
 * @returns {{ cached: boolean, timestamp: number|null, formattedTime: string|null }}
 */
export function getAiCacheInfo(userId, category, dataHash) {
  const key = getStorageKey(userId, category);
  let entry = null;
  
  const raw = safeGetItem(key);
  if (raw) {
    try {
      entry = JSON.parse(raw);
    } catch {
      entry = null;
    }
  }

  if (!entry && memoryCache.has(key)) {
    entry = memoryCache.get(key);
  }

  if (!entry) {
    return { cached: false, timestamp: null, formattedTime: null };
  }

  const isMatchingHash = !dataHash || entry.hash === dataHash;
  if (!isMatchingHash) {
    return { cached: false, timestamp: null, formattedTime: null };
  }

  const date = new Date(entry.timestamp);
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return {
    cached: true,
    timestamp: entry.timestamp,
    formattedTime: `${formattedDate}, ${formattedTime}`
  };
}

/**
 * Clears cached AI responses for a user and category.
 * 
 * @param {string} userId
 * @param {string} [category] - If omitted, clears all AI cache for this user.
 */
export function clearAiCache(userId, category) {
  if (!userId) return;

  if (category) {
    const key = getStorageKey(userId, category);
    safeRemoveItem(key);
    memoryCache.delete(key);
  } else {
    // Clear all keys matching prefix + userId
    const prefix = `${STORAGE_PREFIX}${userId}_`;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const keysToRemove = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(prefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => {
          safeRemoveItem(k);
          memoryCache.delete(k);
        });
      }
    } catch (err) {
      console.warn("Failed to clear user AI cache:", err);
    }
  }
}
