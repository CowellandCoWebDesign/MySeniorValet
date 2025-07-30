#!/bin/bash

echo "🔐 MySeniorValet Admin Password Reset"
echo "===================================="

# Generate a secure password
NEW_PASSWORD="MySeniorValet2025!"

# Hash the password using Node.js bcrypt
HASHED_PASSWORD=$(node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('$NEW_PASSWORD', 10).then(hash => console.log(hash));
" 2>/dev/null)

if [ -z "$HASHED_PASSWORD" ]; then
  echo "❌ Error: Failed to hash password"
  exit 1
fi

echo "✅ Setting new password for william.cowell01@gmail.com..."

# Update the password in the database
psql "$DATABASE_URL" << EOF
UPDATE users 
SET password = '$HASHED_PASSWORD' 
WHERE email = 'william.cowell01@gmail.com';
EOF

echo -e "\n✅ Password reset complete!"
echo -e "\n📧 Email: william.cowell01@gmail.com"
echo "🔑 New Password: $NEW_PASSWORD"
echo -e "\n🚀 You can now login at:"
echo "   https://your-app.replit.app/login"
echo -e "\n⚡ Quick test command:"
echo "   curl -X POST http://localhost:5000/api/auth/quick-login -H 'Content-Type: application/json' -d '{\"email\":\"william.cowell01@gmail.com\",\"password\":\"$NEW_PASSWORD\"}'"