import { generateAIResponse } from "../config/ai.config.js";
import { GEMINI_MODELS } from "../constants/ai.constants.js";
import {
  getAiCache,
  setAiCache,
  computeFinancialDataHash,
  computeScenarioHash,
  computeSpendingHash,
  computeBackwardHash,
  computeQuestionHash
} from "../utils/aiCache.js";

/**
 * Generates personalized financial advice based on user financial profile.
 * Automatically checks and stores in client cache to prevent redundant Gemini API calls.
 * 
 * @param {Object} financialData - Financial information (income, expenses, investments, loans, goals).
 * @param {Object} [options={}] - Options object.
 * @param {string} [options.userId] - Current authenticated user ID for scoped caching.
 * @param {boolean} [options.forceRefresh=false] - If true, bypasses cache and forces a new Gemini API request.
 * @returns {Promise<string>} Markdown formatted advice.
 */
export async function getFinancialAdvice(financialData, options = {}) {
  const { userId = "guest", forceRefresh = false } = options;
  const dataHash = computeFinancialDataHash(financialData);

  // Check cache if not forcing refresh
  if (!forceRefresh) {
    const cachedResult = getAiCache(userId, "personal_advice", dataHash);
    if (cachedResult) {
      return cachedResult;
    }
  }

  try {
    const prompt = `
      As a financial advisor, provide personalized advice based on the following financial information:
      
      Monthly Income: ₹${financialData.income}
      Fixed Expenses: ₹${financialData.fixedExpenses}
      Variable Expenses: ₹${financialData.variableExpenses}
      Investments: ${JSON.stringify(financialData.investments)}
      Loans: ${JSON.stringify(financialData.loans)}
      
      Financial Goals: ${financialData.goals || "Not specified"}
      
      Return the analysis in clean Markdown format using exactly these sections:

## Financial Summary
Brief overview of overall financial health.

## Key Insights
- Bullet points highlighting notable observations

## Risks
- Bullet points identifying financial risks

## Recommendations
1. Numbered list of specific actionable steps

## Action Plan
Step-by-step improvements with clear priorities

Rules:
- Use ## for main section headers
- Use ### for subsection headers where needed
- Add a blank line between paragraphs and sections
- Use bullet points (- ) for lists
- Bold important figures or key points using **text**
- Use > blockquotes for critical warnings
- Keep spacing clean and easy to read
    `;

    const advice = await generateAIResponse({
      prompt,
      model: GEMINI_MODELS.DEFAULT,
      systemInstruction: "You are an expert financial advisor specializing in personal finance, investments, and budgeting for individuals in India.",
    });

    if (advice && typeof advice === "string" && !advice.startsWith("Sorry, I couldn't")) {
      setAiCache(userId, "personal_advice", dataHash, advice, {
        category: "personal_advice",
        generatedAt: new Date().toISOString()
      });
    }

    return advice;
  } catch (error) {
    console.error("Error getting AI financial advice:", error);
    return "Sorry, I couldn't generate financial advice at this moment. Please try again later.";
  }
}

/**
 * Simulates a "What-If" financial scenario with caching.
 * 
 * @param {Object} currentData - Current financial data.
 * @param {Object} scenarioParams - Scenario parameters to simulate.
 * @param {Object} [options={}] - Options object.
 * @param {string} [options.userId] - Current authenticated user ID.
 * @param {boolean} [options.forceRefresh=false] - Force regenerate.
 * @returns {Promise<string>} Markdown formatted simulation report.
 */
