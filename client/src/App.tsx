import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Explore from "@/pages/explore";
import Community from "@/pages/community";
import CommunityPage from "@/pages/community";
import Claim from "@/pages/claim";
import Admin from "@/pages/admin";
import AdminCleanFull from "@/pages/admin-clean-full";
import AdminCreative from "@/pages/admin-creative";
import ExpansionMonitor from "@/pages/expansion-monitor";
import ApiCostDashboard from "@/pages/api-cost-dashboard";
import ApiCostInvestigation from "@/pages/api-cost-investigation";
import GoogleCloudBilling from "@/pages/google-cloud-billing";
import RealTimeBillingDashboard from "@/pages/real-time-billing-dashboard";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Disclaimer from "@/pages/disclaimer";
import Accessibility from "@/pages/accessibility";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/explore" component={Explore} />
      <Route path="/community/:id" component={CommunityPage} />
      <Route path="/claim/:communityId" component={Claim} />
      <Route path="/admin" component={AdminCreative} />
      <Route path="/expansion-monitor" component={ExpansionMonitor} />
      <Route path="/api-costs" component={ApiCostDashboard} />
      <Route path="/api-cost-investigation" component={ApiCostInvestigation} />
      <Route path="/google-cloud-billing" component={GoogleCloudBilling} />
      <Route path="/real-time-billing" component={RealTimeBillingDashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/accessibility" component={Accessibility} />
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
