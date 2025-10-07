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
- **Current Phase**: Phase 3 Complete - Kitchen Dashboard Functional
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
  - ✅ **Phase 2 Complete**: Order placement and payment checkout
    - Order API endpoints (`POST /api/v1/orders`, `GET /api/v1/orders`, `GET /api/v1/orders/:id`)
    - Order service with transaction handling and Stripe integration
    - Ordering window validation
    - Checkout page with Stripe Elements card payment form
    - Order confirmation page with order details
    - Orders history page listing all user orders
    - End-to-end tested: Menu → Cart → Checkout → Payment → Confirmation → Order History
  - ✅ **Phase 3 Complete**: Kitchen Dashboard for order management
    - Kitchen API endpoints (`/api/v1/kitchen/*`)
    - Item-level fulfillment tracking with automatic order status calculation
    - Two-view system: Order List view and Batch View
    - Batch fulfillment functionality
    - Collapsible fulfilled items
    - Real-time status updates without page refresh
    - Role-based access control (KITCHEN/ADMIN only)
    - Daily statistics and filtering

- **Next Steps**:
  1. Admin panel for menu management
  2. Admin panel for system configuration
  3. Email notifications for order status updates
  4. Print functionality for kitchen tickets
  5. Enhanced reporting and analytics

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

## Key Implementation Details

### Backend Architecture
- **Order Service** (`backend/src/services/order.service.ts`):
  - Creates orders with Stripe payment intents in a database transaction
  - Validates ordering windows (8:00 AM - 10:30 AM on weekdays)
  - Generates unique order numbers (format: ORD-YYYYMMDD-####)
  - Stores customizations and special requests as JSON

- **Kitchen Service** (`backend/src/services/kitchen.service.ts`):
  - `getOrders()` - Fetch orders with filters (date, status, menu item)
  - `getOrderSummary()` - Group orders by menu item for batch preparation
  - `updateOrderStatus()` - Update entire order fulfillment status
  - `updateOrderItemStatus()` - Update individual item status with auto-calculation
  - `getDailyStats()` - Calculate daily statistics
  - Automatic order status calculation: PLACED → PARTIALLY_FULFILLED → FULFILLED

- **Payment Integration**:
  - Static PaymentService methods for Stripe operations
  - Payment intents created before order confirmation
  - Webhook handlers for payment status updates
  - Payment IDs stored directly on Order model

### Frontend Architecture
- **Pages**:
  - `/menu` - Browse daily menu with cart functionality
  - `/checkout` - Stripe Elements payment form
  - `/order-confirmation/:orderId` - Order success page
  - `/orders` - Order history with status tracking
  - `/kitchen` - Kitchen dashboard (KITCHEN/ADMIN only)

- **Kitchen Dashboard Features**:
  - **Order List View**: Individual orders with full details and item-level fulfillment
  - **Batch View**: Orders grouped by menu item for efficient batch preparation
  - Date picker for viewing any date's orders
  - Status filtering (All, PLACED, PARTIALLY_FULFILLED, FULFILLED)
  - Collapsible fulfilled item cards
  - Smart sorting (unfulfilled items first, both at card and row level)
  - Local state updates for instant UI feedback
  - Batch fulfillment: Mark all items of a menu type as fulfilled
  - Daily statistics: Total orders, revenue, pending count

- **State Management**:
  - CartContext with localStorage persistence
  - AuthContext with JWT token management
  - React Router for navigation
  - Local component state for kitchen dashboard collapse/expand

### Data Flow
1. User browses menu and adds items to cart (with customizations)
2. Cart persisted to localStorage
3. Checkout creates order and Stripe PaymentIntent
4. User enters card details via Stripe Elements
5. Payment confirmed → Order status updated → Redirect to confirmation
6. User can view order history and details

## Development Guidelines

### Process Management
**IMPORTANT**: Do NOT kill processes or start/restart the backend and frontend servers automatically.
- The developer will manage `npm run dev` manually
- When server restart is needed, notify the developer to restart it themselves
- You may check process output using BashOutput tool, but do not kill or restart services

### Notes
- All project requirements, architecture decisions, and specifications are documented in the PRD
- See `GETTING_STARTED.md` for detailed setup instructions
- Backend API documentation follows RESTful conventions at `/api/v1/*`
- Stripe test mode enabled - use test cards for payment testing
- Use Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC
