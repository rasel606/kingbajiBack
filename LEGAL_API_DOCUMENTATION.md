# Backend API Documentation - Legal & Terms Pages

Complete API documentation for the Terms & Conditions system.

## Base URL
```
http://localhost:5000/api/legal
```
or
```
https://api.redbaji.com/api/legal
```

## Overview

The Legal & Terms API provides endpoints for managing:
- Legal pages (Terms, Privacy, Rules, etc.)
- FAQ items
- Content versioning and history
- Search functionality

---

## 📋 Public Endpoints (No Authentication Required)

### 1. Get Legal Content by Type

**Endpoint:** `GET /api/legal/:type`

**Parameters:**
- `type` (required): `terms`, `privacy`, `rules`, `responsible-gambling`, `about`, `contact`
- `lang` (optional, query): Language code (default: `en`)

**Example:**
```bash
GET /api/legal/terms?lang=en
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "terms",
    "title": "Terms and Conditions",
    "content": "<h2>1. Agreement to Terms</h2><p>...</p>",
    "language": "en",
    "metaDescription": "Read our terms and conditions",
    "metaKeywords": "terms, conditions",
    "version": 1,
    "lastUpdated": "2026-03-04T10:00:00Z",
    "isActive": true
  }
}
```

**Status Codes:**
- `200 OK` - Content found
- `400 Bad Request` - Invalid content type
- `404 Not Found` - Content not found

---

### 2. Get All Available Legal Pages

**Endpoint:** `GET /api/legal/pages`

**Parameters:**
- `lang` (optional, query): Language code (default: `en`)

**Example:**
```bash
GET /api/legal/pages?lang=en
```

**Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": "terms",
      "title": "Terms and Conditions",
      "description": "Read our terms and conditions",
      "path": "/terms",
      "type": "terms"
    },
    {
      "id": "privacy",
      "title": "Privacy Policy",
      "description": "Our privacy policy",
      "path": "/privacy",
      "type": "privacy"
    }
  ]
}
```

---

### 3. Search Legal Content

**Endpoint:** `GET /api/legal/search`

**Parameters:**
- `q` (required, query): Search query (min 2 characters)
- `type` (optional, query): Specific content type to search
- `lang` (optional, query): Language code (default: `en`)

**Example:**
```bash
GET /api/legal/search?q=deposit&type=terms&lang=en
```

**Response:**
```json
{
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
}
```

---

### 4. Get FAQ Items

**Endpoint:** `GET /api/legal/faq`

**Parameters:**
- `category` (optional, query): `all`, `account`, `deposit`, `withdrawal`, `games`, `bonus`, `security`, `technical` (default: `all`)
- `lang` (optional, query): Language code (default: `en`)
- `featured` (optional, query): `true` to get only featured items (default: `false`)

**Example:**
```bash
GET /api/legal/faq?category=account&lang=en&featured=false
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "category": "account",
        "question": "How do I create an account?",
        "answer": "<p>Creating an account is easy...</p>",
        "language": "en",
        "order": 1,
        "isFeatured": true,
        "views": 150,
        "helpfulVotes": 45,
        "notHelpfulVotes": 2,
        "isActive": true,
        "createdAt": "2026-03-01T10:00:00Z"
      }
    ]
  }
}
```

---

### 5. Get Single FAQ Item

**Endpoint:** `GET /api/legal/faq/item/:id`

**Parameters:**
- `id` (required, path): FAQ item ID

**Example:**
```bash
GET /api/legal/faq/item/507f1f77bcf86cd799439012
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "category": "account",
    "question": "How do I create an account?",
    "answer": "<p>Creating an account is easy...</p>",
    "language": "en",
    "order": 1,
    "isFeatured": true,
    "views": 151,
    "helpfulVotes": 45,
    "notHelpfulVotes": 2,
    "isActive": true
  }
}
```

---

### 6. Search FAQ Items

**Endpoint:** `GET /api/legal/faq/search`

**Parameters:**
- `q` (required, query): Search query (min 2 characters)
- `category` (optional, query): Filter by category
- `lang` (optional, query): Language code (default: `en`)

**Example:**
```bash
GET /api/legal/faq/search?q=deposit&category=deposit&lang=en
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "category": "deposit",
        "question": "What is the minimum deposit amount?",
        "answer": "<p>The minimum deposit is 200 BDT...</p>",
        "order": 5
      }
    ]
  }
}
```

---

### 7. Vote on FAQ Item

**Endpoint:** `POST /api/legal/faq/:id/vote`

**Parameters:**
- `id` (required, path): FAQ item ID
- `helpful` (optional, body): `true` or `false` (default: `true`)

**Example:**
```bash
POST /api/legal/faq/507f1f77bcf86cd799439012/vote
Content-Type: application/json

