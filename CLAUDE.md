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
- **Current Phase**: MVP Complete - All Core Features Implemented
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
    - Ordering window banner (red warning when closed)
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
    - Two-view system: "Group by Item" (default) and "Order List"
    - Batch fulfillment functionality with smooth animations
    - Collapsible fulfilled items
    - Real-time status updates without page refresh
    - Role-based access control (KITCHEN/ADMIN only)
    - Daily statistics and filtering
    - Smooth reordering animations when items are fulfilled
    - Visual feedback: card-level flash for batch fulfillment, row-level flash for individual items
  - ✅ **Phase 4 Complete**: Admin Panel for comprehensive management
    - Admin API endpoints (`/api/v1/admin/*`)
    - Menu management with three view modes:
      - By Day (weekday tabs: Monday-Friday)
      - By Category (Main, Side, Drink, Dessert, Other)
      - All Items (unified view)
    - Search functionality across all menu items
    - Create, edit, delete menu items
    - Customization management for menu items
    - Image upload with Cloudinary integration
    - Automatic client-side image compression before upload
    - User management (view, search, filter users)
    - Role management (promote/demote users with self-protection)
    - User activation/deactivation with self-protection
    - System configuration (ordering window times)
    - Time validation (HH:MM format, end after start)
    - Admin dashboard with tabbed navigation
    - Three-panel interface: Menu Management, User Management, System Config

- **Next Steps** (Optional Enhancements):
  1. Email notifications for order status updates
  2. Print functionality for kitchen tickets
  3. Enhanced reporting and analytics
  4. Advanced filtering and search in order history
  5. Production deployment preparation

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

- **Admin Service** (`backend/src/services/admin.service.ts`):
  - `createMenuItem()` - Create new menu items with dietary tags and customizations
  - `updateMenuItem()` - Update existing menu items
  - `deleteMenuItem()` - Soft delete (deactivate) or permanently delete menu items
  - `addCustomization()` - Add customization options to menu items
  - `deleteCustomization()` - Remove customization options
  - `getUsers()` - Fetch users with pagination, search, and filtering
  - `updateUserRole()` - Promote/demote user roles with self-protection
  - `updateUserStatus()` - Activate/deactivate users with self-protection
  - `getConfig()` - Retrieve all system configuration
  - `updateConfig()` - Update ordering window times with validation

- **Upload Service** (`backend/src/services/upload.service.ts`):
  - Cloudinary integration for menu item images
  - `generateUploadSignature()` - Generate signed URLs for direct uploads
  - `uploadImage()` - Server-side image upload with optimization
  - `deleteImage()` - Remove images from Cloudinary
  - Automatic image transformation (800x800 max, quality optimization)

### Frontend Architecture
- **Pages**:
  - `/menu` - Browse daily menu with cart functionality
  - `/checkout` - Stripe Elements payment form
  - `/order-confirmation/:orderId` - Order success page
  - `/orders` - Order history with status tracking
  - `/kitchen` - Kitchen dashboard (KITCHEN/ADMIN only)
  - `/admin` - Admin dashboard (ADMIN only)

- **Kitchen Dashboard Features** (`/kitchen`):
  - **Two View Modes**:
    - **Group by Item** (default): Orders grouped by menu item for batch preparation
      - Collapsible fulfilled item cards
      - Batch fulfillment: Mark all items of a menu type as fulfilled at once
      - Shows quantity summary per menu item
      - Individual order details within each menu item
    - **Order List**: Individual orders with full details and item-level fulfillment
      - Full customer information per order
      - Item-by-item fulfillment tracking
      - Special requests display
  - Date picker for viewing any date's orders
  - Status filtering (All, PLACED, PARTIALLY_FULFILLED, FULFILLED)
  - Smart sorting (unfulfilled items first, both at card and row level)
  - Local state updates for instant UI feedback (no page refresh)
  - Daily statistics: Total orders, revenue, pending count
  - **Smooth Animations**:
    - Card-level green flash animation when batch fulfilling
    - Row-level green flash animation when marking individual items
    - Smooth reordering with fulfilled items sinking down (0.8s Material Design easing)
    - Scale effects for visual feedback

- **Admin Dashboard Features** (`/admin`):
  - **Menu Management Tab**:
    - **Three View Modes** (icon-based toggle with tooltips):
      - By Day: Weekday tabs (Monday-Friday)
      - By Category: Filter by meal type (Main, Side, Drink, Dessert, Other)
      - All Items: Unified view of entire menu
    - Global search across all menu items (name, description, category, dietary tags)
    - Create, edit, delete menu items
    - Image upload with Cloudinary integration
    - Automatic client-side image compression (1200px @ 80%, fallback to 800px @ 60%)
    - Upload progress indicator
    - Dietary tag selection (Vegetarian, Vegan, Gluten-Free, Dairy-Free, Nut-Free, Halal)
    - Category assignment (Main, Side, Drink, Dessert, Other)
    - Active/inactive toggle for menu items
    - Visual card-based layout with images
    - Contextual chips showing weekday/category based on view mode
  - **User Management Tab**:
    - Searchable and filterable user table
    - Role-based filtering (Staff, Kitchen, Admin)
    - Status filtering (Active/Inactive)
    - Pagination support (20 users per page)
    - Role promotion/demotion with confirmation
    - User activation/deactivation
    - Self-protection (cannot modify own account)
    - Full name and email search
  - **System Configuration Tab**:
    - Ordering window time configuration
    - Time validation (HH:MM format, end after start)
    - Real-time configuration updates
    - Configuration guidelines and help text
    - Monday-Friday application (weekends automatically disabled)

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
