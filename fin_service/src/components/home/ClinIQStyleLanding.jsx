import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRight,
  ArrowDown,
  Bot,
  Sparkles,
  GitBranch,
  Activity,
  ShieldCheck,
  Check,
  ChevronDown,
  Lock,
  Wallet,
  FileCheck,
  Headphones,
  TrendingUp,
} from "lucide-react";
const WORKSPACES = [
  {
    id: "advisor",
    name: "AI Financial Advisor",
    badge: "Gemini 2.5 Copilot",
    icon: Bot,
    title: "A 24/7 fiduciary strategist in your pocket.",
    description:
      "Get unbiased, personalized financial counsel for Indian tax regimes (80C, 80D, 80CCD), debt avalanche paydown, and real-time cashflow optimization.",
    features: [
      "Old vs New Tax Regime optimization",
      "Debt avalanche & snowball paydown schedules",
      "Real-time conversational financial Q&A",
      "Automated spending leak recommendations"
    ],
    ctaText: "Open AI Advisor",
    ctaLink: "/advisor"
  },
  {
    id: "scenarios",
    name: "What-If Scenarios",
    badge: "Life Simulator",
    icon: GitBranch,
    title: "Stress-test life decisions before spending.",
    description:
      "Simulate major career shifts, home purchase affordability, and early retirement (FIRE) trajectories with inflation-adjusted compounding math.",
    features: [
      "Career change & salary hike projection",
      "Home loan prepayment vs Nifty 50 SIP",
      "Major purchase EMI affordability test",
      "FIRE corpus & 4% safe withdrawal runway"
    ],
    ctaText: "Run Scenario Simulations",
    ctaLink: "/scenarios"
  },
  {
    id: "analytics",
    name: "Analytics & Radar",
    badge: "Intelligence Layer",
    icon: Activity,
    title: "Total visibility into every rupee flowing.",
    description:
      "Deep categorical breakdowns, savings velocity metrics, and an autonomous subscription radar that pinpoints recurring silent cashflow leaks.",
    features: [
      "Dormant OTT & subscription leak radar",
      "Monthly savings rate & debt-to-income (DTI)",
      "Categorical expense distribution curves",
      "Autonomous financial briefing summaries"
    ],
    ctaText: "Inspect Analytics",
    ctaLink: "/analytics"
  },
  {
    id: "dashboard",
    name: "Portfolio & FinScore",
    badge: "Balance Sheet",
    icon: Wallet,
    title: "Your single source of financial truth.",
    description:
      "Consolidate your liquid savings, mutual funds, EPF/PPF, loans, and assets into an actionable 1,000-point Financial Resilience Score.",
    features: [
      "Comprehensive 1,000-point FinScore gauge",
      "Liquid net worth & asset allocation view",
      "Active loan amortizations & debt balances",
      "One-click smart financial ledger updates"
    ],
    ctaText: "View Dashboard",
    ctaLink: "/dashboard"
  }
];

const FAQS = [
  {
    question: "What exactly does FinSage offer?",
    answer:
      "FinSage is a focused personal finance suite tailored for Indian professionals. It offers 4 unified workspaces: an ambient AI Financial Copilot (Gemini-powered), What-If life scenario modeling (FIRE, career, home loans), autonomous leak and subscription detection, and a consolidated portfolio ledger with a 1,000-point Financial Resilience Score."
  },
  {
    question: "How does the AI Financial Advisor work?",
    answer:
      "The advisor leverages Google Gemini combined with Indian tax and financial logic. It analyzes your income, expenses, and liabilities to answer complex questions—such as whether to prepay a home loan or invest in SIP, or which tax regime saves you the most money under Section 80C and 80CCD(1B)."
  },
  {
    question: "Can I simulate scenarios without entering private data?",
    answer:
      "Yes. You can explore the What-If Scenarios workspace and sample simulations immediately in guest mode without linking bank accounts or committing sensitive personal information."
  },
  {
    question: "How is my financial information secured?",
    answer:
      "Your records are 100% user-owned and stored securely with Firebase Authentication and strict role-based Firestore rules. FinSage never sells your data to brokers, insurance aggregators, or third-party advertisers."
  }
];

