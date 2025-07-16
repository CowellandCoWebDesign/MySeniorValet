import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import Home from "@/pages/home";
import TrueViewHome from "@/pages/trueview-home";
import Search from "@/pages/search";
import TrueViewSearch from "@/pages/trueview-search";
import EnhancedSearch from "@/pages/enhanced-search";
import SearchWorking from "@/pages/search-working";
import BasicSearch from "@/pages/basic-search";
import TestSearch from "@/pages/test-search";
// Removed pages: SimpleSearch, WorkingSearch, Explore
import Community from "@/pages/community";
import CommunityPage from "@/pages/community";
import TrueViewCommunity from "@/pages/trueview-community";
import Claim from "@/pages/claim";
import Admin from "@/pages/admin";
import AdminCleanFull from "@/pages/admin-clean-full";
import AdminCreative from "@/pages/admin-creative";
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
import TourTracker from "@/pages/tour-tracker";
import SupportResources from "@/pages/support-resources";
import VeteransHousing from "@/pages/veterans-housing";
import AffordableHousing from "@/pages/affordable-housing";
// HudVashMap removed
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
import CommunityPortal from "@/pages/community-portal";
import AISupport from "@/pages/ai-support";
import AllInOnePlanner from "@/pages/all-in-one-planner";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={TrueViewHome} />
      <Route path="/search" component={MapSearch} />
      <Route path="/map" component={MapSearch} />
      {/* Rentals route removed - redirect to search */}
      {/* MapboxTest route removed */}
      {/* Map test routes removed */}
      <Route path="/test-search" component={TestSearch} />
      <Route path="/old-search" component={TrueViewSearch} />
      {/* Explore route removed */}
      <Route path="/community/:id" component={CommunityDetail} />
      <Route path="/communities/:id" component={CommunityDetail} />
      <Route path="/claim/:communityId" component={Claim} />
      <Route path="/admin" component={AdminCreative} />
      <Route path="/admin/service-listings" component={ServiceListingsAdmin} />
      <Route path="/expansion-monitor" component={ExpansionMonitor} />
      <Route path="/api-costs" component={ApiCostDashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tour-tracker" component={TourTracker} />
      <Route path="/tour-tracker/:communityId" component={TourTracker} />
      <Route path="/edit-tour/:tourId" component={TourTracker} />
      <Route path="/support" component={SupportResources} />
      <Route path="/veterans" component={VeteransHousing} />
      {/* HudVashMap route removed */}
      <Route path="/affordable-housing" component={() => <BasicSearch initialFilters={['Affordable Housing']} />} />
      <Route path="/family-collaboration" component={FamilyCollaboration} />
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
      <Route path="/support" component={AISupport} />
      <Route path="/ai-support" component={AISupport} />
      <Route path="/all-in-one-planner" component={AllInOnePlanner} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <DisclaimerBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
