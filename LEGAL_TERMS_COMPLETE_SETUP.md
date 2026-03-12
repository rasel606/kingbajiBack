# Legal & Terms Pages - Complete Backend-Frontend Integration

Complete implementation of Terms & Conditions pages with backend API and frontend components.

## 📦 What's Been Created

### Backend (E:\megabaji-2\backend)

#### Models
- ✅ `src/models/LegalContent.js` - Schema for legal pages with versioning
- ✅ `src/models/FAQ.js` - Schema for FAQ items with voting

#### Controllers
- ✅ `src/controllers/legalController.js` - All business logic (700+ lines)
  - Legal Content CRUD operations
  - Version history management
  - FAQ management
  - Search functionality
  - Voting system

#### Routes
- ✅ `src/router/legalRoutes.js` - API endpoints
  - 7 public endpoints (no auth)
  - 9 admin endpoints (with auth)

#### Database
- ✅ `src/scripts/seedLegalContent.js` - Initial data seeding
  - 6 legal content items
  - 12 FAQ items

#### Configuration
- ✅ Updated `app.js` - Routes registered

#### Documentation
- ✅ `LEGAL_API_DOCUMENTATION.md` - Complete API reference
- ✅ `LEGAL_API_FRONTEND_INTEGRATION.js` - Integration guide

---

### Frontend (E:\megabaji-2\png71-front/src)

#### Components
- ✅ `components/pages/Terms/TermsLayout.jsx` - Reusable layout
- ✅ `components/pages/Terms/TermsAndConditions.jsx`
- ✅ `components/pages/Terms/PrivacyPolicy.jsx`
- ✅ `components/pages/Terms/RulesAndRegulations.jsx`
- ✅ `components/pages/Terms/ResponsibleGambling.jsx`
- ✅ `components/pages/Terms/AboutUs.jsx`
- ✅ `components/pages/Terms/ContactUs.jsx`
- ✅ `components/pages/Terms/FAQ.jsx` - With search, filtering, voting

#### Styles
- ✅ `components/pages/Terms/TermsLayout.css`
- ✅ `components/pages/Terms/ContactUs.css`
- ✅ `components/pages/Terms/FAQ.css`

#### API Service
- ✅ `api/terms.js` - API calls with mock data support
  - Can toggle between mock data and real API
  - All endpoints implemented
  - Error handling
  - Search functionality

#### Custom Hooks
- ✅ `hooks/useTermsContent.js` - Fetch legal content
- ✅ Updated `hooks/index.js` - Export hook

#### Data
- ✅ `data/legalContent.js` - Mock data for testing

#### Routing
- ✅ `routing/termsRoutes.js` - Route configuration
  - 7 routes with metadata
  - Ready to integrate

#### Examples
- ✅ `components/examples/TermsExamples.jsx` - 10 usage examples

#### Documentation
- ✅ `components/pages/Terms/README.md` - Complete guide
- ✅ `components/pages/Terms/SETUP_GUIDE.md` - Setup instructions

---

## 🚀 Quick Start

### Backend Setup

1. **Install dependencies (if not already installed)**
   ```bash
   cd e:\megabaji-2\backend
   npm install
   ```

2. **Seed the database**
   ```bash
   node src/scripts/seedLegalContent.js
   ```
   
   Expected output:
   ```
   ✅ MongoDB connected
   ✅ Cleared existing data
   ✅ Seeded 6 legal content items
   ✅ Seeded 12 FAQ items
   ✅ Database seeding completed successfully!
   ```

3. **Verify routes registered**
   - Check `app.js` line 68
   - Should see: `const legalRoutes = require('./src/router/legalRoutes');`
   - And: `app.use('/api/legal', legalRoutes);`

4. **Start backend server**
   ```bash
   npm start
   # Server runs on http://localhost:5000
   ```

5. **Test API endpoint**
   ```bash
   curl http://localhost:5000/api/legal/pages
   # Should return JSON with legal pages
   ```

### Frontend Setup

1. **Update API configuration**
   ```bash
   # File: src/api/terms.js
   # Change line 5 from:
   const USE_MOCK_DATA = true;
   
   # To:
   const USE_MOCK_DATA = false;
   ```

2. **Add routes to your app**
   ```javascript
   // In your App.js or main routing file
   import { termsRoutes } from './routing/termsRoutes';
   
   // In your Routes component:
   {termsRoutes.map(route => (
     <Route 
       key={route.path} 
       path={route.path} 
       element={<route.component />} 
     />
   ))}
   ```

3. **Update footer links**
   ```javascript
   // In Footer.jsx
   import { Link } from 'react-router-dom';
   
   <footer>
     <Link to="/terms">Terms & Conditions</Link>
     <Link to="/privacy">Privacy Policy</Link>
     <Link to="/faq">FAQ</Link>
     <Link to="/contact">Contact Us</Link>
     {/* ... more links */}
   </footer>
   ```

4. **Start frontend**
   ```bash
   cd e:\megabaji-2\png71-front
   npm start
   # App runs on http://localhost:3000
   ```

