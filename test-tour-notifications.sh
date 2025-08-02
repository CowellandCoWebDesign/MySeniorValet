#!/bin/bash

echo "Creating test tour for notification testing..."
echo "All emails will be sent to hello@myseniorvalet.com in test mode"
echo ""

# Get tomorrow's date
TOMORROW=$(date -d "+1 day" +%Y-%m-%d)

# Create a test tour
RESPONSE=$(curl -s -X POST http://localhost:5000/api/tours/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "communityId": 264,
    "tourDate": "'$TOMORROW'",
    "tourTime": "14:00",
    "tourType": "in_person",
    "attendeeCount": 2,
    "contactName": "William Cowell",
    "contactEmail": "William.cowell01@gmail.com",
    "contactPhone": "555-0123",
    "specialRequests": "TEST TOUR - Testing notification system in private mode",
    "contactPreference": "email"
  }')

# Extract tour ID from response
TOUR_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -n "$TOUR_ID" ]; then
  echo "✅ Test tour created successfully!"
  echo "Tour ID: $TOUR_ID"
  echo "Date: $TOMORROW at 2:00 PM"
  echo ""
  echo "To test the notification system:"
  echo "1. Go to https://7a9daf58-f7c7-49c7-b4de-a709c13987b5-00-3l1b8tvcpa4bp.janeway.replit.dev/tours"
  echo "2. Find Tour ID $TOUR_ID and click 'Mark as Complete'"
  echo "3. Fill out the feedback form with:"
  echo "   - Overall impression"
  echo "   - Tour notes"
  echo "   - Rating (5 stars)"
  echo "   - Would recommend: Yes"
  echo "   - Likelihood: Very Likely"
  echo "   - ✓ Check all three sharing boxes"
  echo "4. Submit the feedback"
  echo ""
  echo "Emails will be sent to:"
  echo "- William.cowell01@gmail.com (your confirmation)"
  echo "- hello@myseniorvalet.com (instead of the community)"
  echo "- hello@myseniorvalet.com (CC copy)"
  echo ""
  echo "The community email will show [TEST MODE] in the subject"
else
  echo "❌ Failed to create test tour"
  echo "Response: $RESPONSE"
fi