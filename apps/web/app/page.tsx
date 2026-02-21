'use client';

import {
  LandingHeader,
  HeroSection,
  ExplorePathsSection,
  FormationsSection,
  WhyJambaar,
  CoachesSection,
  FreePathsSection,
  LandingFooter,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="landing-page bg-white">
      <LandingHeader />
      <main>
        <HeroSection />
        <ExplorePathsSection />
        <FormationsSection />
        <WhyJambaar />
        <CoachesSection />
        <FreePathsSection />
      </main>
      <LandingFooter />
    </div>
  );
}
