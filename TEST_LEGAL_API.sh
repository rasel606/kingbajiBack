#!/bin/bash
# Legal & Terms API - Testing Guide
# 
# This script provides curl commands for testing the Legal & Terms API
# Run commands one by one to test different endpoints

echo "=================================="
echo "Legal & Terms API - Testing Guide"
echo "=================================="
echo ""

# Configuration
API_BASE="http://localhost:5000/api/legal"
ADMIN_TOKEN="your_admin_token_here"

echo "📝 Make sure:"
echo "  1. Backend is running on http://localhost:5000"
echo "  2. Database is seeded: node src/scripts/seedLegalContent.js"
echo "  3. Replace ADMIN_TOKEN with actual token"
echo ""

# ============================================
# PUBLIC ENDPOINTS - NO AUTH REQUIRED
# ============================================

echo "✅ PUBLIC ENDPOINTS (No Authorization Required)"
echo ""

# 1. Get all legal pages
echo "1️⃣ Get All Legal Pages"
echo "Command:"
echo "curl -X GET '$API_BASE/pages?lang=en'"
echo ""
echo "Expected Response:"
echo '{
  "success": true,
  "count": 6,
  "data": [
    { "id": "terms", "title": "Terms and Conditions", ... },
    ...
  ]
}'
echo ""
echo "---"
echo ""

# 2. Get Terms
echo "2️⃣ Get Terms and Conditions"
echo "Command:"
echo "curl -X GET '$API_BASE/terms?lang=en'"
echo ""
echo "Expected Response:"
echo '{
  "success": true,
  "data": {
    "_id": "...",
    "type": "terms",
    "title": "Terms and Conditions",
    "content": "<h2>1. Agreement</h2>...",
    "version": 1,
    ...
  }
}'
echo ""
echo "---"
echo ""

# 3. Get Privacy Policy
echo "3️⃣ Get Privacy Policy"
echo "Command:"
echo "curl -X GET '$API_BASE/privacy?lang=en'"
echo ""
echo "---"
echo ""

# 4. Get FAQ Items
echo "4️⃣ Get All FAQ Items"
echo "Command:"
echo "curl -X GET '$API_BASE/faq?category=all&lang=en'"
echo ""
echo "Expected Response:"
echo '{
  "success": true,
  "count": 12,
  "data": {
    "items": [
      {
        "_id": "...",
        "category": "account",
        "question": "How do I create an account?",
        "answer": "<p>...</p>",
        "order": 1,
        "views": 150,
        "helpfulVotes": 45,
        "notHelpfulVotes": 2
      },
      ...
    ]
  }
}'
echo ""
echo "---"
echo ""

# 5. Get FAQ by Category
echo "5️⃣ Get FAQ Items by Category"
echo "Command:"
echo "curl -X GET '$API_BASE/faq?category=deposit&lang=en'"
echo ""
echo "Categories: account | deposit | withdrawal | games | bonus | security | technical"
echo ""
echo "---"
echo ""

# 6. Search Legal Content
echo "6️⃣ Search Legal Content"
echo "Command:"
echo 'curl -X GET "$API_BASE/search?q=deposit&lang=en"'
echo ""
echo "Expected Response:"
echo '{
  "success": true,
  "count": 2,
  "results": [
    {
      "type": "terms",
      "title": "Terms and Conditions",
      "snippet": "...minimum deposit amount requirements...",
      "path": "/terms"
    }
  ]
}'
echo ""
echo "---"
echo ""

# 7. Search FAQ
echo "7️⃣ Search FAQ Items"
echo "Command:"
echo 'curl -X GET "$API_BASE/faq/search?q=deposit&category=deposit&lang=en"'
echo ""
echo "---"
echo ""

# 8. Get Single FAQ Item
echo "8️⃣ Get Single FAQ Item"
echo "Command:"
echo 'curl -X GET "$API_BASE/faq/item/{id}"'
echo "Replace {id} with actual FAQ item ID"
echo ""
echo "---"
echo ""

