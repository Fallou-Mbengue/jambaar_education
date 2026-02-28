'use client';

import {
  LandingHeader,
  HeroSection,
  ExplorePathsSection,
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
        <FreePathsSection />
        <WhyJambaar />
        <CoachesSection />
      </main>
      <LandingFooter />
    </div>
  );
}
