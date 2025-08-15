# Auto-Shopify Platform

Automated Shopify store creation platform for entrepreneurs - from idea to launch in minutes.

## Overview

Auto-Shopify is a B2C platform that automates the entire Shopify store creation process for individual entrepreneurs, first-time builders, and small business owners. The platform provides AI-powered store setup, real-time progress tracking, and mobile API integration.

## Features

### Core Functionality
- **Automated Store Creation**: AI-powered setup process that creates a fully functional Shopify store
- **Real-Time Progress Tracking**: Live updates during store creation with visual progress indicators
- **Multi-Step Registration**: Secure, mobile-optimized onboarding with business profiling
- **Dashboard Management**: Centralized control panel for all your stores
- **JWT Authentication**: Enterprise-grade security with refresh tokens

### User Types Supported
- First-time store builders
- Aspiring entrepreneurs
- Small business owners
- Side hustle starters
- Creative professionals

## Tech Stack

- **Frontend**: Next.js 14.2, TypeScript, Tailwind CSS
- **Authentication**: Custom JWT implementation with bcrypt
- **Database**: Ready for Neon PostgreSQL integration
- **Deployment**: Optimized for Vercel
- **Mobile API**: RESTful endpoints for VibeCode app integration

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GitHub account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/foordie/auto-shopify.git
cd auto-shopify
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
JWT_SECRET=your-super-secure-jwt-secret-here
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@host/database
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Multi-step user registration
- `POST /api/auth/login` - JWT-based login with refresh tokens

### Store Management
- `GET /api/stores` - List user's stores with pagination
- `POST /api/stores` - Create new store (initiates automation)
- `GET /api/stores/[id]/progress` - Real-time creation progress

### User Profile
- `GET /api/user/profile` - Get user profile and statistics
- `PUT /api/user/profile` - Update profile information

All endpoints include:
- Rate limiting (5-20 requests/15min based on endpoint)
- Input validation with Zod schemas
- Security headers (XSS, CSRF protection)
- Comprehensive error responses

## Security Features

- **Password Security**: bcrypt with 12 salt rounds
- **Input Validation**: Zod schemas for all inputs
- **Rate Limiting**: Per-endpoint limits to prevent abuse
- **XSS Protection**: Input sanitization and security headers
- **JWT Tokens**: 15-minute access tokens, 7-30 day refresh tokens
- **Email Validation**: Blocks disposable email domains

## Project Structure

```
/src
├── app/                 # Next.js 14 App Router pages
│   ├── api/            # API endpoints
│   ├── dashboard/      # Dashboard page
│   ├── login/          # Login page
│   ├── register-secure/ # Registration flow
│   └── store-creation/ # Store creation wizard
├── components/         # React components
│   └── ui/            # Reusable UI components
├── lib/               # Utilities and helpers
│   ├── api/           # API clients
│   ├── auth/          # Authentication logic
│   └── validation/    # Zod schemas
└── styles/            # Global styles
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Import project in Vercel:
- Connect GitHub repository
- Configure environment variables
- Deploy

### Environment Variables for Production

Required variables:
- `JWT_SECRET` - Strong secret for JWT signing
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_API_BASE_URL` - Your production URL

## Mobile Integration

The platform provides RESTful APIs designed for mobile consumption:
- Consistent JSON response formats
- Proper HTTP status codes
- Field-level validation errors
- Offline-friendly authentication
- Real-time progress webhooks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, email support@auto-shopify.com or open an issue on GitHub.

## Roadmap

- [ ] Shopify Partner API integration
- [ ] AI-powered product generation
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Payment processing integration
- [ ] Custom domain management
- [ ] Email marketing automation
- [ ] Inventory management system

---

Built with ❤️ for entrepreneurs everywhere