{
  "helpful": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vote recorded",
  "data": {
    "helpfulVotes": 46,
    "notHelpfulVotes": 2,
    "totalVotes": 48,
    "helpfulPercentage": "95.83"
  }
}
```

---

## 🔐 Admin Endpoints (Requires Authentication)

All admin endpoints require an `Authorization` header with a valid admin token:
```
Authorization: Bearer <admin_token>
```

### 1. Create or Update Legal Content

**Endpoint:** `POST /api/legal/content`

**Parameters (Body):**
```json
{
  "type": "terms",
  "title": "Terms and Conditions",
  "content": "<h2>1. Agreement</h2><p>...</p>",
  "metaDescription": "Read our terms",
  "metaKeywords": "terms,conditions",
  "language": "en"
}
```

**Example:**
```bash
POST /api/legal/content
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "type": "terms",
  "title": "Terms and Conditions",
  "content": "<h2>Updated Terms</h2><p>New content here</p>",
  "metaDescription": "Read our updated terms",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Legal content updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "terms",
    "version": 2,
    "lastUpdated": "2026-03-04T12:00:00Z"
  }
}
```

---

### 2. Get Legal Content Versions

**Endpoint:** `GET /api/legal/:type/versions`

**Parameters:**
- `type` (required, path): Content type
- `lang` (optional, query): Language code (default: `en`)

**Example:**
```bash
GET /api/legal/terms/versions?lang=en
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "version": 2,
      "content": "<h2>Updated Terms</h2>",
      "updatedAt": "2026-03-04T12:00:00Z",
      "updatedBy": "507f1f77bcf86cd799439001",
      "isCurrent": true
    },
    {
      "version": 1,
      "content": "<h2>Original Terms</h2>",
      "updatedAt": "2026-03-01T10:00:00Z",
      "updatedBy": "507f1f77bcf86cd799439001"
    }
  ]
}
```

---

### 3. Restore Previous Version

**Endpoint:** `PUT /api/legal/:type/restore/:version`

**Parameters:**
- `type` (required, path): Content type
- `version` (required, path): Version number to restore
- `lang` (optional, query): Language code (default: `en`)

**Example:**
```bash
PUT /api/legal/terms/restore/1?lang=en
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Restored version 1",
  "data": {
    "type": "terms",
    "version": 3,
    "content": "<h2>Original Terms</h2>",
    "lastUpdated": "2026-03-04T13:00:00Z"
  }
}
```

---

### 4. Toggle Legal Content Status

**Endpoint:** `PATCH /api/legal/:type/toggle`

**Parameters:**
- `type` (required, path): Content type
- `lang` (optional, query): Language code (default: `en`)

**Example:**
```bash
PATCH /api/legal/terms/toggle?lang=en
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Legal content deactivated",
  "data": {
    "type": "terms",
    "isActive": false
  }
}
```

---

### 5. Create FAQ Item

**Endpoint:** `POST /api/legal/faq`

**Parameters (Body):**
```json
{
  "category": "account",
  "question": "How do I create an account?",
  "answer": "<p>Creating an account is easy...</p>",
  "keywords": ["account", "create", "registration"],
  "order": 1,
  "language": "en"
}
```

**Example:**
```bash
POST /api/legal/faq
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "category": "account",
  "question": "How do I create an account?",
  "answer": "<p>Click Sign Up and fill in your details</p>",
  "keywords": ["account", "sign up"],
  "order": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "FAQ item created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "category": "account",
    "question": "How do I create an account?",
    "answer": "<p>Click Sign Up and fill in your details</p>",
    "order": 1,
    "version": 1
  }
}
```

---

### 6. Update FAQ Item

**Endpoint:** `PUT /api/legal/faq/:id`

**Parameters:**
- `id` (required, path): FAQ item ID
- Body parameters (optional): `category`, `question`, `answer`, `keywords`, `order`, `isFeatured`

**Example:**
```bash
PUT /api/legal/faq/507f1f77bcf86cd799439012
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "answer": "<p>Updated answer text</p>",
  "isFeatured": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "FAQ item updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "question": "How do I create an account?",
    "isFeatured": true,
    "version": 2
  }
}
```

---

### 7. Delete FAQ Item

**Endpoint:** `DELETE /api/legal/faq/:id`

**Parameters:**
- `id` (required, path): FAQ item ID

**Example:**
```bash
DELETE /api/legal/faq/507f1f77bcf86cd799439012
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "FAQ item deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "question": "How do I create an account?"
  }
}
```

---

### 8. Toggle FAQ Item Status

**Endpoint:** `PATCH /api/legal/faq/:id/toggle`

**Parameters:**
- `id` (required, path): FAQ item ID

**Example:**
```bash
PATCH /api/legal/faq/507f1f77bcf86cd799439012/toggle
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "FAQ item deactivated",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "isActive": false
  }
}
```

---

### 9. Bulk Update FAQ Order

**Endpoint:** `PUT /api/legal/faq/bulk/order`

**Parameters (Body):**
```json
{
  "items": [
    { "id": "507f1f77bcf86cd799439012", "order": 1 },
    { "id": "507f1f77bcf86cd799439013", "order": 2 },
    { "id": "507f1f77bcf86cd799439014", "order": 3 }
  ]
}
```

**Example:**
```bash
PUT /api/legal/faq/bulk/order
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "items": [
    { "id": "507f1f77bcf86cd799439012", "order": 1 },
    { "id": "507f1f77bcf86cd799439013", "order": 2 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "FAQ items reordered successfully",
  "data": [
    { "_id": "507f1f77bcf86cd799439012", "order": 1 },
    { "_id": "507f1f77bcf86cd799439013", "order": 2 }
  ]
}
```

---

## 🛠️ Setup Instructions

### 1. Create Database Models
Already created:
- `src/models/LegalContent.js`
- `src/models/FAQ.js`

### 2. Create Controllers
Already created:
- `src/controllers/legalController.js`

### 3. Add Routes
Already created:
- `src/router/legalRoutes.js`

### 4. Register Routes in App
Already updated in `app.js`:
```javascript
const legalRoutes = require('./src/router/legalRoutes');
app.use('/api/legal', legalRoutes);
```

### 5. Seed Initial Data

Run the seed script to populate database with initial legal content and FAQ items:

```bash
# From project root
node src/scripts/seedLegalContent.js
```

Output:
```
✅ MongoDB connected
🗑️ Clearing existing legal content...
✅ Cleared existing data
📝 Seeding legal content...
✅ Seeded 6 legal content items
📋 Seeding FAQ items...
✅ Seeded 12 FAQ items

✅ Database seeding completed successfully!
```

---

## 📊 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common Status Codes:**
- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing/invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🔍 Content Types

Valid content types:
- `terms` - Terms and Conditions
- `privacy` - Privacy Policy
- `rules` - Rules and Regulations
- `responsible-gambling` - Responsible Gambling Information
- `about` - About Us
- `contact` - Contact Information

---

## 📂 FAQ Categories

Available FAQ categories:
- `account` - Account-related questions
- `deposit` - Deposit questions
- `withdrawal` - Withdrawal questions
- `games` - Game questions
- `bonus` - Bonus questions
- `security` - Security questions
- `technical` - Technical questions
- `general` - General questions

---

## 🌍 Supported Languages

- `en` - English (default)
- `bn` - Bengali
- `hi` - Hindi
- `es` - Spanish
- `fr` - French

---

## 📝 HTML Content Guidelines

When creating/updating legal content or FAQs, you can use the following HTML tags:

Allowed tags:
- Headings: `<h2>`, `<h3>`, `<h4>`
- Text: `<p>`, `<strong>`, `<em>`, `<u>`
- Lists: `<ul>`, `<ol>`, `<li>`
- Links: `<a href="...">text</a>`
- Quotes: `<blockquote>`
- Tables: `<table>`, `<tr>`, `<th>`, `<td>`
- Code: `<code>`

Example:
```html
<h2>1. Agreement to Terms</h2>
<p>By accessing our website, you agree to be bound by <strong>these terms</strong>.</p>

<h3>1.1 Eligibility</h3>
<ul>
  <li>You must be at least 18 years old</li>
  <li>You must be legally permitted to gamble</li>
</ul>

<a href="/contact">Contact us</a> for more information.
```

---

## 🔗 Related Documentation

- [Frontend Integration Guide](../../../src/components/pages/Terms/README.md)
- [Setup Instructions](../../../src/components/pages/Terms/SETUP_GUIDE.md)
- [API Integration](../../../src/api/terms.js)

---

## ✅ Testing

Use Postman or any HTTP client to test endpoints. Example Postman collection structure:

```
Legal API
├── Public
│   ├── Get Legal Content
│   ├── Get FAQ Items
│   └── Search
└── Admin
    ├── Create/Update Legal Content
    ├── Manage FAQ Items
    └── Version Control
```

---

## 📞 Support

For issues or questions:
1. Check error responses
2. Verify authentication token
3. Ensure content type is valid
4. Check database connection

---

**Last Updated:** March 4, 2026
**API Version:** 1.0.0
