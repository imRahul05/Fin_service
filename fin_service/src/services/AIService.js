import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY);

export async function getFinancialAdvice(financialData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      As a financial advisor, provide personalized advice based on the following financial information:
      
      Monthly Income: ₹${financialData.income}
      Fixed Expenses: ₹${financialData.fixedExpenses}
      Variable Expenses: ₹${financialData.variableExpenses}
      Investments: ${JSON.stringify(financialData.investments)}
      Loans: ${JSON.stringify(financialData.loans)}
      
      Financial Goals: ${financialData.goals || "Not specified"}
      
      Please provide:
      1. A brief analysis of current financial health
      2. 3-5 specific actionable recommendations for improvement
      3. Potential investment opportunities considering Indian market conditions
      4. Suggestions for expense optimization
      
      Format your response in clear sections with bullet points where appropriate.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting AI financial advice:", error);
    return "Sorry, I couldn't generate financial advice at this moment. Please try again later.";
  }
}

export async function simulateScenario(currentData, scenarioParams) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
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
      
      Please focus on realistic outcomes relevant to the Indian financial context.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error simulating financial scenario:", error);
    return "Sorry, I couldn't simulate this scenario at this moment. Please try again later.";
  }
}

export async function analyzeSpendingBehavior(transactions) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      As a spending behavior analyst, review these transactions:
      
      ${JSON.stringify(transactions)}
      
      Please provide:
      1. Key spending patterns and categories breakdown
      2. Unusual or inefficient spending patterns
      3. 3-5 specific recommendations for saving money
      4. Categorize spending into essential vs non-essential
      
      Consider Indian context and local spending categories like UPI, e-commerce, etc.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing spending behavior:", error);
    return "Sorry, I couldn't analyze your spending behavior at this moment. Please try again later.";
  }
}

export async function getBackwardAnalysis(historicalDecisions) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      As a financial analyst, review these past financial decisions:
      
      ${JSON.stringify(historicalDecisions)}
      
      Please provide:
      1. Analysis of what would have happened if these decisions were different
      2. Compare actual returns with potential alternative investments
      3. Lessons to learn from these past decisions
      4. Recommendations for similar future decisions
      
      Focus on Indian financial context, including Nifty/Sensex performance, real estate trends, FD rates, etc.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting backward analysis:", error);
    return "Sorry, I couldn't analyze these past decisions at this moment. Please try again later.";
  }
}