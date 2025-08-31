import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AdminMegaDashboard from '../pages/admin-mega-dashboard';

// Mock fetch for API calls
global.fetch = vi.fn();

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

// Mock data generators
const generateMockUsers = (count: number) => Array.from({ length: count }, (_, i) => ({
  id: i + 1,
  email: `user${i + 1}@test.com`,
  name: `Test User ${i + 1}`,
  role: i === 0 ? 'super_admin' : i % 3 === 0 ? 'admin' : 'user',
  status: i % 5 === 0 ? 'inactive' : 'active',
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  emailVerified: i % 4 !== 0,
  twoFactorEnabled: i % 6 === 0,
  loginAttempts: Math.floor(Math.random() * 5),
  metadata: {
    preferences: { theme: 'dark', language: 'en' },
    subscription: i % 2 === 0 ? 'premium' : 'free'
  }
}));

const generateMockCommunities = (count: number) => Array.from({ length: count }, (_, i) => ({
  id: i + 1,
  name: `Community ${i + 1}`,
  address: `${100 + i} Main St`,
  city: ['New York', 'Los Angeles', 'Chicago', 'Houston'][i % 4],
  state: ['NY', 'CA', 'IL', 'TX'][i % 4],
  zip: `${10000 + i}`,
  verified: i % 3 === 0,
  hudProperty: i % 5 === 0,
  pricing: i % 2 === 0 ? { min: 3000 + i * 100, max: 5000 + i * 150 } : null,
  averageRating: 3.5 + (Math.random() * 1.5),
  reviewCount: Math.floor(Math.random() * 100),
  careTypes: ['Assisted Living', 'Memory Care', 'Independent Living'].slice(0, (i % 3) + 1),
  amenities: ['Dining', 'Activities', 'Transportation'].slice(0, (i % 3) + 1),
  lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
}));

const generateMockAnalytics = () => ({
  userEngagement: {
    dailyActiveUsers: Math.floor(Math.random() * 10000),
    weeklyActiveUsers: Math.floor(Math.random() * 50000),
    monthlyActiveUsers: Math.floor(Math.random() * 200000),
    averageSessionDuration: Math.floor(Math.random() * 600) + 120,
    bounceRate: Math.random() * 0.5,
    pageViewsPerSession: Math.random() * 10 + 2
  },
  conversionMetrics: {
    signupRate: Math.random() * 0.1,
    premiumConversionRate: Math.random() * 0.05,
    tourBookingRate: Math.random() * 0.15,
    communityClaimRate: Math.random() * 0.02
  },
  behaviorPatterns: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
    searches: Math.floor(Math.random() * 5000),
    profileViews: Math.floor(Math.random() * 3000),
    tourRequests: Math.floor(Math.random() * 500),
    shares: Math.floor(Math.random() * 1000)
  }))
});

const generateMockRevenue = () => ({
  currentMRR: 125000 + Math.random() * 50000,
  previousMRR: 110000 + Math.random() * 40000,
  growth: Math.random() * 0.3 - 0.1,
  churnRate: Math.random() * 0.05,
  averageRevenuePerUser: 50 + Math.random() * 100,
  lifetimeValue: 1200 + Math.random() * 800,
  subscriptions: {
    free: Math.floor(Math.random() * 50000),
    basic: Math.floor(Math.random() * 5000),
    premium: Math.floor(Math.random() * 2000),
    enterprise: Math.floor(Math.random() * 100)
  },
  topRevenueSources: [
    { source: 'Community Claims', revenue: 45000, percentage: 36 },
    { source: 'Premium Subscriptions', revenue: 38000, percentage: 30.4 },
    { source: 'Featured Listings', revenue: 25000, percentage: 20 },
    { source: 'Tour Bookings', revenue: 17000, percentage: 13.6 }
  ]
});

