# Senior Living Database Expansion Plan

## Current Coverage Gaps

### 1. **Senior Mobile Home Parks / Manufactured Home Communities**
- 55+ mobile home parks
- Senior manufactured home communities
- Retirement mobile home villages
- **Estimated Missing: 5,000-8,000 communities nationwide**

### 2. **Active Adult Communities (55+)**
- Age-restricted communities without care services
- Active lifestyle communities
- Golf course communities
- Resort-style retirement communities
- **Estimated Missing: 3,000-5,000 communities**

### 3. **Senior RV Parks & Resorts**
- Retirement RV parks
- Snowbird communities
- Senior RV co-ops
- **Estimated Missing: 1,000-2,000 parks**

### 4. **Naturally Occurring Retirement Communities (NORCs)**
- Apartment buildings with high senior populations
- Condo complexes popular with seniors
- **Estimated Missing: 2,000+ locations**

### 5. **Senior Co-Housing & Intentional Communities**
- Senior co-ops
- Shared housing arrangements
- Intentional retirement communities
- **Estimated Missing: 500-1,000 communities**

### 6. **Continuing Care at Home Programs**
- CCAH providers
- Life Plan at Home programs
- **Estimated Missing: 100-200 programs**

## Data Sources to Target

### Government Sources
1. **HUD Section 202 Housing** - Senior-specific subsidized housing
2. **USDA Rural Development** - Rural senior housing programs
3. **State Manufactured Housing Directories**
4. **County Tax Assessor Records** - Age-restricted communities
5. **Zoning Records** - 55+ designated areas

### Industry Directories
1. **Manufactured Housing Institute (MHI)**
2. **National Association of RV Parks and Campgrounds (ARVC)**
3. **55Places.com Database**
4. **Active Adult Living Directory**
5. **Where You Live Matters (WYLM)**

### Real Estate Sources
1. **MLS Data** - 55+ community listings
2. **Zillow/Realtor.com** - Age-restricted communities
3. **NewHomeSource.com** - New 55+ developments

### Specialized Databases
1. **MHVillage.com** - Largest mobile home park directory
2. **SeniorHousingNet.com**
3. **RetirementLiving.com**
4. **Caring.com** - Broader senior housing listings

## Implementation Strategy

### Phase 1: Mobile Home & Manufactured Communities (Month 1)
- Scrape MHVillage.com for 55+ designated parks
- Integrate state manufactured housing directories
- Cross-reference with HUD data

### Phase 2: Active Adult Communities (Month 2)
- Partner with 55Places.com for data access
- Scrape major homebuilder sites (Del Webb, Lennar, etc.)
- Integrate MLS age-restricted community data

### Phase 3: RV & Alternative Housing (Month 3)
- ARVC member directory integration
- Good Sam Club senior parks
- Escapees RV Club co-ops

### Phase 4: Data Enrichment (Ongoing)
- Add community amenities specific to each type
- Pricing models (lot rent, HOA fees, buy-in costs)
- Age restrictions and qualification requirements
- Pet policies
- Social activities and clubs

## Database Schema Updates Needed

```sql
-- Add new community types
ALTER TABLE communities 
ADD COLUMN community_subtype TEXT CHECK (community_subtype IN (
  'mobile_home_park',
  'manufactured_home_community',
  'active_adult_55plus',
  'rv_retirement_park',
  'senior_coop',
  'norc',
  'ccah_program',
  'traditional_assisted_living',
  'independent_living_facility'
));

-- Add specific fields for these communities
ALTER TABLE communities
ADD COLUMN age_restriction INTEGER, -- Minimum age requirement
ADD COLUMN lot_rent DECIMAL(10,2), -- For mobile home parks
ADD COLUMN hoa_fee DECIMAL(10,2), -- For condo/home communities
ADD COLUMN buy_in_required BOOLEAN DEFAULT FALSE,
ADD COLUMN rental_options BOOLEAN DEFAULT TRUE,
ADD COLUMN purchase_options BOOLEAN DEFAULT FALSE,
ADD COLUMN allows_rvs BOOLEAN DEFAULT FALSE,
ADD COLUMN golf_course BOOLEAN DEFAULT FALSE,
ADD COLUMN gated_community BOOLEAN DEFAULT FALSE;
```

## API Integrations to Pursue

1. **MHVillage API** - $500/month for full access
2. **55Places Data Feed** - Custom pricing
3. **Zillow Bridge API** - For age-restricted listings
4. **Google Places API** - Enhanced categorization

## Expected Impact

- **Current Database**: 25,326 communities
- **Projected After Expansion**: 40,000-45,000 communities
- **Coverage Improvement**: 60-80% increase
- **User Value**: Complete picture of ALL senior living options

## Budget Estimate

- API Access: $2,000-3,000/month
- Development Time: 3-4 months
- Data Cleaning/Verification: $5,000
- **Total Investment**: $15,000-20,000

## Success Metrics

1. Total communities added by type
2. Geographic coverage improvement
3. User engagement with new listings
4. Search query match rate improvement
5. Revenue from expanded inventory

Would you like me to start implementing Phase 1 with mobile home communities?