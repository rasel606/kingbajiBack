/**
 * Integration Guide: Frontend to Backend
 * 
 * This guide explains how the frontend connects to the backend Legal API.
 */

// ============================================
// 1. UPDATE FRONTEND API SERVICE
// ============================================

// File: src/api/terms.js
// Change the USE_MOCK_DATA flag from true to false:

const USE_MOCK_DATA = false; // ← Change from true to false to use backend

// ============================================
// 2. UPDATE BACKEND CONFIGURATION
// ============================================

// Ensure these environment variables are set:
// MONGODB_URI=your_mongodb_connection_string
// API_BASE_URL=http://localhost:5000 (for development)

// ============================================
// 3. SEED INITIAL DATA
// ============================================

// Run this command to populate the database:
// node src/scripts/seedLegalContent.js

// ============================================
// 4. FRONTEND API ENDPOINTS MAPPING
// ============================================

// Frontend Hook: useTermsContent('terms', 'en')
// ↓
// Makes API call to:
// GET http://localhost:5000/api/legal/terms?lang=en
// ↓
// Backend Handler: legalController.getLegalContent()

// Frontend Hook: useTermsContent('privacy', 'en')
// ↓
// Makes API call to:
// GET http://localhost:5000/api/legal/privacy?lang=en

// ============================================
// 5. EXAMPLE: COMPLETE FLOW
// ============================================

// User visits: http://localhost:3000/terms

// 1. TermsAndConditions.jsx component loads
// 2. Calls useTermsContent('terms')
// 3. Hook calls getTermsContent('terms', 'en') from api/terms.js
// 4. API service calls: GET /api/legal/terms?lang=en
// 5. Backend receives request and queries database
// 6. Returns legal content with HTML
// 7. TermsLayout.jsx uses dangerouslySetInnerHTML to render
// 8. User sees formatted terms page

// ============================================
// 6. FAQ FLOW
// ============================================

// User visits: http://localhost:3000/faq

// 1. FAQ.jsx component loads
// 2. Calls getFAQItems() from api/terms.js
// 3. API calls: GET /api/legal/faq?category=all&lang=en
// 4. Backend queries FAQ collection
// 5. Returns array of FAQ items
// 6. User can:
//    - See all FAQs
//    - Search: calls GET /api/legal/faq/search?q=query
//    - Filter by category
//    - Vote: POST /api/legal/faq/:id/vote

// ============================================
// 7. ADMIN CONTENT MANAGEMENT
// ============================================

// Admin updates terms at: /admin/content/terms

// 1. Admin clicks "Edit Terms"
// 2. Form loads current content via GET /api/legal/terms
// 3. Admin edits and submits
// 4. Frontend calls POST /api/legal/content with:
//    {
//      type: 'terms',
//      title: 'Terms and Conditions',
//      content: '<h2>...</h2><p>...</p>',
//      metaDescription: '...',
//      language: 'en'
//    }
// 5. Backend:
//    - Saves current version to history
//    - Updates content
//    - Increments version number
// 6. Admin sees success message
// 7. Frontend updates immediately
// 8. Users see new content on their next load

// ============================================
// 8. MULTI-LANGUAGE SETUP
// ============================================

// Backend accepts language parameter in all requests:
// GET /api/legal/terms?lang=en
// GET /api/legal/terms?lang=bn
// GET /api/legal/terms?lang=hi

// Frontend can switch languages:

import { useState } from 'react';
import useTermsContent from '@/hooks/useTermsContent';

function TermsPage() {
  const [language, setLanguage] = useState('en');
  const { content, loading } = useTermsContent('terms', language);

  return (
    <div>
      <select onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="bn">Bengali</option>
        <option value="hi">Hindi</option>
      </select>
      
      {/* Content updates when language changes */}
    </div>
  );
}

// ============================================
// 9. ERROR HANDLING
// ============================================

// Frontend handles three main error scenarios:

// 1. USE_MOCK_DATA = true
//    - Uses local mock data
//    - No API calls
//    - Good for testing without backend

// 2. USE_MOCK_DATA = false (Backend ready)
//    - Makes real API calls
//    - If backend is offline/slow, shows error
//    - User sees: "Error Loading Content" message

