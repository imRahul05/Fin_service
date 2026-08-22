/**
 * Universal Gemini AI Constants and Model Definitions
 * 
 * Free-tier and high-performance Google Gemini models for financial analysis.
 */

export const GEMINI_MODELS = {
  // Recommended Default Model (Fast, accurate, generous free tier)
  DEFAULT: "gemini-2.5-flash",

  // Primary Free-Tier / Flash Models
  FLASH_2_5: "gemini-2.5-flash",
  FLASH_3_7: "gemini-3.7-flash",
  FLASH_3_6: "gemini-3.6-flash",
  FLASH_3_5: "gemini-3.5-flash",

  // Lightweight / High-Throughput Models
  FLASH_LITE_3_5: "gemini-3.5-flash-lite",
  FLASH_LITE_3_1: "gemini-3.1-flash-lite",

  // Alias Pointers
  FLASH_LATEST: "gemini-flash-latest",
  FLASH_LITE_LATEST: "gemini-flash-lite-latest",

  // Advanced Reasoning / Pro Models
  PRO_3_1_PREVIEW: "gemini-3.1-pro-preview",
  PRO_LATEST: "gemini-pro-latest",
};

/**
 * Detailed Metadata for Available Models
 */
export const MODEL_CATALOG = {
  [GEMINI_MODELS.FLASH_2_5]: {
    name: "Gemini 2.5 Flash",
    tier: "Free Tier / Recommended",
    description: "Best balance of reasoning speed, financial calculations, and high throughput.",
    recommendedFor: "General financial advice, budget recommendations, and what-if calculations."
  },
  [GEMINI_MODELS.FLASH_3_7]: {
    name: "Gemini 3.7 Flash",
    tier: "Free Tier / Next-Gen Flash",
    description: "Next-generation model with enhanced reasoning and problem-solving.",
    recommendedFor: "Deep financial analysis and multi-variable simulation."
  },
  [GEMINI_MODELS.FLASH_3_6]: {
    name: "Gemini 3.6 Flash",
    tier: "Free Tier",
    description: "High-speed reasoning model with optimized response generation.",
    recommendedFor: "Fast financial analysis and spending classification."
  },
  [GEMINI_MODELS.FLASH_3_5]: {
    name: "Gemini 3.5 Flash",
    tier: "Free Tier",
    description: "Stable, low latency model for conversational financial questions.",
    recommendedFor: "Real-time user Q&A and spending insights."
  },
  [GEMINI_MODELS.FLASH_LITE_3_5]: {
    name: "Gemini 3.5 Flash Lite",
    tier: "Free Tier / Ultra-Fast",
    description: "Lightweight and cost-efficient for rapid queries and summaries.",
    recommendedFor: "Quick spending summaries and categorizations."
  }
};

/**
 * Fallback Model Priority Order (used if primary model hits rate limit / temporary 503)
 */
export const FALLBACK_MODELS = [
  GEMINI_MODELS.FLASH_2_5,
  GEMINI_MODELS.FLASH_3_5,
  GEMINI_MODELS.FLASH_3_6,
  GEMINI_MODELS.FLASH_LATEST,
  GEMINI_MODELS.FLASH_LITE_3_5,
];

/**
 * Default Generation Configuration
 */
export const DEFAULT_AI_CONFIG = {
  temperature: 0.7,
  topP: 0.95,
  maxOutputTokens: 2048,
};
