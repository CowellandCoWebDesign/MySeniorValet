import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { MascotProvider } from "@/components/mascot";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { VoiceGuidanceProvider } from "@/components/VoiceGuidanceProvider";
import { DevModeIndicator } from "@/components/DevModeIndicator";

// Import Leaflet CSS globally for map functionality
import 'leaflet/dist/leaflet.css';
import MySeniorValetHome from "@/pages/myseniorvalet-home";
import Claim from "@/pages/claim";
// All admin functionality consolidated into SuperAdminAnalytics
import SuperAdminAnalytics from "@/pages/super-admin-analytics";
import AdminSubscriptionManagement from "@/pages/admin-subscription-management";
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
import EmergencyContacts from "@/pages/emergency-contacts";
import CommunityDetail from "@/pages/community-detail";
import CommunityContribute from "@/pages/community-contribute";
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
import CommunityPortal from "@/pages/community-portal";
import CommunityDashboard from "@/pages/community-dashboard-enhanced";
import CommunityLeasing from "@/pages/community-leasing";
import TenantPortal from "@/pages/tenant-portal";
import MyCommunities from "@/pages/my-communities";
import AISupport from "@/pages/ai-support";
import AIMatchingAssistant from "@/pages/ai-matching-assistant";
import AllInOnePlanner from "@/pages/all-in-one-planner";
import Costs from "@/pages/costs";
import RealDataPricing from "@/pages/real-data-pricing";
import Services from "@/pages/services";
import SeniorServices from "@/pages/senior-services";
import SeniorResources from "@/pages/senior-resources";
import FloralServices from "@/pages/FloralServices";
import MovingServices from "@/pages/MovingServices";
import TransportationServices from "@/pages/TransportationServices";
import ToursPage from "@/pages/tours";
import { Messaging } from "@/pages/messaging";