export default function ClinIQStyleLanding() {
  const { currentUser } = useAuth();
  const [activeWorkspace, setActiveWorkspace] = useState(WORKSPACES[0]);
  const [mobileHeroTab, setMobileHeroTab] = useState("query");
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* HERO SECTION */}
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="max-w-3xl">
            {/* Tagline pill */}
            <span className="inline-flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground"></span>
              Indian Wealth Architecture + Ambient AI
            </span>

            {/* Headline */}
            <h1 className="mt-7 max-w-3xl text-balance font-sans text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-7xl lg:text-[88px]">
              Financial clarity, <span className="text-muted-foreground">simplified.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Built specifically for Indian financial realities. FinSage coordinates your taxes,
              PPF, NPS, mutual funds, and loans with ambient Gemini intelligence and real-time life
              scenario simulations.
            </p>

            {/* CTA buttons */}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to={currentUser ? "/dashboard" : "/register"}
                className="group inline-flex items-center gap-3 bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                {currentUser ? "Open Dashboard" : "Start Free"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#workspaces"
                className="inline-flex items-center gap-3 border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Explore workspaces
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* DUAL-PANE HERO MODEL CARD (Directly from ClinIQ) */}
          <div id="demo" className="relative mt-16 border border-border bg-card">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Financial Model
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                GEMINI 2.5 / SCENARIO 001
              </span>
            </div>

            {/* Grid panes */}
            <div className="grid md:grid-cols-[1fr_1.05fr]">
              {/* Left Col: Query & Computation */}
              <div
                className={`min-h-[300px] border-b border-border p-6 md:border-b-0 md:border-r md:p-10 ${
                  mobileHeroTab === "query" ? "block" : "hidden md:block"
                }`}
              >
                <div className="mb-12 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    01 / Active Query
                  </span>
                  <Headphones className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Waveform graphic */}
                <div className="flex h-12 items-center gap-1.5" aria-label="Audio computation waveform">
                  <span className="h-3 w-1 bg-foreground"></span>
                  <span className="h-8 w-1 bg-foreground"></span>
                  <span className="h-12 w-1 bg-foreground"></span>
                  <span className="h-6 w-1 bg-foreground"></span>
                  <span className="h-10 w-1 bg-foreground"></span>
                  <span className="h-4 w-1 bg-muted-foreground"></span>
                  <span className="h-8 w-1 bg-foreground"></span>
                  <span className="h-12 w-1 bg-foreground"></span>
                  <span className="h-5 w-1 bg-foreground"></span>
                  <span className="h-9 w-1 bg-foreground"></span>
                  <span className="h-3 w-1 bg-muted-foreground"></span>
                  <span className="h-7 w-1 bg-foreground"></span>
                  <span className="h-11 w-1 bg-foreground"></span>
                  <span className="h-5 w-1 bg-muted-foreground"></span>
                  <span className="h-8 w-1 bg-foreground"></span>
                  <span className="h-4 w-1 bg-foreground"></span>
                </div>

                <p className="mt-8 max-w-sm text-lg leading-relaxed text-foreground">
                  “Should I prepay my ₹35L home loan at 8.4% or deploy the surplus ₹25,000/month into
                  a Nifty 50 Index SIP?”
                </p>

                <div className="mt-8 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                  Evaluating tax arbitrage & compounding math in real time
                </div>
              </div>

              {/* Right Col: Structured Financial Assessment */}
              <div
                className={`min-h-[300px] p-6 md:p-10 ${
                  mobileHeroTab === "note" ? "block" : "hidden md:block"
                }`}
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    02 / Strategic Financial Note
                  </span>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="space-y-5 text-sm">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Subjective
                    </span>
                    <p className="mt-1 text-foreground">
                      Home loan interest deductible up to ₹2L under Sec 24(b). Equity SIP offers
                      historical 12.8% CAGR.
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Objective
                    </span>
                    <p className="mt-1 text-foreground">
                      Projected Net Alpha: <strong>+₹18.4 Lakhs</strong> over 15 years. Emergency
                      runway: <strong>8 months intact</strong>.
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Assessment & Plan
                    </span>
                    <p className="mt-1 text-foreground">
                      Maintain regular EMI to retain tax rebate. Channel surplus into index SIP. Review
                      tax regime at next FY.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-2 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-foreground" />
                  Verified & synchronized to personal balance sheet
                </div>
              </div>
            </div>

            {/* Mobile Tab Toggle */}
            <div className="flex border-t border-border md:hidden">
              <button
                type="button"
                onClick={() => setMobileHeroTab("query")}
                className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                  mobileHeroTab === "query"
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                Active Query
              </button>
              <button
                type="button"
                onClick={() => setMobileHeroTab("note")}
                className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                  mobileHeroTab === "note"
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                Strategic Note
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 01: THE FOUNDATION */}
        <section id="how-it-works" className="border-y border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>01</span>
              <span className="h-px w-8 bg-border"></span>
              The Foundation
            </div>

            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
              <div>
                <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                  Three layers.
                  <br />
                  <span className="text-muted-foreground">One trusted record.</span>
                </h2>
                <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
                  Accurate tracking at the core. Ambient intelligence where it helps. Mathematical
                  guardrails before you allocate capital.
                </p>
              </div>

              {/* Numbered 3-Item List */}
              <div className="divide-y divide-border border-y border-border">
                <div className="group py-6">
                  <div className="flex items-start gap-5">
                    <span className="font-mono text-xs text-muted-foreground">01</span>
                    <div>
                      <h3 className="text-lg font-medium">The Ledger — Unified Financial Input</h3>
                      <p className="mt-2 max-w-lg leading-relaxed text-muted-foreground">
                        Consolidate salary, freelance income, fixed rent/EMIs, variable costs, mutual
                        funds, PPF, and loans into a structured, real-time ledger.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group py-6">
                  <div className="flex items-start gap-5">
                    <span className="font-mono text-xs text-muted-foreground">02</span>
                    <div>
                      <h3 className="text-lg font-medium">The Intelligence — Gemini Financial Copilot</h3>
                      <p className="mt-2 max-w-lg leading-relaxed text-muted-foreground">
                        Ambient voice and chat advisor calculating Section 80C vs New Regime tax
                        savings, debt avalanche payoffs, and personalized savings advice.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group py-6">
                  <div className="flex items-start gap-5">
                    <span className="font-mono text-xs text-muted-foreground">03</span>
                    <div>
                      <h3 className="text-lg font-medium">The Safety Net — What-If Simulator</h3>
                      <p className="mt-2 max-w-lg leading-relaxed text-muted-foreground">
                        Compound growth and life milestone projections ensuring your emergency runway
                        and FIRE milestones are fully safeguarded.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02: FOUR UNIFIED WORKSPACES (The Signature ClinIQ Card Design) */}
        <section id="workspaces" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>02</span>
            <span className="h-px w-8 bg-border"></span>
            Four Unified Workspaces
          </div>

          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
            <div>
              <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                The right workspace
                <br />
                <span className="text-muted-foreground">for every financial goal.</span>
              </h2>

              {/* Vertical selector buttons */}
              <div className="mt-10 flex flex-wrap gap-2 lg:flex-col lg:items-start">
                {WORKSPACES.map((workspace) => {
                  const Icon = workspace.icon;
                  const isActive = activeWorkspace.id === workspace.id;
                  return (
                    <button
                      key={workspace.id}
                      type="button"
                      onClick={() => setActiveWorkspace(workspace)}
                      className={`inline-flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer w-full text-left ${
                        isActive
                          ? "bg-foreground text-background font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{workspace.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Signature Portal Card */}
            <div className="border border-border p-7 sm:p-10 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <activeWorkspace.icon className="h-6 w-6 text-foreground mb-8" />
                  <h3 className="text-2xl sm:text-3xl font-medium tracking-[-0.04em] text-foreground">
                    {activeWorkspace.title}
                  </h3>
                  <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
                    {activeWorkspace.description}
                  </p>
                </div>
              </div>

              {/* 2-Column Checklist */}
              <div className="mt-10 grid gap-0 border-t border-border sm:grid-cols-2">
                {activeWorkspace.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 border-b border-border py-4 text-sm text-foreground"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Direct Workspace Action Link */}
              <Link
                to={activeWorkspace.ctaLink}
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:underline"
              >
                <span>{activeWorkspace.ctaText}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 03: WHY FINSAGE (Signature 1px hairline border grid) */}
        <section id="why-finsage" className="border-y border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>03</span>
              <span className="h-px w-8 bg-border"></span>
              Why FinSage
            </div>

            {/* 1px Hairline Border Grid */}
            <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1 */}
              <div className="bg-background p-6 lg:p-7">
                <Lock className="h-5 w-5 text-foreground mb-12" />
                <h3 className="text-lg font-medium text-foreground">Zero Guesswork</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Precise math for Indian tax regimes, Section 80C, NPS 80CCD(1B), and loan
                  prepayment amortization.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-background p-6 lg:p-7">
                <Sparkles className="h-5 w-5 text-foreground mb-12" />
                <h3 className="text-lg font-medium text-foreground">Hours Saved on Spreadsheets</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Ambient AI categorizes spending, drafts financial roadmaps, and pinpoints hidden
                  drains automatically.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-background p-6 lg:p-7">
                <TrendingUp className="h-5 w-5 text-foreground mb-12" />
                <h3 className="text-lg font-medium text-foreground">What-If Life Simulator</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Model salary hikes, car purchases, or early retirement (FIRE) trajectories before
                  spending a single rupee.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-background p-6 lg:p-7">
                <ShieldCheck className="h-5 w-5 text-foreground mb-12" />
                <h3 className="text-lg font-medium text-foreground">Bank-Grade Privacy</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  100% user-owned records with Firebase authentication. Zero third-party tracking or
                  data monetization.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 04: QUESTIONS, ANSWERED (Compact Accordion) */}
        <section id="faq" className="mx-auto max-w-4xl px-5 py-20 lg:py-28">
          <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>04</span>
            <span className="h-px w-8 bg-border"></span>
            Questions, Answered
          </div>

          <h2 className="mb-12 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl text-foreground">
            Clarity is a feature.
          </h2>

          <div className="divide-y divide-border border-y border-border">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index}>
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left text-base font-medium text-foreground cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-foreground" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="max-w-2xl pb-7 pr-8 text-sm leading-relaxed text-muted-foreground animate-in fade-in duration-150">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* MINIMALIST FOOTER (ClinIQ Style) */}
      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
          <div>
            <div className="font-sans text-lg font-bold tracking-[-0.04em] text-foreground">
              FinSage
              <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-foreground align-middle"></span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Built with open precision, Indian tax compliance, and ambient financial intelligence.
            </p>
          </div>

          {/* Col 2: Core Workspaces */}
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground font-semibold mb-1">
              Workspaces
            </span>
            <Link to="/advisor" className="hover:text-foreground transition-colors">
              AI Financial Copilot
            </Link>
            <Link to="/scenarios" className="hover:text-foreground transition-colors">
              What-If Life Scenarios
            </Link>
            <Link to="/analytics" className="hover:text-foreground transition-colors">
              Spending & Leak Radar
            </Link>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Portfolio & FinScore
            </Link>
          </div>

          {/* Col 3: Legal / Platform */}
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground font-semibold mb-1">
              Platform
            </span>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              Contact & Support
            </Link>
            <span className="text-muted-foreground">DPDP Act 2023 Compliant</span>
            <span className="text-muted-foreground">Zero Third-Party Tracking</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mx-auto max-w-7xl border-t border-border px-5 py-5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 FinSage. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            System status: All models operational
          </span>
        </div>
      </footer>
    </div>
  );
}
