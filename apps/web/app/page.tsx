'use client';

import {
  LandingHeader,
  HeroSection,
  WhyJambaar,
  HowItWorks,
  ShowcaseProduct,
  GamificationSection,
  PricingSection,
  SocialProof,
  FAQSection,
  FinalCTA,
  LandingFooter,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingHeader />
      <main>
        <HeroSection />
        <WhyJambaar />
        <HowItWorks />
        <ShowcaseProduct />
        <GamificationSection />
        <PricingSection />
        <SocialProof />
        <FAQSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
