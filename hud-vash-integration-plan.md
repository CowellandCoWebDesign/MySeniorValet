# HUD/VASH Integration Plan for TrueView

## Overview
Expand TrueView to include HUD-VASH (Veterans Affairs Supportive Housing) options, providing veterans with access to supportive housing resources alongside senior living communities.

## Implementation Plan

### 1. Database Schema Updates
- Add `facilityType` field to communities table to distinguish between:
  - 'Senior Living' (existing communities)
  - 'HUD-VASH' (veterans housing)
  - 'Affordable Senior' (mixed affordable/senior)
- Add `veteranPrograms` array field for specific programs:
  - 'HUD-VASH'
  - 'SSVF' (Supportive Services for Veteran Families)
  - 'GPD' (Grant and Per Diem)
  - 'VA CLC' (VA Community Living Centers)
- Add `eligibilityRequirements` field for veteran-specific criteria
- Add `hudProperties` JSON field for HUD-specific data:
  - PHA (Public Housing Authority) name
  - Voucher allocation numbers
  - Utilization rates
  - Contact information

### 2. Data Sources
- **HUD User API**: Fair Market Rent data, CHAS affordability data
- **HUD Open Data**: Public Housing Authority locations, voucher allocations
- **VA Facilities API**: VA medical centers with HUD-VASH offices
- **Manual Data Collection**: Contact information from PHAs

### 3. User Interface Updates
- Add "Veterans Housing" filter option to search
- Create dedicated Veterans Housing section on homepage
- Add eligibility checker tool for veterans
- Display HUD-VASH specific information:
  - Voucher availability
  - PHA contact information
  - Eligibility requirements
  - Application process

### 4. Search Enhancements
- Filter by veteran programs (HUD-VASH, SSVF, etc.)
- Show nearby VA medical centers
- Display transportation to VA facilities
- Highlight wheelchair accessible units

### 5. Data Integration Steps
1. Create HUD data scraper for PHAs by state
2. Integrate VA facility locations
3. Map HUD-VASH offices to service areas
4. Add contact information and application details

## Benefits
- Serves veteran population seeking housing
- Expands platform beyond senior living
- Addresses affordable housing needs
- Creates comprehensive housing resource