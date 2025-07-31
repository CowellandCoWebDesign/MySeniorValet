import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { MascotProvider } from "@/components/mascot";
import { ThemeProvider } from "@/components/theme-provider";

// Import Leaflet CSS globally for map functionality
import 'leaflet/dist/leaflet.css';
import MySeniorValetHome from "@/pages/myseniorvalet-home";
import Claim from "@/pages/claim";
import Admin from "@/pages/admin";
import AdminCleanFull from "@/pages/admin-clean-full";
import AdminCreative from "@/pages/admin-creative";
import AdminUnified from "@/pages/admin-unified";
import ExpansionMonitor from "@/pages/expansion-monitor";
import ApiCostDashboard from "@/pages/api-cost-dashboard";
import ServiceListingsAdmin from "@/pages/admin/service-listings";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Disclaimer from "@/pages/disclaimer";
import Accessibility from "@/pages/accessibility";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import PersonalizedDashboard from "@/pages/personalized-dashboard";
import TourTracker from "@/pages/tour-tracker";
import SupportResources from "@/pages/support-resources";
import VeteransHousing from "@/pages/veterans-housing";
import AffordableHousing from "@/pages/affordable-housing";
import FamilyCollaboration from "@/pages/family-collaboration";
import CommunityDetail from "@/pages/community-detail";
import MapSearch from "@/pages/map-search";
// Rentals page removed - consolidated to use BasicSearch
// MapboxTest removed
// Map test pages removed
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Mission from "@/pages/mission";
import Team from "@/pages/team";
import Testimonials from "@/pages/testimonials";
import Help from "@/pages/help";
import CareGuide from "@/pages/care-guide";
import CommunityPortal from "@/pages/community-portal-integrated";
import CommunityDashboard from "@/pages/community-dashboard-enhanced";
import CommunityLeasing from "@/pages/community-leasing";
import TenantPortal from "@/pages/tenant-portal";
import MyCommunities from "@/pages/my-communities";
import AISupport from "@/pages/ai-support";
import AllInOnePlanner from "@/pages/all-in-one-planner";
import Costs from "@/pages/costs";
import RealDataPricing from "@/pages/real-data-pricing";
import Services from "@/pages/services";
import SeniorServices from "@/pages/senior-services";
import FloralServices from "@/pages/FloralServices";
import MovingServices from "@/pages/MovingServices";
import TransportationServices from "@/pages/TransportationServices";
import ToursPage from "@/pages/tours";
import { Messaging } from "@/pages/messaging";

