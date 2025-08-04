import sgMail from '@sendgrid/mail';
import { db } from '../db';
import { communities, vendors } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface CommunityTierFeatures {
  [key: string]: {
    name: string;
    price: number;
    features: string[];
    nextSteps: string[];
  };
}

interface VendorTierFeatures {
  [key: string]: {
    name: string;
    price: number;
    features: string[];
    nextSteps: string[];
  };
}

const COMMUNITY_TIER_FEATURES: CommunityTierFeatures = {
  verified: {
    name: 'Verified Listing',
    price: 0,
    features: [
      'Email verified listing',
      'Edit contact information',
      'Upload 1 photo',
      'Tour Scheduler enabled',
      'Basic search visibility'
    ],
    nextSteps: [
      'Upload your community photo',
      'Update your contact information',
      'Enable tour scheduling',
      'Consider upgrading to Standard for more features'
    ]
  },
  standard: {
    name: 'Standard',
    price: 149,
    features: [
      'All Verified features plus:',
      'Upload up to 10 photos',
      'Upload 1 brochure PDF',
      'Add external calendar link',
      'Access basic analytics',
      'Respond to reviews',
      '"Standard Verified" badge'
    ],
    nextSteps: [
      'Upload additional photos to showcase your community',
      'Add your community brochure',
      'Link your calendar for tour scheduling',
      'Monitor your analytics dashboard',
      'Respond to community reviews'
    ]
  },
  featured: {
    name: 'Featured',
    price: 249,
    features: [
      'All Standard features plus:',
      'Upload up to 25 photos',
      '1 video (max 2 mins)',
      'Upload up to 3 PDFs',
      'Featured placement in search & maps',
      'In-app messaging + AI assist',
      'Promo badge support',
      'Concierge "Preferred" tag'
    ],
    nextSteps: [
      'Upload a video tour of your community',
      'Add multiple PDFs (menus, activities, floor plans)',
      'Set up promotional badges',
      'Enable in-app messaging for instant communication',
      'Take advantage of your featured placement'
    ]
  },
  platinum: {
    name: 'Platinum',
    price: 349,
    features: [
      'All Featured features plus:',
      'Upload up to 50 photos',
      'Up to 3 videos (5 mins each)',
      'Unlimited PDFs',
      'Staff bios, care philosophy, menus',
      'Availability sync (form, spreadsheet, or API)',
      'Admin dashboard (multi-property view)',
      'Top Concierge Priority',
      'Monthly performance review call'
    ],
    nextSteps: [
      'Create comprehensive photo galleries',
      'Upload multiple video tours',
      'Add staff bios and care philosophy',
      'Set up availability synchronization',
      'Schedule your monthly performance review',
      'Explore the multi-property admin dashboard'
    ]
  }
};

const VENDOR_TIER_FEATURES: VendorTierFeatures = {
  basic: {
    name: 'Basic Listing',
    price: 99,
    features: [
      'Public listing in vendor directory',
      'Region-limited to 1 zip cluster',
      'Name, phone, category, description',
      'Optional $25 verified badge',
      'User reviews allowed',
      'Affiliate link support'
    ],
    nextSteps: [
      'Complete your vendor profile',
      'Add your service description',
      'Consider the verified badge option',
      'Monitor customer reviews',
      'Set up your affiliate link if applicable'
    ]
  },
  featured: {
    name: 'Featured Vendor',
    price: 249,
    features: [
      'All Basic features plus:',
      'Coverage across 5 regions',
      'Upload logo, brand colors, CTA button',
      'Basic analytics (views, clicks, leads)',
      'Post vendor promos',
      'Featured placement in vendor carousels',
      'Must have affiliate link for "Approved" badge'
    ],
    nextSteps: [
      'Upload your company logo',
      'Configure brand colors and CTA button',
      'Expand coverage to 5 regions',
      'Post promotional offers',
      'Monitor your analytics dashboard',
      'Set up affiliate link for Approved badge'
    ]
  },
  national: {
    name: 'National Partner',
    price: 499,
    features: [
      'All Featured features plus:',
      'Nationwide visibility (no geo cap)',
      'Banner rotation in major discovery areas',
      'Concierge system priority & routing',
      'AI-generated lead summaries + scoring',
      'Optional API or CSV lead passback',
      'Dedicated vendor microsite',
      'Quarterly performance report',
      'Optional vendor success call'
    ],
    nextSteps: [
      'Configure nationwide service areas',
      'Set up banner advertisements',
      'Enable AI lead scoring',
      'Configure lead passback (API or CSV)',
      'Customize your vendor microsite',
      'Schedule quarterly performance review'
    ]
  }
};