// 3. Try/Catch in API service
//    - Catches network errors
//    - Catches JSON parsing errors
//    - Catches 404/500 errors
//    - Passes error to component

// Example error flow:
// const { content, loading, error } = useTermsContent('terms');
// if (error) {
//   return <div>{error}</div>;
// }

// ============================================
// 10. TESTING THE INTEGRATION
// ============================================

// Step 1: Start Backend
// cd e:/megabaji-2/backend
// npm start

// Step 2: Verify Backend is Running
// curl http://localhost:5000/api/legal/pages
// Should return JSON with legal pages

// Step 3: Seed Data if Needed
// node src/scripts/seedLegalContent.js

// Step 4: Update Frontend API Service
// Edit src/api/terms.js
// Change: const USE_MOCK_DATA = false;

// Step 5: Start Frontend
// cd e:/megabaji-2/png71-front
// npm start

// Step 6: Test Pages
// Visit: http://localhost:3000/terms
// Visit: http://localhost:3000/faq
// Should show API content

// Step 7: Monitor Backend Logs
// Should see: GET /api/legal/terms 200

// ============================================
// 11. POSTMAN TESTING
// ============================================

// Create a Postman collection:

// Public Endpoints (No Auth)
// ├── GET /api/legal/pages
// ├── GET /api/legal/terms?lang=en
// ├── GET /api/legal/faq
// ├── GET /api/legal/faq/search?q=deposit
// └── POST /api/legal/faq/:id/vote

// Admin Endpoints (With Auth)
// ├── POST /api/legal/content
// ├── GET /api/legal/terms/versions
// ├── PUT /api/legal/terms/restore/1
// ├── POST /api/legal/faq
// ├── PUT /api/legal/faq/:id
// └── DELETE /api/legal/faq/:id

// ============================================
// 12. PRODUCTION DEPLOYMENT
// ============================================

// Environment Variables to Set:

// Backend (.env):
// MONGODB_URI=your_production_mongodb_url
// NODE_ENV=production
// API_PORT=5000

// Frontend (.env):
// REACT_APP_API_BASE_URL=https://api.redbaji.com
// REACT_APP_USE_MOCK_DATA=false

// ============================================
// 13. PERFORMANCE CONSIDERATIONS
// ============================================

// Backend:
// - Indexes on: type, language, category
// - Full text search on: content, question, answer
// - Pagination for large datasets
// - Caching with Redis if needed

// Frontend:
// - Hook caches content in state
// - useEffect with dependency array
// - Error boundary for graceful degradation
// - Loading states with skeletons

// ============================================
// 14. COMMON ISSUES & SOLUTIONS
// ============================================

// Issue: "Cannot GET /api/legal/terms"
// Solution: Ensure backend is running and routes are registered

// Issue: "USE_MOCK_DATA is still true"
// Solution: Change in src/api/terms.js line 5

// Issue: "CORS error"
// Solution: Backend CORS settings may need adjustment

// Issue: "Database connection error"
// Solution: Check MONGODB_URI in backend .env

// Issue: "Empty FAQ page"
// Solution: Run seed script: node src/scripts/seedLegalContent.js

// ============================================
// 15. MAINTENANCE
// ============================================

// Regular Tasks:
// - Monitor API response times
// - Check database size
// - Review search queries
// - Update content as needed
// - Backup database

// Monthly:
// - Review analytics on page views
// - Check FAQ voting/feedback
// - Update outdated content
// - Test all links in content

// ============================================
// QUICK CHECKLIST
// ============================================

// ☐ Backend API endpoints created
// ☐ Models and controllers implemented
// ☐ Routes registered in app.js
// ☐ Database seeded with initial data
// ☐ Frontend API service configured
// ☐ Mock data disabled
// ☐ All pages tested
// ☐ Admin endpoints tested with auth
// ☐ Error handling verified
// ☐ Performance optimized
// ☐ Documentation complete
// ☐ Ready for production

// ============================================

module.exports = {
  integration_complete: true,
  version: '1.0.0',
  date: '2026-03-04'
};