# 9. Vote on FAQ
echo "9️⃣ Vote on FAQ Item"
echo "Command:"
echo 'curl -X POST "$API_BASE/faq/{id}/vote" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d "{\"helpful\": true}"'
echo ""
echo "Replace {id} with actual FAQ item ID"
echo ""
echo "Expected Response:"
echo '{
  "success": true,
  "message": "Vote recorded",
  "data": {
    "helpfulVotes": 46,
    "notHelpfulVotes": 2,
    "totalVotes": 48,
    "helpfulPercentage": "95.83"
  }
}'
echo ""
echo ""

# ============================================
# ADMIN ENDPOINTS - AUTH REQUIRED
# ============================================

echo "🔐 ADMIN ENDPOINTS (Authorization Required)"
echo ""
echo "All admin endpoints need this header:"
echo 'Authorization: Bearer '<admin_token><'
echo ""

# 10. Create/Update Legal Content
echo "1️⃣ Create or Update Legal Content"
echo "Command:"
echo 'curl -X POST "$API_BASE/content" \'
echo '  -H "Content-Type: application/json" \'
echo '  -H "Authorization: Bearer <ADMIN_TOKEN>" \'
echo '  -d "{'
echo '    \"type\": \"terms\","'
echo '    \"title\": \"Terms and Conditions\","'
echo '    \"content\": \"<h2>New Terms</h2><p>Updated content</p>\","'
echo '    \"metaDescription\": \"Read our terms\","'
echo '    \"language\": \"en\"'
echo '  }"'
echo ""
echo "---"
echo ""

# 11. Get Legal Content Versions
echo "2️⃣ Get Legal Content Versions (History)"
echo "Command:"
echo 'curl -X GET "$API_BASE/terms/versions?lang=en" \'
echo '  -H "Authorization: Bearer <ADMIN_TOKEN>"'
echo ""
echo "---"
echo ""

# 12. Restore Previous Version
echo "3️⃣ Restore Previous Version"
echo "Command:"
echo 'curl -X PUT "$API_BASE/terms/restore/1?lang=en" \'
echo '  -H "Authorization: Bearer <ADMIN_TOKEN>"'
echo ""
echo "Replace 1 with desired version number"
echo ""
echo "---"
echo ""

# 13. Toggle Legal Content Status
echo "4️⃣ Toggle Legal Content (Activate/Deactivate)"
echo "Command:"
echo 'curl -X PATCH "$API_BASE/terms/toggle?lang=en" \'
echo '  -H "Authorization: Bearer <ADMIN_TOKEN>"'
echo ""
echo "---"
echo ""

# 14. Create FAQ
echo "5️⃣ Create FAQ Item"
echo "Command:"
echo 'curl -X POST "$API_BASE/faq" \'
echo '  -H "Content-Type: application/json" \'
echo '  -H "Authorization: Bearer <ADMIN_TOKEN>" \'
echo '  -d "{'
echo '    \"category\": \"account\","'
echo '    \"question\": \"How do I create an account?\","'
echo '    \"answer\": \"<p>Click Sign Up and fill in your details</p>\","'
echo '    \"keywords\": [\"account\", \"signup\"],"'
echo '    \"order\": 1"'
echo '  }"'
echo ""
echo "---"
echo ""

# 15. Update FAQ
echo "6️⃣ Update FAQ Item"
echo "Command:"
echo 'curl -X PUT "$API_BASE/faq/{id}" \'
echo '  -H "Content-Type: application/json" \'
echo '  -H "Authorization: Bearer <ADMIN_TOKEN>" \'
echo '  -d "{'
echo '    \"question\": \"Updated question?\","'
echo '    \"answer\": \"<p>Updated answer</p>\","'
echo '    \"isFeatured\": true"'
echo '  }"'
echo ""
echo "Replace {id} with actual FAQ item ID"
echo ""
echo "---"
echo ""

# 16. Delete FAQ
echo "7️⃣ Delete FAQ Item"
echo "Command:"
echo 'curl -X DELETE "$API_BASE/faq/{id}" \'
echo '  -H "Authorization: Bearer <ADMIN_TOKEN>"'
echo ""
echo "Replace {id} with actual FAQ item ID"
echo ""
echo "---"
echo ""

