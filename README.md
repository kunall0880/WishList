# WishList — Every Dream Deserves a Financial Plan

<div align="center">
  <p align="center">
    <strong>"Every dream deserves a financial plan."</strong>
  </p>
  <p align="center">
    WishList is an AI-powered, goal-based financial planning platform designed to transition personal finance from generic, return-chasing investing to structured, aspiration-driven planning.
  </p>
</div>

---

## 1. Vision & Mission

### Startup Vision
To democratize institutional-grade financial planning, making sophisticated goal-based asset allocation and personalized wealth coaching accessible to every individual.

### Mission Statement
To empower users to transition from asking *"Where should I invest?"* to declaring *"What do you want to achieve in life?"*, utilizing AI to map personal milestones directly to intelligent, inflation-adjusted, and risk-optimized investment strategies.

### Key Highlights
* **Goal-First Architecture**: Financial roadmaps built around real life milestones (House, Higher Education, Retirement, Wedding, Business).
* **Dynamic Calculations**: Real-time evaluation of inflation-adjusted future costs, required SIPs, funding gaps, and success probability.
* **Intelligent Recommendations**: High-speed, cost-effective asset allocations powered by Google Gemini AI (`gemini-1.5-flash`).
* **Risk-Based Asset Management**: Proprietary multi-dimensional scoring mapping user risk parameters to targeted asset classes.

---

## 2. Table of Contents