export async function sendCommunityWelcomeEmail(
  communityId: number,
  tierKey: string,
  customerEmail: string
) {
  try {
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community) {
      console.error('Community not found:', communityId);
      return;
    }

    const tierInfo = COMMUNITY_TIER_FEATURES[tierKey];
    if (!tierInfo) {
      console.error('Unknown tier:', tierKey);
      return;
    }

    const dashboardUrl = `https://myseniorvalet.com/community/${communityId}`;
    const portalUrl = `https://myseniorvalet.com/community-portal-integrated`;

    const msg = {
      to: customerEmail,
      from: 'hello@myseniorvalet.com',
      cc: ['william.cowell01@gmail.com'],
      subject: `🎉 Welcome to MySeniorValet ${tierInfo.name} - ${community.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to ${tierInfo.name}!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${community.name}</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">Your subscription is now active!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #4b5563; margin-top: 0;">🚀 Your New Features:</h3>
              <ul style="color: #6b7280; line-height: 1.8;">
                ${tierInfo.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fcd34d;">
              <h3 style="color: #92400e; margin-top: 0;">📋 Next Steps to Maximize Your Listing:</h3>
              <ol style="color: #b45309; line-height: 1.8;">
                ${tierInfo.nextSteps.map(step => `<li>${step}</li>`).join('')}
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Access Your Dashboard
              </a>
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                Need help? Visit our <a href="${portalUrl}" style="color: #6366f1;">Community Portal</a> or reply to this email.
              </p>
            </div>
            
            ${tierKey === 'standard' ? `
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #60a5fa;">
                <h4 style="color: #1e40af; margin-top: 0;">💡 Pro Tip:</h4>
                <p style="color: #1e40af; margin-bottom: 0;">
                  Communities with 10 photos receive 3x more inquiries than those with just 1 photo. 
                  Make sure to upload your full photo gallery!
                </p>
              </div>
            ` : ''}
            
            ${tierKey === 'featured' ? `
              <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #818cf8;">
                <h4 style="color: #4338ca; margin-top: 0;">🌟 Featured Benefits:</h4>
                <p style="color: #4338ca; margin-bottom: 0;">
                  Your community now appears at the top of search results and is highlighted on our map. 
                  You'll also receive priority support from our Concierge team!
                </p>
              </div>
            ` : ''}
            
            ${tierKey === 'platinum' ? `
              <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #c084fc;">
                <h4 style="color: #7c3aed; margin-top: 0;">👑 Platinum Excellence:</h4>
                <p style="color: #7c3aed;">
                  Welcome to our highest tier! Your dedicated success manager will contact you within 24 hours 
                  to schedule your onboarding call and monthly performance reviews.
                </p>
                <p style="color: #7c3aed; margin-bottom: 0;">
                  You now have access to our full suite of tools including API integration and multi-property management.
                </p>
              </div>
            ` : ''}
          </div>
          
          <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">MySeniorValet - Transparency in Senior Living</p>
            <p style="margin: 5px 0 0 0;">This is a transactional email regarding your subscription.</p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Welcome email sent to ${customerEmail} for ${tierInfo.name} tier`);

  } catch (error: any) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendVendorWelcomeEmail(
  vendorId: number,
  tierKey: string,
  customerEmail: string
) {
  try {
    const [vendor] = await db.select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);

    if (!vendor) {
      console.error('Vendor not found:', vendorId);
      return;
    }

    const tierInfo = VENDOR_TIER_FEATURES[tierKey];
    if (!tierInfo) {
      console.error('Unknown vendor tier:', tierKey);
      return;
    }

    const dashboardUrl = `https://myseniorvalet.com/vendor-dashboard`;
    const marketplaceUrl = `https://myseniorvalet.com/vendor-marketplace`;

    const msg = {
      to: customerEmail,
      from: 'hello@myseniorvalet.com',
      cc: ['william.cowell01@gmail.com'],
      subject: `🎉 Welcome to MySeniorValet ${tierInfo.name} - ${vendor.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome ${tierInfo.name} Partner!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${vendor.businessName}</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">Your vendor subscription is now active!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #4b5563; margin-top: 0;">🚀 Your Vendor Features:</h3>
              <ul style="color: #6b7280; line-height: 1.8;">
                ${tierInfo.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            
            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #34d399;">
              <h3 style="color: #065f46; margin-top: 0;">📋 Quick Start Guide:</h3>
              <ol style="color: #047857; line-height: 1.8;">
                ${tierInfo.nextSteps.map(step => `<li>${step}</li>`).join('')}
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
                Vendor Dashboard
              </a>
              <a href="${marketplaceUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Marketplace
              </a>
            </div>
            
            ${tierKey === 'basic' ? `
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #fbbf24;">
                <h4 style="color: #92400e; margin-top: 0;">💡 Grow Your Business:</h4>
                <p style="color: #92400e; margin-bottom: 0;">
                  Basic tier vendors who upgrade to Featured within 30 days see an average of 5x more leads. 
                  Consider expanding your reach!
                </p>
              </div>
            ` : ''}
            
            ${tierKey === 'featured' ? `
              <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #60a5fa;">
                <h4 style="color: #1e40af; margin-top: 0;">🌟 Featured Advantages:</h4>
                <p style="color: #1e40af; margin-bottom: 0;">
                  You now have coverage across 5 regions and featured placement in vendor carousels. 
                  Make sure to upload your logo and set up promotional offers to maximize visibility!
                </p>
              </div>
            ` : ''}
            
            ${tierKey === 'national' ? `
              <div style="background: #ede9fe; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #a78bfa;">
                <h4 style="color: #6d28d9; margin-top: 0;">🏆 National Partner Benefits:</h4>
                <p style="color: #6d28d9;">
                  Congratulations on becoming a National Partner! You now have:</p>
                <ul style="color: #6d28d9;">
                  <li>Unlimited nationwide coverage</li>
                  <li>Priority placement in all vendor searches</li>
                  <li>AI-powered lead scoring and routing</li>
                  <li>Dedicated account management</li>
                </ul>
                <p style="color: #6d28d9; margin-bottom: 0;">
                  Your account manager will contact you within 24 hours to optimize your setup.
                </p>
              </div>
            ` : ''}
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                Questions? Reply to this email or visit our <a href="${marketplaceUrl}" style="color: #6366f1;">Vendor Resources</a>.
              </p>
            </div>
          </div>
          
          <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">MySeniorValet Vendor Network</p>
            <p style="margin: 5px 0 0 0;">Monthly subscription: $${tierInfo.price}/month</p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Vendor welcome email sent to ${customerEmail} for ${tierInfo.name} tier`);

  } catch (error: any) {
    console.error('Failed to send vendor welcome email:', error);
  }
}