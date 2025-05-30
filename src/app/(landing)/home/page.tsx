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
import ContactForm from "./_components/ContactForm";

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
      
      {/* Contact section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
