import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Is my financial data safe and private?",
    a: "Absolutely. FinSage AI is designed in full compliance with India's Digital Personal Data Protection (DPDP) Act, 2023. All data is encrypted using 256-bit AES cryptographic standards. We never sell, monetize, or share your data with third-party banks, lenders, or insurance brokers."
  },
  {
    q: "Do I need to link my bank account or share passwords?",
    a: "No! FinSage AI is non-intrusive. You never have to share net banking passwords, OTPs, or give screen-scraping access. You simply input your monthly numbers and portfolio holdings in under 2 minutes."
  },
  {
    q: "How does the AI optimize Old vs New Tax Regimes?",
    a: "Our AI engine audits your salary deductions (Section 80C, 80CCD NPS, 80D health insurance, 24b home loan interest, HRA) and compares your total taxable liability under both the Old and New Tax Regimes, pinpointing exact net tax savings in Rupees."
  },
  {
    q: "What Indian investment instruments are supported?",
    a: "We natively support Public Provident Fund (PPF), National Pension Scheme (NPS Tier 1 & Tier 2), Mutual Funds (SIP & Lumpsum), Sovereign Gold Bonds (SGB), Sukanya Samriddhi Yojana (SSY), Fixed Deposits (FD/RD), Equity Shares, and Indian Home/Personal Loans."
  },
  {
    q: "How does the 'What-If' Scenario simulator work?",
    a: "The What-If engine lets you model life milestones like getting a 30% salary hike, taking a ₹60L home loan, or planning early retirement (FIRE). It projects your net worth over 5, 10, and 20 years, factoring in compounding, loan EMIs, and tax rebates."
  },
  {
    q: "Is FinSage AI free to get started?",
    a: "Yes! You can create your account, map your finances, run what-if simulations, and interact with the AI Advisor completely free."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card border border-border/80 text-foreground text-xs font-semibold uppercase tracking-wider mb-4 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            Everything you need to know about FinSage AI, security, and Indian tax planning.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-border/80 bg-card shadow-2xs overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  className="w-full py-4.5 px-6 flex items-center justify-between text-left font-semibold text-foreground transition-colors cursor-pointer"
                >
                  <span className="text-base sm:text-lg pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-foreground" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-muted-foreground leading-relaxed border-t border-border/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