import MoveInServices from "@/pages/MoveInServices";
import AmazonServices from "@/pages/AmazonServices";
import VendorProfile from "@/pages/VendorProfile";
import VendorMarketplace from "@/pages/vendor-marketplace";
import VendorMarketplaceTiers from "@/pages/vendor-marketplace-tiers";
import FamilyConnect from "@/pages/family-connect";
import CommunityPaymentProgram from "@/pages/community-payment-program";
import CommunitySubscriptionCheckout from "@/pages/community-subscription-checkout";
import ResidentOnboarding from "@/pages/resident-onboarding";
import LeaseDocumentManagement from "@/pages/lease-document-management";
import { NotificationPreferencesPage } from "@/pages/notification-preferences";
import NotFound from "@/pages/not-found";
import QuizPage from "@/pages/quiz";
import TestDebug from "@/pages/test-debug";
import TestMapViews from "@/pages/test-map-views";
import AuthDebug from "@/pages/auth-debug";
import PaymentDemo from "@/pages/payment-demo";
import WeaviateTest from "@/pages/weaviate-test";
import DataQualityDashboard from "@/pages/data-quality-dashboard";
import DatabaseTest from "@/pages/database-test";
import IntegrationDashboard from "@/pages/integration-dashboard";
import IntegrationsPage from "@/pages/integrations";
import SubscriptionManagement from "@/pages/SubscriptionManagement";
import AIDemoPage from "@/pages/ai-demo";
import AIMapShowcase from "@/pages/ai-map-showcase";
import AISearchIntelligence from "@/pages/ai-search-intelligence";
import SimplifiedSearch from "@/pages/simplified-search";
import VendorSignup from "@/pages/vendor-signup";
import VendorDashboard from "@/pages/vendor-dashboard";
import VendorWelcome from "@/pages/vendor-welcome";
import VendorMobilePayment from "@/pages/vendor-mobile-payment";
import ServicesManagementDashboard from "@/pages/ServicesManagementDashboard";
import TestTierAccess from "@/pages/test-tier-access";
import AmazonProductAdmin from "@/pages/AmazonProductAdmin";
import PerplexityTest from "@/pages/perplexity-test";
import MultiAITest from "@/pages/MultiAITest";
import AISearchComparison from "@/pages/AISearchComparison";
// ONE consolidated admin dashboard - removed all duplicates
import { useAuth } from "@/hooks/useAuth";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { EmergencyButton } from "@/components/EmergencyButton";
import { useAccessibilityPreferences } from "@/hooks/useAccessibilityPreferences";
import CanadaPage from "@/pages/canada";
import RedTagExample from "@/pages/red-tag-example";
import HospitalDetails from "@/pages/hospital-details";
import PaymentSuccess from "@/pages/payment-success";
import PaymentCancel from "@/pages/payment-cancel";
import CommunityMobilePayment from "@/pages/community-mobile-payment";
import PaymentTestDashboard from "@/pages/payment-test-dashboard";
import PaymentDiagnostics from "@/pages/payment-diagnostics";
import AdminDashboard from "@/pages/admin-dashboard";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import CookiePolicy from "@/pages/cookie-policy";
import LegalDocumentHistory from "@/pages/legal-document-history";
import PaymentRecovery from "@/pages/payment-recovery";
import CommunityOnboarding from "@/pages/community-onboarding";
import VendorOnboarding from "@/pages/vendor-onboarding";
import VendorOnboardingWizard from "@/pages/vendor-onboarding-wizard";
import VendorTierTest from "@/pages/vendor-tier-test";
import CommunityCreatorPortal from "@/pages/community-creator-portal";
import MarketingHub from "@/pages/marketing-hub";
import AvailabilityHeatmapPage from "@/pages/availability-heatmap";
import TestCommunityCards from "@/pages/test-community-cards";
import EnhancedCardTest from "@/pages/enhanced-card-test";
import AdminAvailabilityHeatmap from "@/pages/admin-availability-heatmap";
import AdminReports from "@/pages/admin-reports";
import MoveInCoordination from "@/pages/move-in-coordination";
import Marketplace from "@/pages/marketplace";
import SeniorMarketplace from "@/pages/senior-marketplace";
import SeniorHealthcareDirectory from "@/pages/senior-healthcare-directory";
import SeniorResourcesCenter from "@/pages/senior-resources-center";
import CommunityDirectory from "@/pages/community-directory";

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
      <Route path="/canada" component={CanadaPage} />
      <Route path="/search" component={MapSearch} />
      <Route path="/map" component={MapSearch} />
      <Route path="/map-search" component={MapSearch} />
      <Route path="/ai-intelligence" component={AISearchIntelligence} />
      <Route path="/simplified-search" component={SimplifiedSearch} />
      <Route path="/community/:id" component={CommunityDetail} />
      <Route path="/communities/:id" component={CommunityDetail} />
      <Route path="/red-tag-example/:communitySlug" component={RedTagExample} />
      <Route path="/hospital/:slug" component={HospitalDetails} />
      <Route path="/community/:id/contribute" component={CommunityContribute} />
      <Route path="/claim/:communityId" component={Claim} />
      <Route path="/community-claim" component={Claim} />
      {/* ALL ADMIN ROUTES NOW REDIRECT TO UNIFIED SUPER ADMIN DASHBOARD */}
      <Route path="/admin" component={SuperAdminAnalytics} />
      <Route path="/admin-creative" component={SuperAdminAnalytics} />
      <Route path="/admin-unified" component={SuperAdminAnalytics} />
      <Route path="/admin-portal" component={SuperAdminAnalytics} />
      <Route path="/super-admin" component={SuperAdminAnalytics} />
      <Route path="/super-admin-analytics" component={SuperAdminAnalytics} />
      <Route path="/admin/service-listings" component={SuperAdminAnalytics} />
      <Route path="/admin/services-management" component={SuperAdminAnalytics} />
      <Route path="/admin/amazon-products" component={SuperAdminAnalytics} />
      <Route path="/admin/perplexity-test" component={SuperAdminAnalytics} />
      <Route path="/admin/multi-ai-test" component={SuperAdminAnalytics} />
      <Route path="/admin/communities" component={SuperAdminAnalytics} />
      {/* Admin section routes - ALL consolidated to SuperAdminAnalytics */}
      <Route path="/admin/reports" component={SuperAdminAnalytics} />
      <Route path="/admin/settings" component={SuperAdminAnalytics} />
      <Route path="/admin/email-broadcast" component={SuperAdminAnalytics} />
      <Route path="/admin/security" component={SuperAdminAnalytics} />
      <Route path="/admin/api-keys" component={SuperAdminAnalytics} />
      <Route path="/admin/users" component={SuperAdminAnalytics} />
      <Route path="/admin/data-quality" component={DataQualityDashboard} />
      <Route path="/admin/audit-logs" component={LegalDocumentHistory} />
      <Route path="/admin/notifications" component={SuperAdminAnalytics} />
      <Route path="/admin/vendor-dashboard" component={VendorDashboard} />
      <Route path="/admin/marketing-hub" component={SuperAdminAnalytics} />
      <Route path="/admin/availability-heatmap" component={SuperAdminAnalytics} />
      <Route path="/ai-search-comparison" component={AISearchComparison} />
      <Route path="/ai-search-intelligence" component={AISearchIntelligence} />
      <Route path="/expansion-monitor" component={SuperAdminAnalytics} />
      <Route path="/api-costs" component={SuperAdminAnalytics} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/personalized-dashboard" component={PersonalizedDashboard} />
      <Route path="/tour-tracker" component={TourTracker} />
      <Route path="/tour-tracker/:communityId" component={TourTracker} />
      <Route path="/edit-tour/:tourId" component={TourTracker} />
      <Route path="/tours" component={ToursPage} />
      <Route path="/messaging" component={Messaging} />
      <Route path="/messages" component={Messaging} />
      <Route path="/notification-preferences" component={NotificationPreferencesPage} />
      <Route path="/support" component={SupportResources} />
      <Route path="/veterans" component={VeteransHousing} />
      {/* HudVashMap route removed */}
      <Route path="/affordable-housing" component={AffordableHousing} />
      <Route path="/family-collaboration" component={FamilyCollaboration} />
      <Route path="/family-connect" component={FamilyConnect} />
      <Route path="/emergency-contacts" component={EmergencyContacts} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/legal-document-history" component={LegalDocumentHistory} />
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
      <Route path="/ai-matching" component={AIMatchingAssistant} />
      <Route path="/ai-matching-assistant" component={AIMatchingAssistant} />
      <Route path="/all-in-one-planner" component={AllInOnePlanner} />
      <Route path="/costs" component={Costs} />
      <Route path="/real-data-pricing" component={RealDataPricing} />
      <Route path="/services" component={Services} />
      <Route path="/senior-services" component={SeniorServices} />
      <Route path="/senior-resources" component={SeniorResources} />
      <Route path="/move-in-coordination" component={MoveInCoordination} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/senior-marketplace" component={SeniorMarketplace} />
      <Route path="/senior-healthcare-directory" component={SeniorHealthcareDirectory} />
      <Route path="/senior-resources-center" component={SeniorResourcesCenter} />
      <Route path="/community-directory" component={CommunityDirectory} />
      <Route path="/vendor-marketplace" component={VendorMarketplace} />
      <Route path="/vendor-marketplace-tiers" component={VendorMarketplaceTiers} />
      <Route path="/florals" component={FloralServices} />
      <Route path="/moving" component={MovingServices} />
      <Route path="/transportation" component={TransportationServices} />

      <Route path="/move-in-essentials" component={MoveInServices} />
      <Route path="/amazon-supplies" component={AmazonServices} />
      <Route path="/vendor/:vendorId" component={VendorProfile} />
      <Route path="/community-payment-program" component={CommunityPaymentProgram} />
      <Route path="/community-subscription-checkout" component={CommunitySubscriptionCheckout} />
      <Route path="/resident-onboarding" component={ResidentOnboarding} />
      <Route path="/lease-management/:applicationId" component={LeaseDocumentManagement} />
      <Route path="/quiz" component={QuizPage} />
      <Route path="/test-debug" component={TestDebug} />
      <Route path="/test-map-views" component={TestMapViews} />
      <Route path="/auth-debug" component={AuthDebug} />
      <Route path="/weaviate-test" component={WeaviateTest} />
      <Route path="/data-quality" component={DataQualityDashboard} />
      <Route path="/database-test" component={DatabaseTest} />
      <Route path="/integrations" component={IntegrationsPage} />
      <Route path="/integration-dashboard" component={IntegrationDashboard} />
      <Route path="/subscriptions" component={SubscriptionManagement} />
      <Route path="/ai-demo" component={AIDemoPage} />
      <Route path="/ai-map-showcase" component={AIMapShowcase} />
      <Route path="/vendor-signup" component={VendorSignup} />
      <Route path="/vendor/signup" component={VendorSignup} />
      <Route path="/vendor-welcome" component={VendorWelcome} />
      <Route path="/vendor/dashboard" component={VendorDashboard} />
      <Route path="/vendor-mobile-payment/:productId" component={VendorMobilePayment} />
      <Route path="/community-mobile-payment/:tier" component={CommunityMobilePayment} />
      <Route path="/test-tier-access" component={TestTierAccess} />
      <Route path="/financial-dashboard" component={SuperAdminAnalytics} />
      <Route path="/enhanced-financial-dashboard" component={SuperAdminAnalytics} />
      <Route path="/payment-monitoring" component={SuperAdminAnalytics} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/cancel" component={PaymentCancel} />
      <Route path="/payment-test-dashboard" component={PaymentTestDashboard} />
      <Route path="/payment-diagnostics" component={PaymentDiagnostics} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/payment-recovery" component={PaymentRecovery} />
      <Route path="/community-onboarding/:communityId" component={CommunityOnboarding} />
      <Route path="/vendor-onboarding/:vendorId" component={VendorOnboarding} />
      <Route path="/vendor-onboarding-wizard/:vendorId" component={VendorOnboardingWizard} />
      <Route path="/vendor-tier-test" component={VendorTierTest} />
      <Route path="/community-creator" component={CommunityCreatorPortal} />
      <Route path="/community-creator-portal" component={CommunityCreatorPortal} />
      <Route path="/super-admin-dashboard" component={SuperAdminAnalytics} />
      <Route path="/super-admin-analytics" component={SuperAdminAnalytics} />
      <Route path="/admin-subscription-management" component={AdminSubscriptionManagement} />
      <Route path="/admin/marketing-hub" component={SuperAdminAnalytics} />
      <Route path="/availability-heatmap" component={AvailabilityHeatmapPage} />
      <Route path="/admin/availability-heatmap" component={SuperAdminAnalytics} />
      <Route path="/payment-demo" component={PaymentDemo} />
      <Route path="/test-community-cards" component={TestCommunityCards} />
      <Route path="/enhanced-card-test" component={EnhancedCardTest} />
      <Route path="/perplexity-test" component={PerplexityTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user } = useAuth();
  const { preferences } = useAccessibilityPreferences();
  
  return (
    <ThemeProvider defaultTheme="light">
      <LanguageProvider>
        <OnboardingProvider>
          <VoiceGuidanceProvider>
            <TooltipProvider>
              <MascotProvider>
                <Toaster />
                <Router />
                <CookieConsentBanner />
                <DisclaimerBanner />
                <DevModeIndicator />
                {user && preferences.emergencyButton && <EmergencyButton userId={user.id} />}
                </MascotProvider>
              </TooltipProvider>
            </VoiceGuidanceProvider>
          </OnboardingProvider>
        </LanguageProvider>
      </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
