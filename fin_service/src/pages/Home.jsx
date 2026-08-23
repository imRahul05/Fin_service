import HeroSection from "../components/home/HeroSection";
import WealthCalculatorWidget from "../components/home/WealthCalculatorWidget";
import BentoFeatures from "../components/home/BentoFeatures";
import ScenarioShowcase from "../components/home/ScenarioShowcase";
import HowItWorksSection from "../components/home/HowItWorksSection";
import ComparisonMatrix from "../components/home/ComparisonMatrix";
import SecurityPrivacySection from "../components/home/SecurityPrivacySection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import FAQSection from "../components/home/FAQSection";
import CtaBanner from "../components/home/CtaBanner";
import Footer from "../components/common/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-blue-600 selection:text-white">
      {/* 1. Hero Section with Live AI Scenario Preview & Health Gauge */}
      <HeroSection />

      {/* 2. Interactive Wealth & Compound Growth Simulator */}
      <WealthCalculatorWidget />

      {/* 3. Bento Grid of Core Financial Superpowers */}
      <BentoFeatures />

      {/* 4. Interactive "What-If" Life Scenarios Simulator */}
      <ScenarioShowcase />

      {/* 5. How It Works 3-Step Roadmap */}
      <HowItWorksSection />

      {/* 6. Comparison Matrix: FinSage AI vs Excel & Legacy Apps */}
      <ComparisonMatrix />

      {/* 7. DPDP Act 2023 & Security Architecture */}
      <SecurityPrivacySection />

      {/* 8. Social Proof & Verified Indian Professional Reviews */}
      <TestimonialsSection />

      {/* 9. Interactive FAQ Accordion */}
      <FAQSection />

      {/* 10. Magnetic Final CTA Banner */}
      <CtaBanner />

      {/* 11. Footer */}
      <Footer />
    </div>
  );
}

export default Home;