import MoveInServices from "@/pages/MoveInServices";
import AmazonServices from "@/pages/AmazonServices";
import VendorProfile from "@/pages/VendorProfile";
import FamilyConnect from "@/pages/family-connect";
import CommunityPaymentProgram from "@/pages/community-payment-program";
import ResidentOnboarding from "@/pages/resident-onboarding";
import LeaseDocumentManagement from "@/pages/lease-document-management";
import NotFound from "@/pages/not-found";
import QuizPage from "@/pages/quiz";
import TestDebug from "@/pages/test-debug";
import TestMapViews from "@/pages/test-map-views";
import AuthDebug from "@/pages/auth-debug";
import AISearch from "@/pages/ai-search";
import WeaviateTest from "@/pages/weaviate-test";
import DatabaseTest from "@/pages/database-test";
import IntegrationDashboard from "@/pages/integration-dashboard";
import IntegrationsPage from "@/pages/integrations";
import SubscriptionManagement from "@/pages/SubscriptionManagement";
import AIDemoPage from "@/pages/ai-demo";
import AIMapShowcase from "@/pages/ai-map-showcase";
import AISearchIntelligence from "@/pages/ai-search-intelligence";
import VendorSignup from "@/pages/vendor-signup";
import VendorDashboard from "@/pages/vendor-dashboard";
import ServicesManagementDashboard from "@/pages/ServicesManagementDashboard";
import TestTierAccess from "@/pages/test-tier-access";
import AmazonProductAdmin from "@/pages/AmazonProductAdmin";
import PerplexityTest from "@/pages/PerplexityTest";
import MultiAITest from "@/pages/MultiAITest";
import AISearchComparison from "@/pages/AISearchComparison";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={MySeniorValetHome} />
      <Route path="/search" component={MapSearch} />
      <Route path="/map" component={MapSearch} />
      <Route path="/map-search" component={MapSearch} />
      <Route path="/ai-search" component={AISearch} />
      <Route path="/semantic-search" component={AISearch} />
      <Route path="/ai-intelligence" component={AISearch} />
      <Route path="/community/:id" component={CommunityDetail} />
      <Route path="/communities/:id" component={CommunityDetail} />
      <Route path="/claim/:communityId" component={Claim} />
      <Route path="/admin" component={AdminCreative} />
      <Route path="/admin-creative" component={AdminCreative} />
      <Route path="/admin-unified" component={AdminUnified} />
      <Route path="/admin/service-listings" component={ServiceListingsAdmin} />
      <Route path="/admin/services-management" component={ServicesManagementDashboard} />
      <Route path="/admin/amazon-products" component={AmazonProductAdmin} />
      <Route path="/admin/perplexity-test" component={PerplexityTest} />
      <Route path="/admin/multi-ai-test" component={MultiAITest} />
      <Route path="/ai-search-comparison" component={AISearchComparison} />
      <Route path="/expansion-monitor" component={ExpansionMonitor} />
      <Route path="/api-costs" component={ApiCostDashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/personalized-dashboard" component={PersonalizedDashboard} />
      <Route path="/tour-tracker" component={TourTracker} />
      <Route path="/tour-tracker/:communityId" component={TourTracker} />
      <Route path="/edit-tour/:tourId" component={TourTracker} />
      <Route path="/tours" component={ToursPage} />
      <Route path="/messaging" component={Messaging} />
      <Route path="/messages" component={Messaging} />
      <Route path="/support" component={SupportResources} />
      <Route path="/veterans" component={VeteransHousing} />
      {/* HudVashMap route removed */}
      <Route path="/affordable-housing" component={AffordableHousing} />
      <Route path="/family-collaboration" component={FamilyCollaboration} />
      <Route path="/family-connect" component={FamilyConnect} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/accessibility" component={Accessibility} />
      <Route path="/mission" component={Mission} />
      <Route path="/team" component={Team} />
      <Route path="/testimonials" component={Testimonials} />
      <Route path="/help" component={Help} />
      <Route path="/care-guide" component={CareGuide} />
      <Route path="/community-portal" component={CommunityPortal} />
      <Route path="/my-communities" component={MyCommunities} />
      <Route path="/community-dashboard/:id" component={CommunityDashboard} />
      <Route path="/community-portal/:id/leasing" component={CommunityLeasing} />
      <Route path="/tenant-portal" component={TenantPortal} />
      <Route path="/support" component={AISupport} />
      <Route path="/ai-support" component={AISupport} />
      <Route path="/all-in-one-planner" component={AllInOnePlanner} />
      <Route path="/costs" component={Costs} />
      <Route path="/real-data-pricing" component={RealDataPricing} />
      <Route path="/services" component={Services} />
      <Route path="/senior-services" component={SeniorServices} />
      <Route path="/florals" component={FloralServices} />
      <Route path="/moving" component={MovingServices} />
      <Route path="/transportation" component={TransportationServices} />

      <Route path="/move-in-essentials" component={MoveInServices} />
      <Route path="/amazon-supplies" component={AmazonServices} />
      <Route path="/vendor/:vendorId" component={VendorProfile} />
      <Route path="/community-payment-program" component={CommunityPaymentProgram} />
      <Route path="/resident-onboarding" component={ResidentOnboarding} />
      <Route path="/lease-management/:applicationId" component={LeaseDocumentManagement} />
      <Route path="/quiz" component={QuizPage} />
      <Route path="/test-debug" component={TestDebug} />
      <Route path="/test-map-views" component={TestMapViews} />
      <Route path="/auth-debug" component={AuthDebug} />
      <Route path="/weaviate-test" component={WeaviateTest} />
      <Route path="/database-test" component={DatabaseTest} />
      <Route path="/integrations" component={IntegrationsPage} />
      <Route path="/integration-dashboard" component={IntegrationDashboard} />
      <Route path="/subscriptions" component={SubscriptionManagement} />
      <Route path="/ai-demo" component={AIDemoPage} />
      <Route path="/ai-map-showcase" component={AIMapShowcase} />
      <Route path="/vendor/signup" component={VendorSignup} />
      <Route path="/vendor/dashboard" component={VendorDashboard} />
      <Route path="/test-tier-access" component={TestTierAccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <MascotProvider>
            <Toaster />
            <Router />
            <DisclaimerBanner />
          </MascotProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