export async function simulateScenario(currentData, scenarioParams, options = {}) {
  const { userId = "guest", forceRefresh = false } = options;
  const dataHash = computeScenarioHash(currentData, scenarioParams);

  if (!forceRefresh) {
    const cachedResult = getAiCache(userId, "scenario", dataHash);
    if (cachedResult) {
      return cachedResult;
    }
  }

  try {
    const prompt = `
      As a financial simulator, analyze this "What If" scenario:
      
      Current financial situation:
      ${JSON.stringify(currentData)}
      
      Scenario to simulate:
      ${JSON.stringify(scenarioParams)}
      
      Please provide:
      1. Numerical projections over 1, 5, and 10 years
      2. Impact on savings, net worth, and debt-to-income ratio
      3. Pros and cons of this scenario
      4. Alternative approaches to consider
      
      Format your response in clear sections with:
      - Use ## for main section headers
      - Use ### for subsection headers
      - Add blank lines between paragraphs and sections
      - Use bullet points (- ) for listing items
      - Bold important figures or key points using **text**
      - Use tables for numeric projections with years as columns
      - Highlight critical advice using > for blockquotes
      
      Make the layout spacious and easy to read with clear visual separation between sections.
      Focus on realistic outcomes relevant to the Indian financial context.
    `;

    const simulation = await generateAIResponse({
      prompt,
      model: GEMINI_MODELS.DEFAULT,
      systemInstruction: "You are a specialized financial projection and scenario planning expert.",
    });

    if (simulation && typeof simulation === "string" && !simulation.startsWith("Sorry, I couldn't")) {
      setAiCache(userId, "scenario", dataHash, simulation, {
        category: "scenario",
        generatedAt: new Date().toISOString()
      });
    }

    return simulation;
  } catch (error) {
    console.error("Error simulating financial scenario:", error);
    return "Sorry, I couldn't simulate this scenario at this moment. Please try again later.";
  }
}

/**
 * Analyzes transaction logs and spending behavior with caching.
 * 
 * @param {Array} transactions - User transaction logs.
 * @param {Object} [options={}] - Options object.
 * @param {string} [options.userId] - Current authenticated user ID.
 * @param {string} [options.timeRange=""] - Selected time period filter.
 * @param {boolean} [options.forceRefresh=false] - Force regenerate.
 * @returns {Promise<string>} Markdown formatted spending breakdown.
 */
export async function analyzeSpendingBehavior(transactions, options = {}) {
  const { userId = "guest", timeRange = "", forceRefresh = false } = options;
  const dataHash = computeSpendingHash(transactions, timeRange);

  if (!forceRefresh) {
    const cachedResult = getAiCache(userId, "spending", dataHash);
    if (cachedResult) {
      return cachedResult;
    }
  }

  try {
    const prompt = `
      As a spending behavior analyst, review these transactions:
      
      ${JSON.stringify(transactions)}
      
      Please provide:
      1. Key spending patterns and categories breakdown
      2. Unusual or inefficient spending patterns
      3. 3-5 specific recommendations for saving money
      4. Categorize spending into essential vs non-essential
      
      Format your response in clear sections with:
      - Use ## for main section headers
      - Use ### for subsection headers
      - Add blank lines between paragraphs and sections
      - Use bullet points (- ) for listing items
      - Bold important figures or key points using **text**
      - Use tables for category breakdowns if applicable
      - Highlight critical advice using > for blockquotes
      
      Make the layout spacious and easy to read with clear visual separation between sections.
      Consider Indian context and local spending categories like UPI, e-commerce, etc.
    `;

    const analysis = await generateAIResponse({
      prompt,
      model: GEMINI_MODELS.DEFAULT,
      systemInstruction: "You are an expert expense and cash-flow analyst.",
    });

    if (analysis && typeof analysis === "string" && !analysis.startsWith("Sorry, I couldn't")) {
      setAiCache(userId, "spending", dataHash, analysis, {
        category: "spending",
        generatedAt: new Date().toISOString()
      });
    }

    return analysis;
  } catch (error) {
    console.error("Error analyzing spending behavior:", error);
    return "Sorry, I couldn't analyze your spending behavior at this moment. Please try again later.";
  }
}

/**
 * Analyzes historical financial decisions and produces retrospective insights with caching.
 * 
 * @param {Array} historicalDecisions - Past financial actions and outcomes.
 * @param {Object} [options={}] - Options object.
 * @param {string} [options.userId] - Current authenticated user ID.
 * @param {boolean} [options.forceRefresh=false] - Force regenerate.
 * @returns {Promise<string>} Markdown formatted retrospective report.
 */
