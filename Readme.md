# FinSage AI - Personal Finance Assistant



**Live Demo:** [https://finsage-ai.vercel.app/](https://finsage-ai.vercel.app/)

## Overview

FinSage AI is a comprehensive personal finance management application powered by AI that helps users track their income, expenses, investments, and loans. It provides personalized financial advice, spending analysis, and scenario planning to make informed financial decisions.

## Features

### 1. Dashboard
- Overview of financial health with key metrics
- Monthly income and expense distribution
- Investment allocation visualization
- Personalized AI-powered financial advice

### 2. Financial Input
- Track multiple income sources
- Monitor fixed and variable expenses
- Manage investments across various asset classes
- Keep track of different types of loans

### 3. AI Financial Advisor
- Get personalized financial advice based on your financial profile
- Analyze spending patterns and receive optimization suggestions
- Ask custom financial questions and receive AI-powered answers
- Simulate "what-if" scenarios for career changes, investment strategies, and major purchases
- Analyze past financial decisions to learn and improve future choices

### 4. Analytics
- Detailed breakdown of income sources and expense categories
- Financial health indicators including savings rate and debt-to-income ratio
- Transaction history analysis
- Monthly spending trends

### 5. Scenario Planning
- Career change impact simulation
- Investment strategy comparison
- Major purchase affordability analysis

### 6. User Profile
- Manage personal information
- Set financial preferences and goals
- Track your financial progress

## Technologies Used

- **Frontend**: React.js, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **AI Integration**: Google Gemini AI (via Generative AI API)
- **Charting**: Chart.js, react-chartjs-2
- **Routing**: React Router
- **Styling**: Tailwind CSS with custom components
- **Deployment**: Vercel

## Project Structure

```
fin_service/
├── src/
│   ├── components/     # UI components
│   │   ├── aiadvisor/  # AI advisor components
│   │   ├── analytics/  # Analytics page components
│   │   ├── auth/       # Authentication components
│   │   ├── common/     # Common UI elements
│   │   ├── dashboard/  # Dashboard components
│   │   ├── finances/   # Financial input components
│   │   ├── scenarios/  # Scenario planning components
│   │   └── ui/         # Core UI components
│   ├── context/        # React context providers
│   ├── firebase/       # Firebase configuration
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   ├── pages/          # Main application pages
│   ├── services/       # AI and other service integrations
│   └── utils/          # Utility functions
```

## Key AI Features

- **Financial Health Analysis**: Get an AI assessment of your current financial situation
- **Spending Pattern Recognition**: Identify areas where you might be overspending
- **Custom Financial Q&A**: Ask specific questions about your finances
- **Scenario Simulation**: See the potential outcomes of different financial decisions
- **Investment Recommendations**: Receive personalized investment advice based on your risk profile
- **Expense Optimization**: Find opportunities to reduce expenses and increase savings

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account (for backend functionality)
- Google AI API key (for AI features)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/finsage-ai.git
   cd finsage-ai
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase and Google AI credentials
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## Deployment

The application is deployed on Vercel. For deployment:

1. Connect your GitHub repository to Vercel
2. Configure the environment variables in Vercel dashboard
3. Deploy using the Vercel dashboard or CLI

## Firebase Setup

1. Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Set up Firestore security rules
5. Add your Firebase configuration to the `.env` file

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Firebase](https://firebase.google.com/)
- [Google Generative AI](https://ai.google.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Chart.js](https://www.chartjs.org/)
- [Vercel](https://vercel.com/)
