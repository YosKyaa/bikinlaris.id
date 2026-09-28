import { ClosingCtaSection } from "@/components/organisms/landing/closing-cta-section";
import { CredibilitySection } from "@/components/organisms/landing/credibility-section";
import { FaqSection } from "@/components/organisms/landing/faq-section";
import { HERO_ID, HeroSection } from "@/components/organisms/landing/hero-section";
import { HowItWorksSection } from "@/components/organisms/landing/how-it-works-section";
import { ProblemSection } from "@/components/organisms/landing/problem-section";
import { SopPackPreviewSection } from "@/components/organisms/landing/sop-pack-preview-section";
import { StickyCtaBar } from "@/components/organisms/landing/sticky-cta-bar";
import { TryItSection } from "@/components/organisms/landing/try-it-section";
import { MarketingLayout } from "@/components/templates/marketing-layout";

/** Landing page (AIDA). TestimonialSection exists but stays unrendered until real quotes exist. */
export default function LandingPage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <TryItSection />
      <SopPackPreviewSection />
      <CredibilitySection />
      <FaqSection />
      <ClosingCtaSection />
      <StickyCtaBar heroId={HERO_ID} />
    </MarketingLayout>
  );
}