export async function getBackwardAnalysis(historicalDecisions, options = {}) {
  const { userId = "guest", forceRefresh = false } = options;
  const dataHash = computeBackwardHash(historicalDecisions);

  if (!forceRefresh) {
    const cachedResult = getAiCache(userId, "backward_analysis", dataHash);
    if (cachedResult) {
      return cachedResult;
    }
  }

  try {
    const prompt = `
      As a financial analyst, review these past financial decisions:
      
      ${JSON.stringify(historicalDecisions)}
      
      Please provide:
      1. Analysis of what would have happened if these decisions were different
      2. Compare actual returns with potential alternative investments
      3. Lessons to learn from these past decisions
      4. Recommendations for similar future decisions
      
      Format your response in clear sections with:
      - Use ## for main section headers
      - Use ### for subsection headers
      - Add blank lines between paragraphs and sections
      - Use bullet points (- ) for listing items
      - Bold important figures or key points using **text**
      - Use tables for comparing investment options or returns
      - Highlight critical advice using > for blockquotes
      
      Make the layout spacious and easy to read with clear visual separation between sections.
      Focus on Indian financial context, including Nifty/Sensex performance, real estate trends, FD rates, etc.
    `;

    const analysis = await generateAIResponse({
      prompt,
      model: GEMINI_MODELS.DEFAULT,
      systemInstruction: "You are a quantitative financial analyst performing retrospective decision audits.",
    });

    if (analysis && typeof analysis === "string" && !analysis.startsWith("Sorry, I couldn't")) {
      setAiCache(userId, "backward_analysis", dataHash, analysis, {
        category: "backward_analysis",
        generatedAt: new Date().toISOString()
      });
    }

    return analysis;
  } catch (error) {
    console.error("Error getting backward analysis:", error);
    return "Sorry, I couldn't analyze these past decisions at this moment. Please try again later.";
  }
}

/**
 * Answers a custom user financial question with context from their financial profile with caching.
 * 
 * @param {string} customPrompt - Question entered by the user.
 * @param {Object} finances - User's financial profile data.
 * @param {Object} [options={}] - Options object.
 * @param {string} [options.userId] - Current authenticated user ID.
 * @param {boolean} [options.forceRefresh=false] - Force regenerate.
 * @returns {Promise<string>} Markdown formatted answer.
 */
export async function askFinancialQuestion(customPrompt, finances = {}, options = {}) {
  const { userId = "guest", forceRefresh = false } = options;
  const dataHash = computeQuestionHash(customPrompt, finances);

  if (!forceRefresh) {
    const cachedResult = getAiCache(userId, "custom_question", dataHash);
    if (cachedResult) {
      return cachedResult;
    }
  }

  try {
    const totalIncome = finances?.income
      ? Object.values(finances.income).reduce((sum, val) => sum + parseFloat(val || 0), 0)
      : 0;

    const totalFixed = finances?.fixedExpenses
      ? Object.values(finances.fixedExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0)
      : 0;

    const totalVariable = finances?.variableExpenses
      ? Object.values(finances.variableExpenses).reduce((sum, val) => sum + parseFloat(val || 0), 0)
      : 0;

    const prompt = `
      As a financial advisor, answer the following question from a user with this financial profile:
      
      Monthly Income: ₹${totalIncome}
      Fixed Expenses: ₹${totalFixed}
      Variable Expenses: ₹${totalVariable}
      Investments: ${JSON.stringify(finances?.investments || {})}
      Loans: ${JSON.stringify(finances?.loans || {})}
      
      User's question: "${customPrompt}"
      
      Provide a detailed, helpful response focused on Indian financial context.
      
      Format your response in clear sections with:
      - Use ## for main section headers
      - Use ### for subsection headers
      - Add blank lines between paragraphs and sections
      - Use bullet points (- ) for listing items
      - Bold important figures or key points using **text**
      - Use tables for numeric data if applicable
      - Highlight critical advice using > for blockquotes
      
      Make the layout spacious and easy to read with clear visual separation between sections.
    `;

    const answer = await generateAIResponse({
      prompt,
      model: GEMINI_MODELS.DEFAULT,
      systemInstruction: "You are a knowledgeable, friendly financial advisor providing clear and practical advice.",
    });

    if (answer && typeof answer === "string" && !answer.startsWith("Sorry, I couldn't")) {
      setAiCache(userId, "custom_question", dataHash, answer, {
        category: "custom_question",
        generatedAt: new Date().toISOString()
      });
    }

    return answer;
  } catch (error) {
    console.error("Error processing custom prompt:", error);
    return "Sorry, I couldn't process your question at this moment. Please try again later.";
  }
}