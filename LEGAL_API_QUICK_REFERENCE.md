# Legal & Terms API - Quick Reference Card

## 🚀 Quick Start

### 1. Seed Database
```bash
node src/scripts/seedLegalContent.js
```

### 2. Start Backend
```bash
npm start
# http://localhost:5000
```

### 3. Update Frontend
```javascript
// src/api/terms.js
const USE_MOCK_DATA = false; // Enable real API
```

### 4. Add Routes to Frontend
```javascript
// App.js
import { termsRoutes } from './routing/termsRoutes';
{termsRoutes.map(route => (
  <Route key={route.path} path={route.path} element={<route.component />} />
))}
```

---

## 🔗 Most Used Endpoints

### Public (No Auth)

```bash
# Get all legal pages
GET /api/legal/pages?lang=en

# Get specific content
GET /api/legal/terms?lang=en
GET /api/legal/privacy?lang=en
GET /api/legal/faq

# Search
GET /api/legal/search?q=deposit
GET /api/legal/faq/search?q=account

# Vote on FAQ
POST /api/legal/faq/:id/vote
Body: { "helpful": true }
```

### Admin (With Auth Header)

```bash
# Create/update content
POST /api/legal/content
Body: {
  "type": "terms",
  "title": "Terms and Conditions",
  "content": "<h2>...</h2>",
  "language": "en"
}

# Update FAQ
PUT /api/legal/faq/:id
Body: { "question": "...", "answer": "..." }

# Create FAQ
POST /api/legal/faq
Body: {
  "category": "account",
  "question": "How do I create account?",
  "answer": "<p>...</p>"
}
```

---

## 📝 HTML Content Allowed

```html
<h2>Title</h2>
<h3>Subtitle</h3>
<p>Paragraph text</p>
<strong>Bold</strong>
<em>Italic</em>
<ul>
  <li>List item</li>
</ul>
<a href="/link">Link text</a>
<blockquote>Quote</blockquote>
<table>
  <tr><th>Header</th></tr>
  <tr><td>Data</td></tr>
</table>
```

---

## 🎯 Frontend Usage

### Fetch Legal Content
```javascript
import useTermsContent from '@/hooks/useTermsContent';

function MyComponent() {
  const { content, loading, error } = useTermsContent('terms', 'en');
  
  if (loading) return <Spinner />;
  if (error) return <Error msg={error} />;
  
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
```

### Use Complete Pages
```javascript
import { TermsAndConditions, FAQ, ContactUs } from '@/components/pages/Terms';

<TermsAndConditions />
<FAQ />
<ContactUs />
```

### Add Routes
```javascript
import { termsRoutes } from './routing/termsRoutes';

// In Routes:
{termsRoutes.map(route => (
  <Route key={route.path} path={route.path} element={<route.component />} />
))}
```

---

## 🗂️ Database Collections

### LegalContent
```javascript
{
  type: "terms",              // Unique type
  title: "Terms and Conditions",
  content: "<h2>...</h2>",    // HTML allowed
  language: "en",
  version: 1,
  versions: [],               // History of changes
  isActive: true,
  metaDescription: "...",
  metaKeywords: "..."
}
```

### FAQ
```javascript
{
  category: "account",        // account|deposit|games|bonus|etc
  question: "How do I..?",
  answer: "<p>...</p>",       // HTML allowed
  language: "en",
  order: 1,                   // Display order
  isFeatured: true,
  views: 42,
  helpfulVotes: 30,
  notHelpfulVotes: 2,
  isActive: true
}
```

---

## 💻 Common Operations

### Admin Updates Terms
```javascript
// 1. Call API
fetch('/api/legal/content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  body: JSON.stringify({
    type: 'terms',
    title: 'New Title',
    content: '<h2>New Content</h2>',
    language: 'en'
  })
})

// 2. Backend:
// - Saves current version to history
// - Updates content
// - Increments version: 1 → 2
// - Returns success

// 3. Frontend:
// - Shows success message
// - Content updates immediately
```

### Users Browse FAQ
```javascript
// 1. Page loads
// 2. Fetch FAQ: GET /api/legal/faq
// 3. Display 12+ items
// 4. User searches: GET /api/legal/faq/search?q=deposit
// 5. Show matching results
// 6. User votes: POST /api/legal/faq/:id/vote
// 7. Update vote count
```

---

## 🔍 Search Examples

```bash
# Search all legal content
GET /api/legal/search?q=deposit

# Search only terms
GET /api/legal/search?q=withdraw&type=terms

# Search FAQ
GET /api/legal/faq/search?q=bonus

# Search FAQ by category
GET /api/legal/faq/search?q=account&category=account
```

---

## 📊 Content Types

```
terms                 → Terms and Conditions
privacy              → Privacy Policy
rules                → Rules and Regulations
responsible-gambling → Responsible Gambling
about                → About Us
contact              → Contact Information
```

## 🏷️ FAQ Categories

```
account      → Account-related Q&A
deposit      → Deposit questions
withdrawal   → Withdrawal questions
games        → Game questions
bonus        → Bonus questions
security     → Security questions
technical    → Technical questions
general      → General Q&A
```

---

## 🌍 Languages

```
en → English (default)
bn → Bengali
hi → Hindi
es → Spanish
fr → French
```

---

## ✅ Testing Checklist

```javascript
// 1. Backend running?
fetch('http://localhost:5000/api/legal/pages')

// 2. Data seeded?
fetch('http://localhost:5000/api/legal/terms')

// 3. Frontend can connect?
// Check browser console - no CORS errors

// 4. Content renders?
// Visit http://localhost:3000/terms

// 5. Search works?
// Try FAQ search functionality

// 6. Admin can edit?
// POST request to /api/legal/content

// 7. Version history?
// GET /api/legal/terms/versions
```

---

## 🔐 Authentication Header

All admin endpoints need:
```
Header: Authorization
Value: Bearer <admin_jwt_token>
```

Get token from:
```bash
POST /api/admin/auth/login
Body: { username, password }
Response: { token }
```

---

## 📱 Responsive Breakpoints

Frontend uses:
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

All fully responsive ✅

---

## ⚡ Performance Tips

### Backend
- Use `lang` parameter to reduce payload
- Category filter for FAQ reduces results
- Full text search with indexes
- Add Redis caching for high traffic

### Frontend
- Custom hook caches data in state
- useEffect dependency array prevents refetch
- Loading skeletons for better UX
- Debounce search input

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| `Cannot GET /api/legal/terms` | Backend not running or route not registered |
| `CORS error` | Check backend CORS settings |
| `Empty FAQ` | Run seed script: `node src/scripts/seedLegalContent.js` |
| `USE_MOCK_DATA still true` | Edit `src/api/terms.js` line 5 |
| `404 on page load` | Add routes to App.js |
| `No styling` | Check CSS imports in components |
| `Auth errors` | Verify token in Authorization header |

---

## 📞 Get Help

1. Check error messages first
2. Review API documentation
3. Check Backend logs: `npm start` console
4. Check Frontend logs: Browser DevTools
5. Verify database connection
6. Run seed script again

---

## 🚀 Deploy to Production

1. Set Backend URL in Frontend
2. Disable mock data
3. Seed production database
4. Test all endpoints
5. Monitor API logs
6. Set up analytics

---

**Last Updated:** March 4, 2026
**Quick Ref Version:** 1.0