const generateMockSecurityData = () => ({
  threatLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
  activeThreats: Math.floor(Math.random() * 10),
  blockedIPs: Math.floor(Math.random() * 100),
  suspiciousActivities: Math.floor(Math.random() * 50),
  recentIncidents: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    type: ['Brute Force', 'SQL Injection', 'XSS Attempt', 'DDoS'][i % 4],
    severity: ['low', 'medium', 'high', 'critical'][i % 4],
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    status: i % 3 === 0 ? 'mitigated' : 'monitoring',
    details: `Detected ${['login attempts', 'malicious payload', 'suspicious pattern'][i % 3]}`
  })),
  auditLogs: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    action: ['login', 'data_export', 'permission_change', 'configuration_update'][i % 4],
    user: `admin${i % 3 + 1}@test.com`,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    details: { changes: ['Updated settings', 'Exported user data', 'Changed permissions'][i % 3] }
  }))
});

describe('AdminMegaDashboard - Comprehensive Functionality Tests', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
    
    // Mock successful auth check
    (fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/auth/user')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 1,
            email: 'admin@myseniorvalet.com',
            role: 'super_admin',
            name: 'Super Admin'
          })
        });
      }
      
      // Default response for other endpoints
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    });
  });

  describe('Dashboard Tab - Platform Statistics & Real-time Metrics', () => {
    test('should display and update platform statistics in real-time', async () => {
      const mockStats = {
        totalCommunities: 32970,
        totalUsers: 150000,
        activeUsers: 45000,
        premiumUsers: 8500,
        hudProperties: 4784,
        verifiedCommunities: 12500,
        revenueThisMonth: 175000,
        growthRate: 0.15
      };

      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/dashboard/stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockStats)
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/32,970/)).toBeInTheDocument();
        expect(screen.getByText(/150,000/)).toBeInTheDocument();
        expect(screen.getByText(/\$175,000/)).toBeInTheDocument();
      });

      // Test real-time update simulation
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/dashboard/stats'),
          expect.any(Object)
        );
      });
    });

    test('should handle large datasets efficiently with virtual scrolling', async () => {
      const largeDataset = generateMockCommunities(10000);
      
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/communities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ communities: largeDataset.slice(0, 100) })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      // Navigate to Communities tab
      const communitiesTab = screen.getByRole('tab', { name: /communities/i });
      fireEvent.click(communitiesTab);

      await waitFor(() => {
        const communityList = screen.getByTestId('community-list');
        expect(communityList).toBeInTheDocument();
      });
    });
  });

  describe('Users Tab - Advanced User Management', () => {
    test('should perform bulk user operations with validation', async () => {
      const mockUsers = generateMockUsers(50);
      
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/users')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ users: mockUsers })
          });
        }
        if (url.includes('/api/admin/users/bulk')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              success: true, 
              affected: 10,
              operations: ['role_updated', 'status_changed']
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const usersTab = screen.getByRole('tab', { name: /users/i });
      fireEvent.click(usersTab);

      await waitFor(() => {
        expect(screen.getByText('user1@test.com')).toBeInTheDocument();
      });

      // Select multiple users
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.slice(1, 11).forEach(cb => fireEvent.click(cb));

      // Perform bulk action
      const bulkActionButton = screen.getByRole('button', { name: /bulk actions/i });
      fireEvent.click(bulkActionButton);

      const changeRoleOption = screen.getByText(/change role/i);
      fireEvent.click(changeRoleOption);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/users/bulk'),
          expect.objectContaining({
            method: 'POST',
            body: expect.any(String)
          })
        );
      });
    });

    test('should handle complex user filtering and searching', async () => {
      const mockUsers = generateMockUsers(100);
      
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/users')) {
          const urlObj = new URL(url, 'http://localhost');
          const search = urlObj.searchParams.get('search');
          const role = urlObj.searchParams.get('role');
          
          let filtered = mockUsers;
          if (search) {
            filtered = filtered.filter(u => 
              u.email.includes(search) || u.name.includes(search)
            );
          }
          if (role) {
            filtered = filtered.filter(u => u.role === role);
          }
          
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ users: filtered })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const usersTab = screen.getByRole('tab', { name: /users/i });
      fireEvent.click(usersTab);

      // Test search functionality
      const searchInput = await screen.findByPlaceholderText(/search users/i);
      await userEvent.type(searchInput, 'user5');

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('search=user5'),
          expect.any(Object)
        );
      });

      // Test role filtering
      const roleFilter = screen.getByRole('combobox', { name: /filter by role/i });
      fireEvent.change(roleFilter, { target: { value: 'admin' } });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('role=admin'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Communities Tab - Advanced Community Management', () => {
    test('should handle mass community verification with validation', async () => {
      const mockCommunities = generateMockCommunities(100);
      
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/communities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ communities: mockCommunities })
          });
        }
        if (url.includes('/api/admin/communities/verify')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              success: true,
              verified: 25,
              failed: 2,
              errors: ['Community 45: Missing required data', 'Community 67: Invalid address']
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const communitiesTab = screen.getByRole('tab', { name: /communities/i });
      fireEvent.click(communitiesTab);

      await waitFor(() => {
        expect(screen.getByText('Community 1')).toBeInTheDocument();
      });

      // Select unverified communities
      const unverifiedCheckboxes = screen.getAllByTestId(/unverified-community/i);
      unverifiedCheckboxes.forEach(cb => fireEvent.click(cb));

      // Trigger mass verification
      const verifyButton = screen.getByRole('button', { name: /verify selected/i });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText(/25 communities verified/i)).toBeInTheDocument();
        expect(screen.getByText(/2 failed/i)).toBeInTheDocument();
      });
    });

    test('should handle complex pricing updates with validation', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/communities/pricing')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              success: true,
              updated: 15,
              validation: {
                warnings: ['5 communities have pricing above market average'],
                errors: []
              }
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const communitiesTab = screen.getByRole('tab', { name: /communities/i });
      fireEvent.click(communitiesTab);

      const pricingButton = await screen.findByRole('button', { name: /update pricing/i });
      fireEvent.click(pricingButton);

      // Fill pricing form
      const minPriceInput = screen.getByLabelText(/minimum price/i);
      const maxPriceInput = screen.getByLabelText(/maximum price/i);
      
      await userEvent.clear(minPriceInput);
      await userEvent.type(minPriceInput, '3500');
      await userEvent.clear(maxPriceInput);
      await userEvent.type(maxPriceInput, '8500');

      const submitButton = screen.getByRole('button', { name: /apply pricing/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/15 communities updated/i)).toBeInTheDocument();
        expect(screen.getByText(/pricing above market average/i)).toBeInTheDocument();
      });
    });
  });

  describe('Analytics Tab - Advanced Data Analysis', () => {
    test('should generate complex analytics reports with multiple metrics', async () => {
      const mockAnalytics = generateMockAnalytics();
      
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/analytics')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockAnalytics)
          });
        }
        if (url.includes('/api/admin/analytics/export')) {
          return Promise.resolve({
            ok: true,
            blob: () => Promise.resolve(new Blob(['analytics data'], { type: 'text/csv' }))
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
      fireEvent.click(analyticsTab);

      await waitFor(() => {
        expect(screen.getByText(/daily active users/i)).toBeInTheDocument();
        expect(screen.getByText(/conversion metrics/i)).toBeInTheDocument();
      });

      // Test date range filtering
      const dateRangeButton = screen.getByRole('button', { name: /date range/i });
      fireEvent.click(dateRangeButton);

      const last30Days = screen.getByText(/last 30 days/i);
      fireEvent.click(last30Days);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('range=30days'),
          expect.any(Object)
        );
      });

      // Test export functionality
      const exportButton = screen.getByRole('button', { name: /export analytics/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/analytics/export'),
          expect.any(Object)
        );
      });
    });

    test('should handle predictive analytics and forecasting', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/analytics/forecast')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              predictions: {
                nextMonthRevenue: 195000,
                confidence: 0.85,
                growthTrend: 'positive',
                riskFactors: ['Seasonal variation', 'Market competition'],
                recommendations: [
                  'Increase marketing spend by 15%',
                  'Focus on premium conversions',
                  'Improve retention programs'
                ]
              }
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
      fireEvent.click(analyticsTab);

      const forecastButton = await screen.findByRole('button', { name: /generate forecast/i });
      fireEvent.click(forecastButton);

      await waitFor(() => {
        expect(screen.getByText(/\$195,000/)).toBeInTheDocument();
        expect(screen.getByText(/85% confidence/i)).toBeInTheDocument();
        expect(screen.getByText(/increase marketing spend/i)).toBeInTheDocument();
      });
    });
  });

  describe('Revenue Tab - Financial Management', () => {
    test('should handle complex revenue calculations and projections', async () => {
      const mockRevenue = generateMockRevenue();
      
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/revenue')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockRevenue)
          });
        }
        if (url.includes('/api/admin/revenue/simulate')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              scenarios: [
                { name: 'Conservative', mrr: 135000, growth: 0.08 },
                { name: 'Moderate', mrr: 145000, growth: 0.16 },
                { name: 'Aggressive', mrr: 165000, growth: 0.32 }
              ]
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const revenueTab = screen.getByRole('tab', { name: /revenue/i });
      fireEvent.click(revenueTab);

      await waitFor(() => {
        expect(screen.getByText(/current mrr/i)).toBeInTheDocument();
        expect(screen.getByText(/churn rate/i)).toBeInTheDocument();
      });

      // Test revenue simulation
      const simulateButton = screen.getByRole('button', { name: /run simulation/i });
      fireEvent.click(simulateButton);

      await waitFor(() => {
        expect(screen.getByText(/conservative/i)).toBeInTheDocument();
        expect(screen.getByText(/\$165,000/)).toBeInTheDocument();
      });
    });

    test('should handle subscription management and billing operations', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/subscriptions/cancel')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              refundAmount: 49.99,
              effectiveDate: new Date().toISOString()
            })
          });
        }
        if (url.includes('/api/admin/subscriptions/upgrade')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              newPlan: 'premium',
              proratedCharge: 25.50
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const revenueTab = screen.getByRole('tab', { name: /revenue/i });
      fireEvent.click(revenueTab);

      // Test subscription cancellation
      const cancelButton = await screen.findByRole('button', { name: /cancel subscription/i });
      fireEvent.click(cancelButton);

      const confirmButton = screen.getByRole('button', { name: /confirm cancellation/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/refund.*49.99/i)).toBeInTheDocument();
      });
    });
  });

  describe('Security Tab - Advanced Security Monitoring', () => {
    test('should detect and handle security threats in real-time', async () => {
      const mockSecurityData = generateMockSecurityData();
      
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/security/dashboard')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockSecurityData)
          });
        }
        if (url.includes('/api/admin/security/block-ip')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              blockedIP: '192.168.1.100',
              reason: 'Multiple failed login attempts'
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const securityTab = screen.getByRole('tab', { name: /security/i });
      fireEvent.click(securityTab);

      await waitFor(() => {
        expect(screen.getByText(/threat level/i)).toBeInTheDocument();
        expect(screen.getByText(/recent incidents/i)).toBeInTheDocument();
      });

      // Test IP blocking
      const blockIPButton = screen.getByRole('button', { name: /block ip/i });
      fireEvent.click(blockIPButton);

      const ipInput = screen.getByPlaceholderText(/enter ip address/i);
      await userEvent.type(ipInput, '192.168.1.100');

      const confirmBlockButton = screen.getByRole('button', { name: /confirm block/i });
      fireEvent.click(confirmBlockButton);

      await waitFor(() => {
        expect(screen.getByText(/ip blocked successfully/i)).toBeInTheDocument();
      });
    });

    test('should generate comprehensive security audit reports', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/security/audit')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              vulnerabilities: [
                { severity: 'high', type: 'Outdated dependencies', count: 3 },
                { severity: 'medium', type: 'Weak passwords', count: 15 },
                { severity: 'low', type: 'Missing 2FA', count: 150 }
              ],
              recommendations: [
                'Update critical dependencies immediately',
                'Enforce password policy',
                'Enable mandatory 2FA for admin accounts'
              ],
              complianceStatus: {
                GDPR: 'compliant',
                CCPA: 'compliant',
                HIPAA: 'partial',
                SOC2: 'in-progress'
              }
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const securityTab = screen.getByRole('tab', { name: /security/i });
      fireEvent.click(securityTab);

      const auditButton = await screen.findByRole('button', { name: /run security audit/i });
      fireEvent.click(auditButton);

      await waitFor(() => {
        expect(screen.getByText(/outdated dependencies/i)).toBeInTheDocument();
        expect(screen.getByText(/gdpr.*compliant/i)).toBeInTheDocument();
        expect(screen.getByText(/enable mandatory 2fa/i)).toBeInTheDocument();
      });
    });
  });

  describe('Notifications Tab - Multi-channel Communication', () => {
    test('should send bulk notifications with template management', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/notifications/templates')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              templates: [
                { id: 1, name: 'Welcome Email', type: 'email', usage: 1500 },
                { id: 2, name: 'Tour Reminder', type: 'sms', usage: 850 },
                { id: 3, name: 'Newsletter', type: 'email', usage: 5000 }
              ]
            })
          });
        }
        if (url.includes('/api/admin/notifications/send')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              sent: 2500,
              failed: 12,
              queued: 488,
              estimatedDeliveryTime: '15 minutes'
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const notificationsTab = screen.getByRole('tab', { name: /notifications/i });
      fireEvent.click(notificationsTab);

      await waitFor(() => {
        expect(screen.getByText(/welcome email/i)).toBeInTheDocument();
      });

      // Test bulk send
      const bulkSendButton = screen.getByRole('button', { name: /send bulk notification/i });
      fireEvent.click(bulkSendButton);

      const templateSelect = screen.getByRole('combobox', { name: /select template/i });
      fireEvent.change(templateSelect, { target: { value: '3' } });

      const recipientInput = screen.getByPlaceholderText(/recipient criteria/i);
      await userEvent.type(recipientInput, 'role:premium');

      const sendButton = screen.getByRole('button', { name: /send now/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/2500 sent/i)).toBeInTheDocument();
        expect(screen.getByText(/15 minutes/i)).toBeInTheDocument();
      });
    });
  });

  describe('Reports Tab - Advanced Reporting & Export', () => {
    test('should generate complex reports with multiple data sources', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/reports/generate')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              reportId: 'RPT-2025-001',
              status: 'processing',
              estimatedTime: 30,
              format: 'pdf',
              size: '15.2MB'
            })
          });
        }
        if (url.includes('/api/admin/reports/status')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              status: 'completed',
              downloadUrl: '/downloads/report-2025-001.pdf',
              generatedAt: new Date().toISOString()
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);

      // Configure report
      const reportTypeSelect = await screen.findByRole('combobox', { name: /report type/i });
      fireEvent.change(reportTypeSelect, { target: { value: 'comprehensive' } });

      const dateRangeStart = screen.getByLabelText(/start date/i);
      const dateRangeEnd = screen.getByLabelText(/end date/i);
      
      await userEvent.type(dateRangeStart, '2025-01-01');
      await userEvent.type(dateRangeEnd, '2025-08-31');

      // Include multiple data sources
      const includeUsers = screen.getByRole('checkbox', { name: /include users/i });
      const includeCommunities = screen.getByRole('checkbox', { name: /include communities/i });
      const includeRevenue = screen.getByRole('checkbox', { name: /include revenue/i });
      
      fireEvent.click(includeUsers);
      fireEvent.click(includeCommunities);
      fireEvent.click(includeRevenue);

      const generateButton = screen.getByRole('button', { name: /generate report/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/report.*processing/i)).toBeInTheDocument();
        expect(screen.getByText(/estimated.*30/i)).toBeInTheDocument();
      });

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/download report/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should handle scheduled reports and automation', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/reports/schedule')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              scheduleId: 'SCH-2025-001',
              nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              recipients: ['admin@myseniorvalet.com', 'reports@myseniorvalet.com']
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);

      const scheduleButton = await screen.findByRole('button', { name: /schedule report/i });
      fireEvent.click(scheduleButton);

      // Configure schedule
      const frequencySelect = screen.getByRole('combobox', { name: /frequency/i });
      fireEvent.change(frequencySelect, { target: { value: 'weekly' } });

      const recipientInput = screen.getByPlaceholderText(/recipient emails/i);
      await userEvent.type(recipientInput, 'admin@myseniorvalet.com,reports@myseniorvalet.com');

      const saveScheduleButton = screen.getByRole('button', { name: /save schedule/i });
      fireEvent.click(saveScheduleButton);

      await waitFor(() => {
        expect(screen.getByText(/schedule created/i)).toBeInTheDocument();
        expect(screen.getByText(/next run/i)).toBeInTheDocument();
      });
    });
  });

  describe('AI Management Tab - AI Service Configuration', () => {
    test('should manage multiple AI models with fallback configuration', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/ai/config')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              models: [
                { name: 'Perplexity', status: 'active', usage: 15000, limit: 50000 },
                { name: 'Claude', status: 'active', usage: 8000, limit: 20000 },
                { name: 'ChatGPT', status: 'standby', usage: 500, limit: 10000 }
              ],
              fallbackChain: ['Perplexity', 'Claude', 'ChatGPT'],
              costThisMonth: 1250.75
            })
          });
        }
        if (url.includes('/api/admin/ai/switch')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              newPrimary: 'Claude',
              previousPrimary: 'Perplexity'
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const aiTab = screen.getByRole('tab', { name: /ai management/i });
      fireEvent.click(aiTab);

      await waitFor(() => {
        expect(screen.getByText(/perplexity/i)).toBeInTheDocument();
        expect(screen.getByText(/15000.*50000/i)).toBeInTheDocument();
      });

      // Test model switching
      const switchButton = screen.getByRole('button', { name: /switch primary/i });
      fireEvent.click(switchButton);

      const modelSelect = screen.getByRole('combobox', { name: /select model/i });
      fireEvent.change(modelSelect, { target: { value: 'Claude' } });

      const confirmSwitchButton = screen.getByRole('button', { name: /confirm switch/i });
      fireEvent.click(confirmSwitchButton);

      await waitFor(() => {
        expect(screen.getByText(/primary model switched/i)).toBeInTheDocument();
      });
    });

    test('should monitor AI performance and cost optimization', async () => {
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/ai/performance')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              metrics: {
                averageResponseTime: 1.2,
                successRate: 0.985,
                errorRate: 0.015,
                costPerRequest: 0.08,
                qualityScore: 0.92
              },
              recommendations: [
                'Consider caching frequent queries',
                'Optimize prompt templates',
                'Implement request batching'
              ]
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const aiTab = screen.getByRole('tab', { name: /ai management/i });
      fireEvent.click(aiTab);

      const performanceButton = await screen.findByRole('button', { name: /view performance/i });
      fireEvent.click(performanceButton);

      await waitFor(() => {
        expect(screen.getByText(/1.2.*seconds/i)).toBeInTheDocument();
        expect(screen.getByText(/98.5%.*success/i)).toBeInTheDocument();
        expect(screen.getByText(/caching frequent queries/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should gracefully handle API failures with retry logic', async () => {
      let callCount = 0;
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/dashboard/stats')) {
          callCount++;
          if (callCount < 3) {
            return Promise.reject(new Error('Network error'));
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ totalCommunities: 32970 })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      // Should retry and eventually succeed
      await waitFor(() => {
        expect(screen.getByText(/32,970/)).toBeInTheDocument();
      }, { timeout: 10000 });

      expect(callCount).toBe(3);
    });

    test('should handle concurrent operations without data corruption', async () => {
      const operations: Promise<any>[] = [];
      
      (fetch as any).mockImplementation((url: string) => {
        const operation = new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true })
            });
          }, Math.random() * 1000);
        });
        operations.push(operation);
        return operation;
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      // Trigger multiple concurrent operations
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => fireEvent.click(tab));

      await Promise.all(operations);
      
      // Verify no data corruption
      expect(operations.length).toBeGreaterThan(0);
      await waitFor(() => {
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle 10,000+ items with virtual scrolling', async () => {
      const largeDataset = generateMockCommunities(10000);
      
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/communities')) {
          const urlObj = new URL(url, 'http://localhost');
          const page = parseInt(urlObj.searchParams.get('page') || '1');
          const limit = parseInt(urlObj.searchParams.get('limit') || '100');
          
          const start = (page - 1) * limit;
          const end = start + limit;
          
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              communities: largeDataset.slice(start, end),
              total: largeDataset.length,
              page,
              totalPages: Math.ceil(largeDataset.length / limit)
            })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const communitiesTab = screen.getByRole('tab', { name: /communities/i });
      fireEvent.click(communitiesTab);

      await waitFor(() => {
        const virtualList = screen.getByTestId('virtual-scroll-container');
        expect(virtualList).toBeInTheDocument();
      });

      // Verify only visible items are rendered
      const renderedItems = screen.getAllByTestId(/community-item/i);
      expect(renderedItems.length).toBeLessThan(100); // Virtual scrolling should limit rendered items
    });

    test('should debounce search inputs to prevent excessive API calls', async () => {
      let searchCallCount = 0;
      
      (fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/admin/users') && url.includes('search=')) {
          searchCallCount++;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ users: [] })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const usersTab = screen.getByRole('tab', { name: /users/i });
      fireEvent.click(usersTab);

      const searchInput = await screen.findByPlaceholderText(/search users/i);
      
      // Type rapidly
      await userEvent.type(searchInput, 'test search query');

      // Wait for debounce
      await waitFor(() => {
        expect(searchCallCount).toBeLessThan(5); // Should be debounced
      }, { timeout: 2000 });
    });
  });

  describe('Data Integrity and Validation', () => {
    test('should validate all form inputs with comprehensive rules', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const communitiesTab = screen.getByRole('tab', { name: /communities/i });
      fireEvent.click(communitiesTab);

      const addButton = await screen.findByRole('button', { name: /add community/i });
      fireEvent.click(addButton);

      // Test various invalid inputs
      const nameInput = screen.getByLabelText(/community name/i);
      const zipInput = screen.getByLabelText(/zip code/i);
      const priceInput = screen.getByLabelText(/starting price/i);

      // Test empty required field
      fireEvent.blur(nameInput);
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });

      // Test invalid zip code
      await userEvent.type(zipInput, '123');
      fireEvent.blur(zipInput);
      await waitFor(() => {
        expect(screen.getByText(/invalid zip code/i)).toBeInTheDocument();
      });

      // Test negative price
      await userEvent.type(priceInput, '-500');
      fireEvent.blur(priceInput);
      await waitFor(() => {
        expect(screen.getByText(/price must be positive/i)).toBeInTheDocument();
      });
    });

    test('should prevent data loss with unsaved changes warning', async () => {
      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(
        <QueryClientProvider client={queryClient}>
          <AdminMegaDashboard />
        </QueryClientProvider>
      );

      const usersTab = screen.getByRole('tab', { name: /users/i });
      fireEvent.click(usersTab);

      // Make changes
      const editButton = await screen.findByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      const nameInput = screen.getByLabelText(/name/i);
      await userEvent.type(nameInput, ' Modified');

      // Try to navigate away
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      fireEvent.click(dashboardTab);

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringContaining('unsaved changes')
      );

      // Should stay on current tab since user cancelled
      expect(screen.getByRole('tab', { name: /users/i })).toHaveAttribute('aria-selected', 'true');

      mockConfirm.mockRestore();
    });
  });
});