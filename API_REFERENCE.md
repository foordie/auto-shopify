# Shopify Automation Platform API Reference

## Overview

This API provides secure endpoints for mobile applications (like VibeCode) to integrate with the Shopify Automation Platform. All endpoints use JWT authentication and implement comprehensive security measures including rate limiting, input validation, and sanitization.

## Authentication

All API endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Get tokens via the authentication endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login existing user

## Security Features

- **Rate Limiting**: Each endpoint has specific rate limits
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Zod schema validation for all inputs
- **XSS Protection**: Input sanitization and security headers
- **Password Security**: bcrypt hashing with salt rounds

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com", 
  "password": "SecurePass123!",
  "role": "aspiring_entrepreneur",
  "businessStage": "have_products",
  "productCategory": "handmade_crafts",
  "businessName": "John's Crafts"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "aspiring_entrepreneur",
    "emailVerified": false
  },
  "nextSteps": [
    "Check your email for verification link",
    "Complete your store setup",
    "Start building your online presence"
  ]
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "remember": false
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "aspiring_entrepreneur",
    "businessName": "John's Crafts",
    "emailVerified": true
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...", 
    "expiresIn": 900
  }
}
```

### Store Management

#### List Stores
```http
GET /api/stores?limit=10&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "stores": [
    {
      "id": "store_demo_123",
      "name": "My First Store",
      "description": "A demo store for testing",
      "category": "handmade_crafts",
      "status": "draft",
      "progress": {
        "setupComplete": 45,
        "stepsCompleted": ["basic_info", "theme_selection"],
        "nextStep": "product_import"
      },
      "domain": "my-first-store.myshopify.com",
      "customDomain": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-16T14:22:00Z"
    }
  ],
  "totalStores": 1,
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

#### Create Store
```http
POST /api/stores
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My New Store",
  "description": "My awesome new store",
  "category": "fashion_style",
  "theme": "debut",
  "customDomain": "mynewstore.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Store creation initiated successfully",
  "store": {
    "id": "store_456",
    "name": "My New Store",
    "description": "My awesome new store",
    "category": "fashion_style",
    "status": "creating",
    "progress": {
      "setupComplete": 10,
      "stepsCompleted": ["basic_info"],
      "nextStep": "shopify_setup",
      "estimatedCompletion": "15-20 minutes"
    },
    "domain": "my-new-store.myshopify.com",
    "customDomain": "mynewstore.com",
    "createdAt": "2024-01-16T15:30:00Z",
    "updatedAt": "2024-01-16T15:30:00Z"
  },
  "nextSteps": [
    "Shopify store setup in progress",
    "Theme customization will begin shortly", 
    "You will receive updates via email and dashboard"
  ]
}
```

### Store Progress Tracking

#### Get Store Progress
```http
GET /api/stores/{storeId}/progress
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "progress": {
    "storeId": "store_123",
    "status": "in_progress",
    "overallProgress": 65,
    "currentStep": "theme_customization",
    "estimatedTimeRemaining": "8-12 minutes",
    "steps": [
      {
        "name": "basic_info",
        "label": "Basic Store Information",
        "status": "completed",
        "progress": 100,
        "completedAt": "2024-01-16T10:30:00Z",
        "message": "Store name and basic details configured"
      },
      {
        "name": "theme_customization",
        "label": "Theme Customization",
        "status": "in_progress", 
        "progress": 45,
        "startedAt": "2024-01-16T10:43:00Z",
        "message": "Customizing colors, fonts, and layout"
      }
    ],
    "nextActions": [
      "Theme customization in progress",
      "Product catalog will be set up next",
      "Payment setup will follow"
    ],
    "createdAt": "2024-01-16T10:30:00Z",
    "updatedAt": "2024-01-16T15:45:00Z"
  }
}
```

### User Profile Management

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "fullName": "John Doe",
    "businessName": "John's Crafts",
    "role": "aspiring_entrepreneur",
    "productCategory": "handmade_crafts",
    "businessStage": "have_products",
    "emailVerified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:22:00Z",
    "preferences": {
      "notifications": {
        "email": true,
        "push": true,
        "marketing": false
      },
      "theme": "light"
    },
    "stats": {
      "storesCreated": 1,
      "activeStores": 1,
      "accountAge": "2 days"
    }
  }
}
```

#### Update User Profile
```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Smith",
  "businessName": "Smith's Crafts",
  "role": "small_business_owner",
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile and password updated successfully",
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "fullName": "John Smith",
    "businessName": "Smith's Crafts",
    "role": "small_business_owner",
    "emailVerified": true,
    "updatedAt": "2024-01-16T16:00:00Z"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limits

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Store endpoints**: 10 requests per 15 minutes per user
- **Profile endpoints**: 15 requests per 15 minutes per user
- **Progress endpoints**: 20 requests per 15 minutes per user

## Security Headers

All responses include security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `X-RateLimit-Remaining: <count>`

## Data Validation

### User Roles
- `first_time_builder`
- `aspiring_entrepreneur`
- `small_business_owner`
- `side_hustle_starter`
- `creative_professional`

### Business Stages  
- `just_an_idea`
- `have_products`
- `selling_elsewhere`
- `expanding_online`

### Product Categories
- `fashion_style`
- `handmade_crafts`
- `electronics_gadgets`
- `health_wellness`
- `home_living`
- `food_beverage`
- `art_collectibles`
- `sports_outdoors`
- `books_education`
- `not_sure_yet`

### Store Statuses
- `creating` - Store setup in progress
- `draft` - Store created but not published
- `active` - Store is live and published
- `paused` - Store temporarily paused
- `failed` - Store creation failed

## Example Mobile Integration

```javascript
// VibeCode App Integration Example
class ShopifyAutomationAPI {
  constructor(baseURL) {
    this.baseURL = baseURL
    this.token = null
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    if (data.success) {
      this.token = data.tokens.accessToken
    }
    return data
  }

  async getStores() {
    const response = await fetch(`${this.baseURL}/api/stores`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    })
    return response.json()
  }

  async createStore(storeData) {
    const response = await fetch(`${this.baseURL}/api/stores`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(storeData)
    })
    return response.json()
  }

  async getStoreProgress(storeId) {
    const response = await fetch(`${this.baseURL}/api/stores/${storeId}/progress`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    })
    return response.json()
  }
}
```

## Environment Setup

For production deployment with Neon + Vercel:

```bash
# Environment Variables
JWT_SECRET=your-super-secure-jwt-secret-here
DATABASE_URL=postgresql://user:password@neon-db-url/database
NEXT_PUBLIC_API_BASE_URL=https://your-app.vercel.app
```

This API is designed to be consumed by mobile applications while maintaining enterprise-grade security standards.