# 17. Toggle FAQ Status
echo "8️⃣ Toggle FAQ Item Status"
echo "Command:"
echo 'curl -X PATCH "$API_BASE/faq/{id}/toggle" \'
echo '  -H "Authorization: Bearer <ADMIN_TOKEN>"'
echo ""
echo "---"
echo ""

# 18. Bulk Update FAQ Order
echo "9️⃣ Bulk Update FAQ Item Order"
echo "Command:"
echo 'curl -X PUT "$API_BASE/faq/bulk/order" \'
echo '  -H "Content-Type: application/json" \'
echo '  -H "Authorization: Bearer <ADMIN_TOKEN>" \'
echo '  -d "{'
echo '    \"items\": ['
echo '      { \"id\": \"id1\", \"order\": 1 },'
echo '      { \"id\": \"id2\", \"order\": 2 },'
echo '      { \"id\": \"id3\", \"order\": 3 }'
echo '    ]'
echo '  }"'
echo ""
echo ""

# ============================================
# TESTING WITH VARIABLES
# ============================================

echo "💡 TIPS FOR TESTING"
echo ""
echo "1. Save Admin Token:"
echo '   TOKEN="your_jwt_token_from_login"'
echo ""
echo "2. Use Variable in curl:"
echo '   curl -X GET "$API_BASE/terms" \'
echo '     -H "Authorization: Bearer $TOKEN"'
echo ""
echo "3. Pretty print JSON response (install jq):"
echo '   curl -s "$API_BASE/pages" | jq .'
echo ""
echo "4. Check HTTP status:"
echo '   curl -w "\nStatus: %{http_code}\n" "$API_BASE/pages"'
echo ""
echo "5. See response headers:"
echo '   curl -i "$API_BASE/pages"'
echo ""
echo "6. Test timeout:"
echo '   curl --max-time 5 "$API_BASE/pages"'
echo ""

# ============================================
# POSTMAN IMPORT
# ============================================

echo ""
echo "📮 POSTMAN COLLECTION"
echo ""
echo "Create in Postman:"
echo ""
echo "1. New Collection: 'Legal API'"
echo ""
echo "2. Add Requests:"
echo "   Folder: Public"
echo "   ├── GET /api/legal/pages"
echo "   ├── GET /api/legal/terms"
echo "   ├── GET /api/legal/faq"
echo "   ├── GET /api/legal/search"
echo "   └── POST /api/legal/faq/:id/vote"
echo ""
echo "   Folder: Admin"
echo "   ├── POST /api/legal/content"
echo "   ├── PUT /api/legal/faq/:id"
echo "   ├── DELETE /api/legal/faq/:id"
echo "   └── ... (all admin endpoints)"
echo ""
echo "3. Add Variables:"
echo "   base_url: http://localhost:5000/api/legal"
echo "   admin_token: <your_token>"
echo ""
echo "4. Use in requests:"
echo '   {{base_url}}/terms'
echo '   Header: Authorization: Bearer {{admin_token}}'
echo ""

# ============================================
# VERIFY SETUP
# ============================================

echo ""
echo "✅ VERIFICATION COMMANDS"
echo ""
echo "Run these to verify everything is working:"
echo ""
echo "1. Check Backend Running:"
echo "   curl -s http://localhost:5000/api/legal/pages"
echo ""
echo "2. Check Data Seeded:"
echo "   curl -s http://localhost:5000/api/legal/terms | grep -c '\"type\"'"
echo ""
echo "3. Count FAQ Items:"
echo "   curl -s http://localhost:5000/api/legal/faq | jq '.count'"
echo ""
echo "4. Search Test:"
echo '   curl -s "http://localhost:5000/api/legal/search?q=deposit"'
echo ""

echo ""
echo "📖 For complete documentation:"
echo "   See: LEGAL_API_DOCUMENTATION.md"
echo "   Or: LEGAL_API_QUICK_REFERENCE.md"
echo ""
echo "✅ Testing guide complete!"
