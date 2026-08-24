/**
 * Subscription and Recurring Expense Detector Utility
 * Analyzes transaction logs and recurring billing patterns to calculate annualized leakage.
 */

// Known subscription merchants & keywords
const SUBSCRIPTION_PATTERNS = [
  { match: /netflix/i, name: "Netflix", category: "Entertainment", defaultPeriod: "monthly" },
  { match: /spotify/i, name: "Spotify", category: "Entertainment", defaultPeriod: "monthly" },
  { match: /prime|amazon video/i, name: "Amazon Prime", category: "Entertainment", defaultPeriod: "annual" },
  { match: /hotstar|disney/i, name: "Disney+ Hotstar", category: "Entertainment", defaultPeriod: "annual" },
  { match: /youtube/i, name: "YouTube Premium", category: "Entertainment", defaultPeriod: "monthly" },
  { match: /adobe/i, name: "Adobe Creative Cloud", category: "Software / Work", defaultPeriod: "monthly" },
  { match: /figma/i, name: "Figma", category: "Software / Work", defaultPeriod: "monthly" },
  { match: /chatgpt|openai/i, name: "ChatGPT Plus", category: "Software / AI", defaultPeriod: "monthly" },
  { match: /midjourney/i, name: "Midjourney", category: "Software / AI", defaultPeriod: "monthly" },
  { match: /gym|cult\.fit|fitness/i, name: "Cult.fit / Gym", category: "Health & Fitness", defaultPeriod: "annual" },
  { match: /apple/i, name: "Apple Services / iCloud", category: "Tech", defaultPeriod: "monthly" },
  { match: /google one/i, name: "Google One Storage", category: "Tech", defaultPeriod: "annual" },
  { match: /broadband|wifi|airtel|jio/i, name: "Broadband / Telecom", category: "Utilities", defaultPeriod: "monthly" },
];

/**
 * Detects recurring charges from transaction list
 * 
 * @param {Array} transactions 
 * @param {Object} fixedExpenses 
 * @returns {Object} Subscription audit report
 */
export function detectSubscriptions(transactions = [], fixedExpenses = {}) {
  const detected = new Map();

  // 1. Scan transactions for subscription keywords
  transactions.forEach((tx) => {
    if (tx.type !== "expense" && tx.type !== "fixed") return;

    const textToMatch = `${tx.title || ""} ${tx.merchant || ""} ${tx.category || ""}`;
    
    for (const pattern of SUBSCRIPTION_PATTERNS) {
      if (pattern.match.test(textToMatch)) {
        if (!detected.has(pattern.name)) {
          detected.set(pattern.name, {
            id: `sub_${pattern.name.toLowerCase().replace(/\s+/g, "_")}`,
            name: pattern.name,
            category: pattern.category,
            amount: Number(tx.amount || 0),
            period: pattern.defaultPeriod,
            lastBilled: tx.date || "Recent",
            paymentMode: tx.paymentMode || "Auto Mandate",
          });
        }
        break;
      }
    }
  });

  // 2. If transactions don't match or are empty, fallback to fixedExpenses subscriptions
  if (detected.size === 0 && fixedExpenses?.subscriptions) {
    detected.set("General Subscriptions", {
      id: "sub_general",
      name: "Bundled Digital Subscriptions",
      category: "Digital Services",
      amount: Number(fixedExpenses.subscriptions),
      period: "monthly",
      lastBilled: "Current Month",
      paymentMode: "Auto Debit",
    });
  }

  const subscriptionsList = Array.from(detected.values());

  // Calculate monthly total and annualized burn
  const monthlyTotal = subscriptionsList.reduce((sum, item) => {
    return sum + (item.period === "annual" ? item.amount / 12 : item.amount);
  }, 0);

  const annualTotal = monthlyTotal * 12;

  // 10-Year Opportunity Cost (Compound growth of monthlyTotal @ 12% p.a. in Nifty Index)
  const ratePerMonth = 0.12 / 12;
  const months = 120;
  let tenYearOpportunityCost = 0;
  for (let m = 0; m < months; m++) {
    tenYearOpportunityCost = (tenYearOpportunityCost + monthlyTotal) * (1 + ratePerMonth);
  }

  return {
    subscriptions: subscriptionsList,
    totalCount: subscriptionsList.length,
    monthlyTotal: Math.round(monthlyTotal),
    annualTotal: Math.round(annualTotal),
    tenYearOpportunityCost: Math.round(tenYearOpportunityCost),
    wasteAlert: monthlyTotal > 3000 ? "High Recurring Leakage" : "Normal Overhead",
  };
}
