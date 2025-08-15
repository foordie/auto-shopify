# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev

# Build and type check
npm run build
npm run type-check

# Linting
npm run lint
```

The project runs on Next.js 14.2.0 with TypeScript and uses `npm run dev` for development server on port 3000.

## Architecture Overview

### Platform Purpose
This is a **Shopify Automation Platform** that has evolved from an agency-focused B2B model to a **consumer-focused B2C platform** for individual entrepreneurs, store builders, and wannabe startups. The platform automates Shopify store creation and provides mobile API integration for the VibeCode app.

### Dual Authentication Systems
The codebase implements **two parallel authentication systems**:

1. **Supabase Auth** (Legacy): Found in `/src/lib/auth/auth-provider.tsx` and some API routes
2. **Custom JWT Auth** (Current): Implemented in `/src/lib/auth/jwt-middleware.ts` and newer API routes

**Key Decision**: The platform is transitioning from Supabase to **Neon + Vercel** for better control and automation integration. New endpoints use JWT authentication, while some legacy routes still use Supabase.

### Security-First API Design
All API endpoints in `/src/app/api/` implement enterprise-grade security:

- **JWT Authentication**: Bearer token validation with configurable expiration
- **Rate Limiting**: Per-endpoint limits (5-20 requests/15min) stored in memory maps
- **Input Validation**: Zod schemas with comprehensive validation rules
- **XSS Protection**: Input sanitization and security headers
- **Password Security**: bcrypt hashing with 12 salt rounds

### Mobile-First Consumer Platform
The platform specifically targets individual entrepreneurs rather than agencies:

**User Types**:
- `first_time_builder` - New to e-commerce
- `aspiring_entrepreneur` - Have business ideas
- `small_business_owner` - Taking existing business online  
- `side_hustle_starter` - Building something on the side
- `creative_professional` - Artists, designers, makers

**Business Stages**:
- `just_an_idea` - Still planning
- `have_products` - Ready to sell
- `selling_elsewhere` - Want own store
- `expanding_online` - Adding online sales

### Demo Data System
The platform uses `DemoDataBadge` components throughout to mark placeholder/mock data with red visual indicators. These badges help identify what needs real data vs. demo content during development.

## Key API Endpoints for Mobile Integration

### Authentication
- `POST /api/auth/register` - Multi-step secure registration
- `POST /api/auth/login` - JWT login with refresh tokens

### Store Management  
- `GET /api/stores` - List user's stores with pagination
- `POST /api/stores` - Create new store (initiates Shopify automation)
- `GET /api/stores/[id]/progress` - Real-time store creation progress

### User Profile
- `GET /api/user/profile` - User profile with stats
- `PUT /api/user/profile` - Update profile and password

All endpoints follow consistent response patterns documented in `API_REFERENCE.md`.

## Form Architecture

### Multi-Step Registration (`/register-secure`)
The secure registration uses React Hook Form + Zod validation across 3 steps:
1. **Personal Info**: Name, email, password with strength checking
2. **Journey & Role**: User type and business stage selection  
3. **Products & Business**: Category selection and business name

Each step has independent validation schemas (`step1Schema`, `step2Schema`, `step3Schema`) that merge into `registrationSchema`.

### Form Security Features
- **Rate Limiting**: Max 5 attempts per 15 minutes with account lockout
- **Password Strength**: Real-time validation with visual feedback
- **Input Sanitization**: XSS protection on all text inputs
- **Progress Tracking**: Visual step indicators with animations

## Component Patterns

### Demo Data Marking
Use `DemoDataBadge` components to mark any placeholder data:
```tsx
import { DemoDataBadge } from '@/components/ui/DemoDataBadge'

// Mark demo statistics
<span>50K+ <DemoDataBadge type="data" size="sm" /></span>

// Mark demo API responses  
<DemoDataBadge type="api" label="MOCK DATA" />
```

### Validation Schemas
All form validation uses Zod schemas in `/src/lib/validation/auth.ts`:
- Email validation blocks disposable email domains
- Password validation requires uppercase, lowercase, numbers, special chars
- Business name validation allows only safe characters
- Phone/address validation follows international standards

## Environment Variables

```bash
# JWT Authentication
JWT_SECRET=your-super-secure-jwt-secret-here

# Database (Neon PostgreSQL recommended)  
DATABASE_URL=postgresql://user:password@neon-db-url/database

# API Base URL
NEXT_PUBLIC_API_BASE_URL=https://your-app.vercel.app
```

## Security Considerations

### Input Validation
- All API endpoints validate inputs with Zod schemas
- Email validation blocks temporary/disposable domains
- Password strength enforced with regex patterns
- Business names sanitized to prevent XSS

### Rate Limiting Strategy
Each endpoint type has specific limits:
- Auth endpoints: 5 requests/15min (prevents brute force)
- Store endpoints: 10 requests/15min (normal usage)
- Profile endpoints: 15 requests/15min (account management)
- Progress endpoints: 20 requests/15min (real-time updates)

### JWT Token Management
- **Access tokens**: 15-minute expiration for security
- **Refresh tokens**: 7-30 days based on "remember me"  
- **Token rotation**: Implemented for refresh token security
- **Secure storage**: httpOnly cookies for web, localStorage for mobile

## Integration Notes

### VibeCode Mobile App
The API is specifically designed for mobile consumption with:
- Consistent JSON response formats
- Proper HTTP status codes
- Detailed error messages with field-level validation
- Real-time progress tracking for store creation
- Offline-friendly authentication patterns

### Automation Infrastructure  
The platform integrates with:
- **Vercel**: Automated deployments and serverless functions
- **Neon**: Serverless PostgreSQL with branch databases
- **GitHub Actions**: CI/CD pipelines for staging/production
- **MCP Tools**: Model Context Protocol for automation orchestration

## File Structure Patterns

- `/src/app/api/` - Next.js 14 App Router API endpoints
- `/src/lib/auth/` - Authentication utilities and middleware
- `/src/lib/validation/` - Zod validation schemas  
- `/src/components/ui/` - Reusable UI components
- `/src/components/forms/` - Form-specific components
- `/src/app/*/page.tsx` - Page components using App Router

The platform follows Next.js 14 App Router conventions with TypeScript strict mode enabled.