* [1. Vision & Mission](#1-vision--mission)
* [2. Table of Contents](#2-table-of-contents)
* [3. Problem Statement](#3-problem-statement)
* [4. Solution](#4-solution)
* [5. Product Vision](#5-product-vision)
* [6. Core Features](#6-core-features)
* [7. Complete User Journey](#7-complete-user-journey)
* [8. AI Recommendation Pipeline](#8-ai-recommendation-pipeline)
* [9. Multi-Goal Optimization Flow](#9-multi-goal-optimization-flow)
* [10. System Architecture](#10-system-architecture)
* [11. Database Design (ER Diagram)](#11-database-design-er-diagram)
* [12. Folder Structure](#12-folder-structure)
* [13. Technology Stack](#13-technology-stack)
* [14. AI Calculation Engine](#14-ai-calculation-engine)
* [15. Investment Recommendation Engine](#15-investment-recommendation-engine)
* [16. Goal Success Probability Algorithm](#16-goal-success-probability-algorithm)
* [17. Financial Health Score](#17-financial-health-score)
* [18. UI Screens](#18-ui-screens)
* [19. REST API Documentation](#19-rest-api-documentation)
* [20. Security](#20-security)
* [21. Performance Optimization](#21-performance-optimization)
* [22. Sample User Story](#22-sample-user-story)
* [23. Future Scope](#23-future-scope)
* [24. Competitive Analysis](#24-competitive-analysis)
* [25. Installation Guide](#25-installation-guide)
* [26. Deployment](#26-deployment)
* [27. Contributing](#27-contributing)
* [28. License](#28-license)
* [29. Team](#29-team)
* [30. Contact](#30-contact)
* [31. Final Vision Statement](#31-final-vision-statement)

---

## 3. Problem Statement

Individual financial failures typically stem from systemic planning issues rather than return deficiencies:

* **Inflation Blindness**: Investors plan for target amounts in today's currency value, leaving their future capital severely eroded.
* **Competing Milestones**: Managing multiple concurrent goals (e.g., child's education vs. retirement) leads to cash flow conflicts and poor resource allocation.
* **Disjointed Roadmaps**: Conventional financial platforms prompt users to pick mutual funds before establishing why they are investing.
* **Literacy Gap**: Complex compounding logic, asset-liability matching, and taxation rules are difficult for the average retail investor to navigate.
* ** calculator limitations**: Traditional online calculators operate in silos, ignoring aggregate portfolio dynamics, risk parameters, and dynamic market realities.

---

## 4. Solution

WishList bridges this gap by acting as an automated, intelligent financial planner:

| Perspective | Solution Benefit |
| :--- | :--- |
| **User Perspective** | Conversational onboarding converts vague dreams into structured, mathematically backed milestones in under 60 seconds. |
| **Business Perspective** | Boosts user engagement and retention by shifting the value proposition from commoditized transactions to long-term planning relationships. |
| **Technical Perspective** | Modern, type-safe Next.js architecture utilizing serverless API endpoints, SWR data caching, and Prisma ORM schemas. |
| **AI Perspective** | Uses Google Gemini (`gemini-1.5-flash`) to parse mathematical compounding variables and generate highly contextual portfolio strategies. |

---

## 5. Product Vision

WishList is positioned to evolve into an **AI Financial Operating System**. By unifying investment ledgers, bank transactions, and goals into a singular dashboard, the platform will offer automated portfolio rebalancing, tax-loss harvesting, and real-time scenario simulation.

---

## 6. Core Features

* **AI Dream Planner**: Interactive conversational wizard to configure goals with minimal inputs.
* **Multi-Goal Optimization**: Intelligent engine prioritizing capital allocations across multiple timelines.
* **Dynamic Compounding Calculators**: Accounts for inflation rates, salary growth indexings, and current corpuses.
* **Portfolio Allocation Engine**: Context-specific mapping to low-cost indices, debt, and liquid instruments.
* **Risk Profiling Quiz**: 5-question multi-dimensional assessment evaluating cognitive and capacity thresholds.
* **What-If Simulator**: Real-time slider adjusting timeline, risk appetite, and contributions with instant feedback.
* **Exporter**: Compiles detailed Excel ledgers and PDF performance sheets for external use.
* **Dark Mode & Responsive UI**: Curated CRED-style visuals, smooth Framer Motion animations, and custom mobile tab layouts.

---

## 7. Complete User Journey

```mermaid
flowchart TD
    A[User Landing Page] -->|Register / Google Sign-in| B[Auth Verification]
    B -->|Access Dashboard| C[Dashboard Portal]
    C -->|Trigger Wizard| D[Goal Creation Wizard]
    D -->|Define Life Target & Timeframe| E[Financial Inputs]
    E -->|Interactive Compounding| F[Inflation Engine]
    F -->|Derive Required SIP / Lumpsum| G[Calculations Engine]
    G -->|Context Parameters Passed| H[Gemini AI Advisor]
    H -->|Portfolios & Allocations Map| I[AI Recommendations Page]
    I -->|Save and Commit| J[Saved to Database]
    J -->|Real-time Tracking| K[Dashboard Progress View]
    K -->|Monitor & Adjust| L[What-if Simulator]
    K -->|Generate Reports| M[PDF/Excel Exports]
    K -->|Target Achieved| N[Goal Accomplishment]
```

---

## 8. AI Recommendation Pipeline

```mermaid
flowchart TD
    A[User Inputs Aspiration] --> B[Goal Parameter Analysis]
    B --> C[Compounding Engine Evaluates Target]
    C --> D[Inflation Adjustments applied]
    D --> E[Derive Future Capital Target]
    E --> F[Risk Profile Integration]
    F --> G[Asset Class Percentage Split]
    G --> H[Gemini Prompt Injection]
    H --> I[Structured JSON Strategy Output]
    I --> J[Validate Allocations & Constraints]
    J --> K[Update Client Store / Database]
```

---

## 9. Multi-Goal Optimization Flow

```mermaid
graph TD
    A[Aggregate Monthly Surplus] --> B{Goal Priority Matrix}
    B -->|High Priority| C[Essential Goals: Retirement, Emergency]
    B -->|Medium Priority| D[Target Milestones: House, Education]
    B -->|Low Priority| E[Lifestyle: Travel, Gadgets]
    
    C --> F[Allocate Required SIPs First]
    D --> G[Allocate Remaining Budget]
    E --> H[Sip Spillover Allocations]
    
    F --> I[Consolidated Investment Plan]
    G --> I
    H --> I
```

---

## 10. System Architecture

```mermaid
graph GT
    subgraph "Client Tier (Next.js SPA)"
        UI["Tailwind CSS UI Component Layer"]
        FM["Framer Motion Transitions"]
        SWR["SWR Data Fetching"]
        ZS["Zustand Client Store"]
    end

    subgraph "API Gateway & Routing"
        NEXTAUTH["NextAuth.js Router Wrapper"]
        MIDDLEWARE["API Middleware (Auth Protection)"]
    end

    subgraph "Serverless Calculation Tier"
        CALC["Stateless Financial Calculator"]
        AI_ENG["Gemini AI Recommendation Router"]
    end

    subgraph "Database & Storage"
        PRISMA["Prisma ORM Client Singleton"]
        DB[(PostgreSQL Database)]
    end

    UI -->|JSON Requests| NEXTAUTH
    NEXTAUTH --> MIDDLEWARE
    MIDDLEWARE --> CALC
    MIDDLEWARE --> AI_ENG
    AI_ENG -->|Prompt Query| GEMINI["Google AI (gemini-1.5-flash)"]
    CALC --> PRISMA
    AI_ENG --> PRISMA
    PRISMA --> DB
```

---

## 11. Database Design (ER Diagram)

```mermaid
erDiagram
    USER ||--o{ ACCOUNT : owns
    USER ||--o{ SESSION : has
    USER ||--o{ GOAL : manages
    USER {
        string id PK
        string name
        string email UK
        string image
        string plan
        datetime createdAt
    }
    GOAL {
        string id PK
        string userId FK
        string name
        string type
        string emoji
        datetime targetDate
        float targetAmountToday
        float inflationRate
        float currentCorpus
        float currentSIP
        float lumpSumAvailable
        string riskAppetite
        int priority
        string status
        json aiInsights
        datetime createdAt
    }
    ACCOUNT {
        string id PK
        string userId FK
        string provider
        string providerAccountId
        string type
    }
    SESSION {
        string id PK
        string userId FK
        string sessionToken UK
        datetime expires
    }
```

---

## 12. Folder Structure

```
WishList/
├── app/
│   ├── (auth)/                  # Onboarding split-screen authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/             # Protected dashboard workflows
│   │   ├── dashboard/
│   │   ├── goals/
│   │   │   ├── [id]/
│   │   │   └── new/
│   │   ├── portfolio/
│   │   ├── reports/
│   │   ├── settings/
│   │   ├── simulator/
│   │   └── layout.tsx
│   ├── api/                     # Backend API routes
│   │   ├── ai/recommend/
│   │   ├── calculate/
│   │   ├── goals/
│   │   └── user/profile/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── charts/                  # Custom dynamic Recharts configurations
│   ├── dashboard/               # Metric panels and AI insight templates
│   ├── landing/                 # Visual product landing page components
│   └── shared/                  # Reusable UI layout elements
├── lib/
│   ├── auth.ts                  # NextAuth credentials singleton
│   ├── prisma.ts                # Database query singleton configurations
│   ├── financial-engine.ts      # Pure mathematical personal finance equations
│   ├── ai-prompts.ts            # Dynamic system instruction prompt builders
│   └── utils.ts
├── store/
│   └── useGoalStore.ts          # Zustand clientside state store fallbacks
├── types/
│   └── index.ts                 # Central TypeScript interfaces
├── prisma/
│   └── schema.prisma            # Relational database mappings
├── .env.local                   # API keys and local databases configuration
└── package.json
```

---

## 13. Technology Stack

* **Next.js 14 (App Router)**: Enables seamless serverless API integrations and static-site generation.
* **React 18 & TypeScript**: Ensures high type-safety across critical financial calculations.
* **Tailwind CSS**: Delivers modern, responsive CRED-style layouts.
* **Prisma ORM**: Provides clean database schema definitions and query mapping.
* **NextAuth.js v5 (Beta)**: Handles OAuth and secure session tokens.
* **Google Gemini AI SDK**: Connects with `gemini-1.5-flash` to generate investment strategies.
* **Framer Motion**: powers micro-interactions and transitions.
* **Recharts**: Builds responsive timeline metrics and portfolio allocation displays.
* **Zustand**: Provides robust client-side storage fallbacks.

---

## 14. AI Calculation Engine

Personal finance math is calculated via pure functions in [financial-engine.ts](file:///c:/Users/User/Desktop/Projects/P-1/lib/financial-engine.ts):

### Future Value (Inflation-Adjusted)
Calculates the target capital required in the future, adjusting today's price by the inflation rate:

$$FV = PV \times (1 + r_{inf})^{n}$$

Where:
* $FV$ = Future Value
* $PV$ = Present Value (target cost today)
* $r_{inf}$ = Annual inflation rate (e.g., $0.06$)
* $n$ = Time horizon in years

### Required Systematic Investment Plan (SIP)
Determines the monthly contribution required to reach the Future Value, accounting for compound growth:

$$PMT = \frac{FV - PV_{start} \times (1 + i)^{m}}{\frac{(1 + i)^{m} - 1}{i} \times (1 + i)}$$

Where:
* $PMT$ = Required monthly SIP
* $FV$ = Target Future Value
* $PV_{start}$ = Current available corpus
* $i$ = Monthly interest rate ($r_{annual} / 12$)
* $m$ = Total investment horizon in months ($n \times 12$)

---

## 15. Investment Recommendation Engine

We map the time horizon and risk parameters to a selection of low-cost domestic and global asset classes:

| Time Horizon | Suggested Instrument | Expected Return | Risk Profile | Liquidity | Taxation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **< 6 Months** | Liquid Mutual Funds | 5.5% – 6.5% | Very Low | T+1 | Slab Rate (Short-Term Debt) |
| **6M – 1Y** | Ultra Short Debt Funds | 6.0% – 7.2% | Low | T+1 | Slab Rate (Short-Term Debt) |
| **1Y – 3Y** | Arbitrage / Conservative Hybrid | 7.0% – 8.5% | Low-Moderate | T+2 | Equity Taxation / Slab Rate |
| **3Y – 5Y** | Balanced Advantage / Corporate Bond | 9.0% – 11.5% | Moderate | T+2 | Debt taxation rules apply |
| **5Y – 7Y** | Nifty 50 Index / Flexicap Mutual Funds | 11.0% – 13.0% | High | T+3 | 10% LTCG on Equity (>₹1.25L) |
| **> 7Y** | Midcap / International Equity ETFs | 13.0% – 16.0% | Very High | Market Hours | 10% LTCG on Equity (>₹1.25L) |

---

## 16. Goal Success Probability Algorithm

WishList estimates the likelihood of a goal's success using a weighted scoring model:

$$SP = \min\left(100, \left( \frac{Current\_SIP}{Required\_SIP} \times 0.6 \right) + \left( \frac{Current\_Corpus}{Future\_Value} \times 0.4 \right) \times 100\right)$$

### Sample Calculation
A user target is $FV = \text{₹}1,000,000$, requiring a SIP of $\text{₹}15,000$/month.
* Current SIP: $\text{₹}10,000$/month
* Current Corpus: $\text{₹}200,000$

$$SP_{SIP\_Ratio} = \frac{10,000}{15,000} \times 0.6 = 0.40 \quad (40\%)$$

$$SP_{Corpus\_Ratio} = \frac{200,000}{1,000,000} \times 0.4 = 0.08 \quad (8\%)$$

$$\text{Goal Success Probability} = (0.40 + 0.08) \times 100 = 48\%$$

---

## 17. Financial Health Score

Computed on a scale of 0 to 100 based on the following key metrics:

| Metric | Score Weight | Formula / Target |
| :--- | :--- | :--- |
| **Savings Ratio** | 25 Points | $(Monthly\ Surplus / Net\ Income) \times 100$ (Target > 30%) |
| **Emergency Buffer** | 25 Points | $Current\ Liquidity / (6 \times Monthly\ Expenses)$ (Target $\ge$ 1.0) |
| **Portfolio Diversification** | 20 Points | Allocation spread across Equity, Debt, Gold (Target $\ge$ 3 distinct assets) |
| **Investment Consistency** | 15 Points | Count of consistent monthly SIP transactions |
| **Goal Progress Index** | 15 Points | Weighted success probability across all active goals |

---

## 18. UI Screens

* **Landing Page**: Implements dynamic entrance headers, structural statistics, interactive CTA registers, and test lists.
* **Dashboard**: Displays consolidated assets, total required SIP, allocation charts, and high-impact AI tips.
* **Goal Wizard**: Interactive 4-step wizard with real-time calculator previews and risk appetite evaluations.
* **Analytics & Reports**: Visualizes timelines and enables PDF/Excel CSV summary sheets compiling.
* **Simulator**: Single/Compare tabs adjusting timelines and returns against target breakpoints.

---

## 19. REST API Documentation

### Create a Goal
* **URL**: `/api/goals`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Payload**:
```json
{
  "name": "Europe Trip",
  "type": "TRAVEL",
  "emoji": "✈️",
  "targetDate": "2030-06-01",
  "targetAmountToday": 500000,
  "inflationRate": 6,
  "currentCorpus": 50000,
  "currentSIP": 5000,
  "riskAppetite": "BALANCED",
  "priority": 4
}
```
* **Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "goal_id_123",
    "name": "Europe Trip",
    "status": "ON_TRACK",
    "calculations": {
      "futureValue": 631238,
      "requiredSIP": 8200,
      "fundingGap": 3200,
      "successProbability": 72
    }
  }
}
```

---

## 20. Security

* **JWT Verification**: Implemented secure JSON Web Tokens with strict expiry flags.
* **OAuth Integrity**: Encrypted Google Client authentication configurations.
* **Relational Schemas**: Type-safe query formatting via Prisma ORM prevents SQL injection.
* **Input Sanitization**: Client/Server schema checks via Zod prevent XSS payloads.
* **API Rate Limiting**: Next.js route configurations restrict high-frequency API endpoints.

---

## 21. Performance Optimization

* **SSR & Static Generation**: Next.js App Router renders structural pages server-side for fast loading.
* **Dynamic Import Compilations**: Charts are dynamically imported (`ssr: false`) to optimize bundle sizes.
* **Request Cache Memoization**: SWR caches API responses to prevent duplicate calls.
* **Query Optimization**: Prisma database targets use indexing keys for quick record retrieval.

---

## 22. Sample User Story

### Goal: Europe Trip in 4 Years
* **Today's Cost**: $\text{₹}400,000$
* **Target Timeline**: 4 Years ($n = 4$, $m = 48\text{ months}$)
* **Inflation Rate**: 6% per annum
* **Current Savings ($PV_{start}$)**: $\text{₹}50,000$
* **Monthly Savings Budget**: $\text{₹}8,000$/month
* **Risk Profile**: Balanced (Target CAGR = 10%)

### Step-by-Step AI Calculations
1. **Future Value Cost Calculation**:

   $$FV = 400,000 \times (1 + 0.06)^{4} = \text{₹}504,990$$

2. **Required SIP Calculation**:

   $$PMT = \frac{504,990 - 50,000 \times (1 + 0.00833)^{48}}{\frac{(1 + 0.00833)^{48} - 1}{0.00833} \times (1 + 0.00833)} = \text{₹}7,220\text{/month}$$

3. **Goal Feasibility Check**:
   * Required Monthly SIP ($\text{₹}7,220$) is less than the user's Monthly Savings Budget ($\text{₹}8,000$).
   * **Result**: **ON_TRACK** (Success Probability = **92%**).
4. **Gemini Recommended Asset Mix**:
   * Equity: 60% (Parag Parikh Flexi Cap Fund)
   * Debt: 30% (HDFC Short Term Bond Fund)
   * Cash/Gold: 10% (Sovereign Gold Bonds)

---

## 23. Future Scope

* **Open Banking integrations**: Connect live bank accounts via AA (Account Aggregator) frameworks.
* **Automated portfolio tracking**: Track real-time mutual fund NAV updates.
* **Credit & Debt optimizations**: Smart models prioritizing debt repayment over low-interest investments.
* **Estates & Wills**: Automated succession models for multi-generational wealth preservation.

---

## 24. Competitive Analysis

Traditional calculators handle only simple compounding math. Conventional mutual fund distribution apps prioritize high-expense commissions. WishList changes this by placing the user's specific life goals first, optimizing allocations dynamically using generative AI.

---

## 25. Installation Guide

### Prerequisites
* Node.js v18 or later
* Git

### Step-by-Step Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/wishlist.git
   cd wishlist
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/wishlist?schema=public"
   NEXTAUTH_SECRET="your_nextauth_secret_here"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   RESEND_API_KEY="your_resend_api_key"
   GEMINI_API_KEY="your_google_gemini_api_key"
   ```
4. **Generate Prisma Client & Sync Database**:
   ```bash
   npx prisma generate
   ```
5. **Run the Application**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it.

---

## 26. Deployment

* **Vercel**: Recommended for fast hosting. Deploy instantly using the Next.js preset.
* **Docker**: Build the production image:
  ```bash
  docker build -t wishlist-app .
  ```

---

## 27. Contributing

Please read [CONTRIBUTING.md](file:///c:/Users/User/Desktop/Projects/P-1/CONTRIBUTING.md) before submitting Pull Requests. Follow the standard Git branching model and ensure all lint/build checks pass.

---

## 28. License

This project is licensed under the MIT License. See [LICENSE](file:///c:/Users/User/Desktop/Projects/P-1/LICENSE) for details.

---

## 29. Team

* **System Architect**: [Placeholder]
* **Product Manager**: [Placeholder]
* **UX/UI Engineer**: [Placeholder]

---

## 30. Contact

* **Website**: [http://wishlist-fintech.example.com](http://wishlist-fintech.example.com)
* **GitHub**: [https://github.com/wishlist-labs](https://github.com/wishlist-labs)
* **Email**: support@wishlist-fintech.example.com

---

## 31. Final Vision Statement

**WishList is not just a financial planner—it is an AI-powered life planning platform that transforms aspirations into actionable financial roadmaps. By combining artificial intelligence, financial intelligence, and goal-based investing, WishList empowers every individual to plan smarter, invest better, and turn every wish into reality.**
