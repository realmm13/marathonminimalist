import LandingHero from "./_components/LandingHero";
import LandingFeatures from "./_components/LandingFeatures";
import LandingTestimonials from "./_components/LandingTestimonials";
import LandingFAQ from "./_components/LandingFAQ";
import LandingPricing from "./_components/LandingPricing";
import LandingSmoothNav from "./_components/LandingSmoothNav";
import ScrollProgressIndicator from "./_components/ScrollProgressIndicator";
import InteractiveFeatureDemo from "./_components/InteractiveFeatureDemo";
import PerformanceMonitor from "./_components/PerformanceMonitor";
import LandingNewsletter from "./_components/LandingNewsletter";
import LandingCTA from "./_components/LandingCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <PerformanceMonitor />
      <ScrollProgressIndicator />
      <LandingSmoothNav />
      
      <main className="w-full">
        <section className="mt-4 min-h-[40vh] flex items-center pb-0">
          <LandingHero />
        </section>
        <section id="features" className="section-padding">
          <LandingFeatures />
        </section>
        <section id="faq" className="section-padding">
          <LandingFAQ />
        </section>
      </main>
    </div>
  );
}