5. **Test pages**
   - http://localhost:3000/terms
   - http://localhost:3000/privacy
   - http://localhost:3000/faq
   - http://localhost:3000/contact

---

## 📊 API Endpoints

### Public Endpoints (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/legal/pages` | Get all available legal pages |
| GET | `/api/legal/:type` | Get specific legal content |
| GET | `/api/legal/search` | Search legal content |
| GET | `/api/legal/faq` | Get FAQ items |
| GET | `/api/legal/faq/item/:id` | Get single FAQ item |
| GET | `/api/legal/faq/search` | Search FAQ items |
| POST | `/api/legal/faq/:id/vote` | Vote on FAQ item |

### Admin Endpoints (Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/legal/content` | Create/update legal content |
| GET | `/api/legal/:type/versions` | Get version history |
| PUT | `/api/legal/:type/restore/:version` | Restore previous version |
| PATCH | `/api/legal/:type/toggle` | Toggle content status |
| POST | `/api/legal/faq` | Create FAQ item |
| PUT | `/api/legal/faq/:id` | Update FAQ item |
| DELETE | `/api/legal/faq/:id` | Delete FAQ item |
| PATCH | `/api/legal/faq/:id/toggle` | Toggle FAQ status |
| PUT | `/api/legal/faq/bulk/order` | Reorder FAQ items |

---

## 📝 File Structure

```
Backend (e:\megabaji-2\backend\src)
├── models/
│   ├── LegalContent.js ✅
│   └── FAQ.js ✅
├── controllers/
│   └── legalController.js ✅
├── router/
│   └── legalRoutes.js ✅
└── scripts/
    └── seedLegalContent.js ✅

Frontend (e:\megabaji-2\png71-front\src)
├── components/pages/Terms/
│   ├── TermsLayout.jsx ✅
│   ├── TermsLayout.css ✅
│   ├── TermsAndConditions.jsx ✅
│   ├── PrivacyPolicy.jsx ✅
│   ├── RulesAndRegulations.jsx ✅
│   ├── ResponsibleGambling.jsx ✅
│   ├── AboutUs.jsx ✅
│   ├── ContactUs.jsx ✅
│   ├── ContactUs.css ✅
│   ├── FAQ.jsx ✅
│   ├── FAQ.css ✅
│   ├── index.js ✅
│   ├── README.md ✅
│   └── SETUP_GUIDE.md ✅
├── api/
│   └── terms.js ✅
├── hooks/
│   ├── useTermsContent.js ✅
│   └── index.js (updated) ✅
├── data/
│   └── legalContent.js ✅
├── routing/
│   └── termsRoutes.js ✅
└── components/examples/
    └── TermsExamples.jsx ✅
```

---

## 🔄 Data Flow

```
User Request
    ↓
Frontend Component (e.g., TermsAndConditions.jsx)
    ↓
useTermsContent Hook
    ↓
API Service (src/api/terms.js)
    ↓
Backend Route Handler (/api/legal/:type)
    ↓
Controller Method (legalController.getLegalContent)
    ↓
Database Query (LegalContent Model)
    ↓
Response (JSON)
    ↓
Frontend Renders with TermsLayout Component
    ↓
User Sees Page with HTML Content
```

---

## 🔐 Security Features

- ✅ Admin endpoints protected with authentication middleware
- ✅ Input validation on all endpoints
- ✅ CORS configured
- ✅ MongoDB sanitization
- ✅ Error handling with proper status codes
- ✅ No sensitive data in responses

---

## 🧪 Testing

### Manual Testing

1. **Test Public Endpoints**
   ```bash
   # Get all legal pages
   curl http://localhost:5000/api/legal/pages
   
   # Get terms
   curl http://localhost:5000/api/legal/terms?lang=en
   
   # Get FAQ
   curl http://localhost:5000/api/legal/faq
   
   # Search
   curl "http://localhost:5000/api/legal/search?q=deposit"
   ```

2. **Test Frontend Pages**
   - Visit each page in browser
   - Check for proper rendering
   - Test search functionality
   - Test FAQ voting
   - Check responsive design

3. **Test Admin Endpoints**
   - Use Postman with auth token
   - Create/update content
   - Check version history
   - Test restore functionality

### Automated Testing

Jest tests ready to add (examples in `TermsExamples.jsx`)

---

## 📊 Database Schema

### LegalContent

```javascript
{
  type: String (enum),           // terms, privacy, rules, etc.
  title: String,                 // Page title
  content: String,               // HTML content
  language: String,              // en, bn, hi, es, fr
  metaDescription: String,       // SEO meta description
  metaKeywords: String,          // SEO keywords
  version: Number,               // Current version
  versions: Array,               // Previous versions
  updatedBy: ObjectId,           // Admin who updated
  isActive: Boolean,             // Show/hide page
  createdAt: Date,
  updatedAt: Date
}
```

### FAQ

