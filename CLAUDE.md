# Claude Code - HRC Kitchen Project

## Project Documentation

### Primary Reference
- **[Product Requirements Document (PRD)](./PRD.md)** - Complete functional and technical specification for the HRC Kitchen lunch ordering system

## Quick Links
- PRD: `./PRD.md`
- MVP Build Plan: `./MVP_PLAN.md`

## Project Overview
HRC Kitchen is a web-based lunch ordering system for Huon Regional Care staff, featuring:
- Self-service registration and ordering
- Daily rotating weekly menus
- Time-windowed same-day ordering
- Secure payment processing via Stripe
- Batch order fulfillment for kitchen staff
- Non-technical menu management interface

## Development Status
- **Current Phase**: Phase 1 - MVP Implementation
- **Completed**:
  - ✅ Project structure and monorepo setup
  - ✅ Backend API foundation (Node.js/Express/TypeScript)
  - ✅ PostgreSQL database with Prisma ORM (using Neon cloud database)
  - ✅ Complete database schema (users, menu items, orders, payments, system config)
  - ✅ Authentication system (JWT, bcrypt, email/password registration)
  - ✅ Stripe payment integration (backend service + webhooks)
  - ✅ Frontend foundation (React/TypeScript/Vite with Material-UI)
  - ✅ User registration and login flows (tested and working)
  - ✅ Development environment setup
  - ✅ Database seeding with test users and sample menu data (all weekdays)
  - ✅ **Phase 1 Complete**: Menu browsing & shopping cart system
    - Menu API endpoints (`/api/v1/menu/today`, `/api/v1/menu/week`)
    - System config service for ordering window management
    - Menu page with item cards, dietary tags, and categories
    - Cart context with localStorage persistence
    - Cart drawer with quantity controls and customizations
    - Add to cart with customization options and special requests

- **In Progress**:
  - 🔨 Phase 2: Order placement and payment checkout

- **Next Steps**:
  1. Order API endpoints and order creation logic
  2. Checkout page with order summary
  3. Stripe payment integration (frontend)
  4. Order confirmation page
  5. Kitchen dashboard for order management
  6. Admin panel for menu and system management

## Technical Setup

### Database
- **Provider**: Neon PostgreSQL (cloud-hosted)
- **Connection**: Configured in `backend/.env`
- **Migrations**: Run via `npm run db:migrate` in backend
- **Seeding**: Test data available via `npm run db:seed`

### Test Accounts
After seeding, the following accounts are available:
- **Admin**: admin@hrc-kitchen.com / Admin123!
- **Kitchen**: kitchen@hrc-kitchen.com / Kitchen123!
- **Staff**: staff@hrc-kitchen.com / Staff123!

### Running Locally
```bash
npm run dev  # Starts both backend (port 3000) and frontend (port 5173)
```

## Notes
- All project requirements, architecture decisions, and specifications are documented in the PRD
- See `GETTING_STARTED.md` for detailed setup instructions
- Backend API documentation follows RESTful conventions at `/api/v1/*`
- Stripe test mode enabled - use test cards for payment testing
