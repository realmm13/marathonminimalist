import LandingHero from "./_components/LandingHero";
import LandingFeatures from "./_components/LandingFeatures";
import LandingTestimonials from "./_components/LandingTestimonials";
import LandingFAQ from "./_components/LandingFAQ";
import HomePageGradients from "./_components/HomePageGradients";
import LandingPricing from "./_components/LandingPricing";
import LandingSmoothNav from "./_components/LandingSmoothNav";
import ScrollProgressIndicator from "./_components/ScrollProgressIndicator";
import InteractiveFeatureDemo from "./_components/InteractiveFeatureDemo";
import PerformanceMonitor from "./_components/PerformanceMonitor";
import LandingNewsletter from "./_components/LandingNewsletter";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      {/* Performance monitoring */}
      <PerformanceMonitor />
      
      {/* Scroll progress indicator */}
      <ScrollProgressIndicator />
      
      {/* Smooth navigation */}
      <LandingSmoothNav />
      
      {/* Background gradients */}
      <HomePageGradients />
      
      {/* Page sections */}
      <LandingHero />
      <LandingFeatures />
      <InteractiveFeatureDemo />
      <LandingPricing />
      <LandingTestimonials />
      <LandingNewsletter />
      <LandingFAQ />
    </main>
  );
}