```javascript
{
  category: String,              // account, deposit, games, etc.
  question: String,              // FAQ question
  answer: String,                // HTML answer
  language: String,              // en, bn, hi, es, fr
  keywords: Array,               // Search keywords
  order: Number,                 // Display order
  views: Number,                 // View count
  helpfulVotes: Number,          // Helpful votes
  notHelpfulVotes: Number,       // Not helpful votes
  isActive: Boolean,             // Enable/disable
  isFeatured: Boolean,           // Featured FAQ
  version: Number,               // Version number
  updatedBy: ObjectId,           // Admin who updated
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🌍 Multi-Language Support

All content supports multiple languages:
- English (en) - Default
- Bengali (bn)
- Hindi (hi)
- Spanish (es)
- French (fr)

### Querying Different Languages

```javascript
// Get terms in Bengali
GET /api/legal/terms?lang=bn

// Frontend usage
const { content } = useTermsContent('terms', 'bn');
```

---

## 🎨 Frontend Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Beautiful gradient headers
- ✅ Proper typography and spacing
- ✅ Loading states with spinner
- ✅ Error handling with user-friendly messages
- ✅ FAQ search with debouncing
- ✅ FAQ category filtering
- ✅ FAQ voting system
- ✅ Contact form with validation
- ✅ Multiple contact methods
- ✅ Share functionality ready
- ✅ Print-friendly layout

---

## ⚙️ Admin Features

- ✅ Create/update legal content
- ✅ Version history tracking
- ✅ Restore previous versions
- ✅ Toggle content on/off
- ✅ Manage FAQ items
- ✅ Bulk reorder FAQs
- ✅ Featured FAQ items
- ✅ View/track metrics (views, votes)
- ✅ Multi-language support
- ✅ SEO meta descriptions

---

## 🚀 Deployment Checklist

- [ ] Backend MongoDB URI configured
- [ ] Backend API running and accessible
- [ ] Frontend API base URL configured
- [ ] Frontend USE_MOCK_DATA set to false
- [ ] Routes registered in both backend and frontend
- [ ] Database seeded with initial content
- [ ] All pages tested in production URL
- [ ] Admin can create/edit content
- [ ] Search functionality working
- [ ] Performance optimized
- [ ] Error monitoring set up
- [ ] Analytics tracking added

---

## 📞 Support & Maintenance

### Common Tasks

**Update Terms:**
1. Go to admin panel
2. Navigate to Legal Content
3. Select "Terms and Conditions"
4. Edit content (HTML supported)
5. Save - version auto-incremented
6. Changes live immediately

**Add FAQ Item:**
1. Go to FAQ management
2. Click "Add New"
3. Fill in question, answer, category
4. Set order and featured status
5. Save
6. Live immediately

**Restore Previous Version:**
1. Go to version history
2. Click "Restore" on desired version
3. Current version saved to history
4. Previous version becomes active

---

## 📚 Documentation Files

1. **Backend Documentation**
   - `/LEGAL_API_DOCUMENTATION.md` - Complete API reference
   - `/LEGAL_API_FRONTEND_INTEGRATION.js` - Integration guide
   - This file - Complete overview

2. **Frontend Documentation**
   - `/src/components/pages/Terms/README.md` - Component guide
   - `/src/components/pages/Terms/SETUP_GUIDE.md` - Setup instructions
   - `/src/components/examples/TermsExamples.jsx` - 10 usage examples

---

## ✅ Verification Checklist

Use this checklist to verify everything is working:

### Backend
- [ ] MongoDB connected successfully
- [ ] `src/models/LegalContent.js` exists
- [ ] `src/models/FAQ.js` exists
- [ ] `src/controllers/legalController.js` exists
- [ ] `src/router/legalRoutes.js` exists
- [ ] Routes registered in `app.js`
- [ ] Seed script ran successfully
- [ ] Backend server running on port 5000
- [ ] GET /api/legal/pages returns JSON

### Frontend
- [ ] `src/api/terms.js` USE_MOCK_DATA = false
- [ ] All components created
- [ ] All styles loaded
- [ ] Routes registered in App.js
- [ ] Frontend server running on port 3000
- [ ] All pages load and display
- [ ] Search functionality works
- [ ] FAQ voting works
- [ ] No console errors

### Integration
- [ ] Frontend can fetch from backend
- [ ] Pages load without errors
- [ ] Content displays correctly
- [ ] Admin can update content
- [ ] Changes appear on frontend
- [ ] Multiple languages work
- [ ] Responsive design verified
- [ ] Performance acceptable

---

## 🎉 Success!

You now have a complete Terms & Conditions system with:
- ✅ 7 legal pages
- ✅ FAQ with search and voting
- ✅ Contact form
- ✅ Admin management interface
- ✅ Multi-language support
- ✅ Version history tracking
- ✅ Responsive design
- ✅ Full API documentation

**Next Steps:**
1. Customize content as needed
2. Add admin UI for content management
3. Set up content caching if needed
4. Monitor analytics and FAQ votes
5. Add more languages as needed

---

**Created:** March 4, 2026
**Status:** ✅ Complete & Ready for Use
**Version:** 1.0.0
