# Testing Tour Notification System

## Current Setup
- **TEST MODE ACTIVE**: All community notification emails redirect to hello@myseniorvalet.com
- Community emails will show [TEST MODE] in the subject line
- Your confirmation emails go to your actual email address

## How to Test

1. **Go to Tours Page**
   - Navigate to: `/tours` or click "Tours" in navigation

2. **Schedule a New Tour**
   - Click "Schedule New Tour"
   - Select any community (e.g., Heritage Hills of Folsom)
   - Fill in your details:
     - Name: William Cowell
     - Email: William.cowell01@gmail.com
     - Phone: (any number)
   - Select tomorrow's date and 2:00 PM
   - Add a note like "Testing notification system"
   - Submit

3. **Complete the Tour**
   - Find your new tour in the list
   - Click "Mark as Complete"
   - Fill feedback form:
     - Overall impression: "Excellent facility"
     - Tour notes: "Clean and well-maintained"
     - Rating: 5 stars
     - Would recommend: Yes
     - Likelihood: Very Likely
     - **IMPORTANT**: Check all 3 sharing boxes
   - Submit feedback

4. **What Happens**
   You'll receive emails at:
   - **William.cowell01@gmail.com**: Your confirmation email
   - **hello@myseniorvalet.com**: The community notification (redirected from actual community)
   - **hello@myseniorvalet.com**: CC copy of all emails

## Email Content

### Your Confirmation Email
- Subject: "Tour Completed - [Community Name]"
- Includes your feedback summary
- Privacy promise message
- CC'd to hello@myseniorvalet.com

### Community Email (Test Mode)
- Subject: "[TEST MODE] Tour Completed - William Cowell"
- Yellow banner showing it's in test mode
- Shows what community would normally receive
- Includes shared contact info and notes (if you checked the boxes)

## Important Notes
- NO real communities will be notified while in test mode
- Test mode remains active until you deploy
- All "community" emails go to hello@myseniorvalet.com instead
- The system logs show which emails were sent

Once you're satisfied with testing, we can remove test mode for production deployment.