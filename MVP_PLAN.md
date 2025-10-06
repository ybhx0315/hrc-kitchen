# HRC Kitchen - MVP Build Plan

**Version**: 1.0
**Date**: October 7, 2025
**Timeline**: 6-8 weeks
**Status**: In Progress

---

## Table of Contents
1. [Current Status](#current-status)
2. [Build Phases](#build-phases)
3. [Implementation Timeline](#implementation-timeline)
4. [Technical Stack](#technical-stack)
5. [Progress Tracking](#progress-tracking)

---

## Current Status

### ✅ Completed Foundation
- Database schema (Prisma with PostgreSQL/Neon)
- Authentication system (registration, login, JWT, email verification)
- Stripe payment integration (backend services + webhooks)
- Basic frontend structure (React, TypeScript, Vite, Material-UI)
- Frontend pages: Home, Login, Register
- Development environment setup
- Test data seeding with sample users and menu items

### 🎯 MVP Scope
Implementing Phase 1 features from PRD (see PRD.md Section 10) to deliver a functional lunch ordering system with:
- Menu browsing with time-windowed ordering
- Shopping cart and checkout
- Secure payment processing
- Kitchen order management
- Admin menu and system configuration

---

## Build Phases

### **Phase 1: Menu Browsing & Cart System**
**Timeline**: Week 1-2
**Status**: ✅ Completed

#### Backend Tasks
- [x] **1.1 Menu API Endpoints**
  - `GET /api/v1/menu/today` - Fetch today's menu items based on weekday
  - `GET /api/v1/menu/week` - Fetch full weekly menu (admin only)
  - Create menu controller and service
  - Add ordering window validation middleware
  - Filter by active items and correct weekday

- [x] **1.2 System Config Service**
  - Create system config service for retrieving/updating config
  - Seed default ordering window times (8:00 AM - 10:30 AM)
  - Create utility to check if current time is within ordering window
  - Add config keys: `ordering_window_start`, `ordering_window_end`

#### Frontend Tasks
- [x] **1.3 Menu Page Component**
  - Create MenuPage component with route `/menu`
  - Fetch and display today's menu items
  - Group items by category (Main, Side, Drink, Dessert, Other)
  - Display item cards with: image, name, description, price, dietary tags
  - Show ordering window countdown timer
  - Display message when ordering window is closed
  - Add dietary tag filters

- [x] **1.4 Shopping Cart System**
  - Create CartContext for global cart state management
  - Cart data structure: items with quantity, customizations, special requests
  - Add to cart functionality from menu items
  - Cart sidebar/drawer component
  - Cart item list with quantity controls (+/-)
  - Remove item from cart
  - Clear entire cart
  - Display cart subtotal
  - Customization options UI per item
  - Special requests text field
  - Persist cart in localStorage (optional enhancement)

**Deliverables**: Staff can browse today's menu and add items to cart during ordering window ✅

---

### **Phase 2: Order Placement & Payment**
**Timeline**: Week 2-3
**Status**: Not Started

#### Backend Tasks
- [ ] **2.1 Order API Endpoints**
  - `POST /api/v1/orders` - Create order with items
  - `GET /api/v1/orders/my-orders` - Get user's order history
  - `GET /api/v1/orders/:id` - Get single order details
  - Create order controller and service
  - Implement order number generation (e.g., ORD-20251007-001)
  - Add validation: one order per user per day
  - Validate items are from today's menu
  - Check ordering window is active

- [ ] **2.2 Enhanced Payment Integration**
  - Update payment service to create payment intent with order context
  - Link payment intent to pending order
  - Webhook handler to confirm order on payment success
  - Atomically create order and order items on payment confirmation
  - Handle payment failures and order cleanup
  - Store transaction details in Order.paymentId

- [ ] **2.3 Order Confirmation**
  - Send order confirmation email with details
  - Generate receipt data
  - Return order confirmation response

#### Frontend Tasks
- [ ] **2.4 Checkout Flow**
  - Create CheckoutPage component with route `/checkout`
  - Display order summary (items, quantities, customizations, total)
  - Integrate Stripe Elements for payment form
  - Create PaymentForm component (enhance existing)
  - Handle payment submission
  - Show loading state during payment processing
  - Error handling for payment failures

- [ ] **2.5 Order Confirmation Page**
  - Create OrderConfirmationPage component
  - Display order number, timestamp, items, total
  - Show estimated ready time
  - Link to order status page
  - Success message and next steps

- [ ] **2.6 Order Status Page**
  - Create OrderStatusPage component with route `/orders/:id`
  - Display order details and current status
  - Status badges: Placed → Preparing → Ready
  - Show fulfillment progress

**Deliverables**: Staff can complete checkout, make payment, and receive order confirmation

---

### **Phase 3: Kitchen Dashboard**
**Timeline**: Week 3-4
**Status**: Not Started

#### Backend Tasks
- [ ] **3.1 Kitchen API Endpoints**
  - `GET /api/v1/orders/today` - Get all orders for current date
  - `GET /api/v1/orders/summary` - Get orders grouped by menu item
  - `PATCH /api/v1/orders/:id/status` - Update order fulfillment status
  - Add role-based middleware for kitchen staff access
  - Implement grouping/aggregation logic for batch view
  - Filter options: by menu item, status, time range

- [ ] **3.2 Order Query Services**
  - Create kitchen service for order queries
  - Aggregate orders by menu item with quantities
  - Include customizations for each item instance
  - Calculate total quantities per menu item

#### Frontend Tasks
- [ ] **3.3 Kitchen Dashboard Page**
  - Create KitchenDashboardPage component with route `/kitchen`
  - Protected route for KITCHEN and ADMIN roles only
  - Tab navigation: Batch View | Order List View

- [ ] **3.4 Batch View**
  - Display orders grouped by menu item
  - Show total quantity needed per item
  - List all customizations for each item type
  - Mark item batch as prepared
  - Expandable details showing which orders need each item

- [ ] **3.5 Order List View**
  - Display chronological list of all orders
  - Order cards with: order number, staff name, timestamp, items
  - Show fulfillment status
  - Mark individual orders as Ready
  - Filter by status (Placed, Preparing, Ready)
  - Search by order number or staff name

- [ ] **3.6 Kitchen Ticket Printing**
  - Create print-friendly view CSS
  - Print all orders button
  - Print individual order ticket
  - Print batch summary (quantities per item)

**Deliverables**: Kitchen staff can view orders, batch prepare items, and update fulfillment status

---

### **Phase 4: Admin Panel**
**Timeline**: Week 4-5
**Status**: Not Started

#### Backend Tasks
- [ ] **4.1 Menu Management API**
  - `POST /api/v1/admin/menu/items` - Create menu item
  - `PUT /api/v1/admin/menu/items/:id` - Update menu item
  - `DELETE /api/v1/admin/menu/items/:id` - Delete/deactivate menu item
  - `POST /api/v1/admin/menu/items/:id/customizations` - Add customization
  - `DELETE /api/v1/admin/menu/customizations/:id` - Remove customization
  - Add admin role middleware
  - Validate menu item data
  - Handle image upload URLs

- [ ] **4.2 User Management API**
  - `GET /api/v1/admin/users` - List all users with pagination
  - `PATCH /api/v1/admin/users/:id/role` - Update user role
  - `PATCH /api/v1/admin/users/:id/status` - Activate/deactivate user
  - Search and filter users
  - Prevent self-demotion logic

- [ ] **4.3 System Configuration API**
  - `GET /api/v1/admin/config` - Get all system config
  - `PUT /api/v1/admin/config` - Update system config
  - Validate ordering window times
  - Ensure end time is after start time
  - Maximum window duration validation

- [ ] **4.4 Image Upload Integration**
  - Integrate with Cloudinary or AWS S3
  - Create upload service
  - Generate signed upload URLs
  - Handle image optimization and CDN delivery

#### Frontend Tasks
- [ ] **4.5 Admin Dashboard**
  - Create AdminDashboardPage with route `/admin`
  - Protected route for ADMIN role only
  - Navigation sidebar: Menu Management | User Management | System Config

- [ ] **4.6 Menu Management Interface**
  - Menu items table with weekday tabs (Mon-Fri)
  - Add new menu item form/modal
  - Edit menu item form
  - Delete confirmation dialog
  - Image upload widget
  - Category and dietary tags selectors
  - Customization options manager (add/remove options)
  - Active/inactive toggle
  - Preview weekly menu view

- [ ] **4.7 User Management Interface**
  - Users table with columns: name, email, role, status, registration date
  - Search by name/email
  - Filter by role
  - Role promotion/demotion dropdown
  - Activate/deactivate toggle
  - Confirmation dialogs for role changes

- [ ] **4.8 System Configuration Interface**
  - Configuration form for ordering window
  - Time pickers for start/end times
  - Validation error display
  - Save confirmation
  - Display when changes take effect

**Deliverables**: Admin can manage menu items, users, and system configuration through UI

---

### **Phase 5: Polish & Testing**
**Timeline**: Week 5-6
**Status**: Not Started

#### Backend Tasks
- [ ] **5.1 Order History API**
  - Enhance `GET /api/v1/orders/my-orders` with date filters
  - Add pagination
  - Sort by date descending

- [ ] **5.2 Reporting API**
  - `GET /api/v1/admin/reports/daily` - Daily order summary
  - `GET /api/v1/admin/reports/weekly` - Weekly revenue report
  - `GET /api/v1/admin/reports/popular-items` - Most ordered items
  - Export to CSV functionality

- [ ] **5.3 Receipt Generation**
  - PDF receipt generation service
  - Email receipt on order confirmation
  - Download receipt endpoint

#### Frontend Tasks
- [ ] **5.4 Order History Page**
  - Create OrderHistoryPage component with route `/orders`
  - Display user's past orders
  - Date range filter
  - Order cards with basic info
  - View details link
  - Download receipt button

- [ ] **5.5 Reporting Dashboard**
  - Create ReportsPage for admin
  - Daily summary charts
  - Revenue graphs
  - Popular items list
  - Export reports to CSV

- [ ] **5.6 UI/UX Polish**
  - Add loading skeletons for all data fetching
  - Error boundaries for graceful error handling
  - Toast notifications for actions (success/error)
  - Form validation with helpful error messages
  - Consistent spacing and styling
  - Responsive design improvements for mobile/tablet
  - Empty states for no data scenarios
  - Accessibility improvements (ARIA labels, keyboard navigation)

- [ ] **5.7 Testing**
  - End-to-end testing for critical user flows:
    - Registration → Login → Order → Payment → Confirmation
    - Kitchen: View orders → Update status
    - Admin: Add menu item → Assign to weekday
  - Cross-browser testing (Chrome, Firefox, Safari, Edge)
  - Mobile responsive testing (iOS Safari, Chrome Mobile)
  - Payment testing with Stripe test cards
  - Edge cases: expired ordering window, duplicate orders, payment failures
  - Performance testing with 50+ concurrent users

- [ ] **5.8 Documentation**
  - API documentation (Swagger/Postman collection)
  - Staff user guide with screenshots
  - Kitchen staff training document
  - Admin training materials
  - Deployment guide
  - Environment setup instructions
  - Troubleshooting guide

**Deliverables**: Production-ready MVP with documentation and testing complete

---

## Implementation Timeline

```
Week 1:     Phase 1 - Menu API + Menu Page
Week 2:     Phase 1 - Shopping Cart | Phase 2 - Order API
Week 3:     Phase 2 - Checkout & Payment Flow
Week 4:     Phase 3 - Kitchen Dashboard
Week 5:     Phase 4 - Admin Panel (Menu + Users)
Week 6:     Phase 4 - Admin Config | Phase 5 - Order History
Week 7:     Phase 5 - Reporting + Polish
Week 8:     Phase 5 - Testing + Documentation
```

---

## Technical Stack

### Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+ (Neon cloud)
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Payment**: Stripe SDK
- **Email**: Nodemailer (to be integrated)
- **Validation**: Zod (to be added)

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Payment UI**: Stripe Elements (@stripe/react-stripe-js)
- **Forms**: React Hook Form (to be added)

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Development**: Concurrent backend + frontend servers
- **Deployment**: TBD (AWS/Vercel/Railway)

---

## Progress Tracking

### Phase 1: Menu Browsing & Cart System
**Status**: ✅ Completed (October 7, 2025)
**Progress**: 4/4 tasks completed
**Blockers**: None

**Completed Tasks**:
- ✅ Menu API endpoints (`GET /api/v1/menu/today`, `GET /api/v1/menu/week`, `GET /api/v1/menu/items/:id`)
- ✅ System config service with ordering window validation
- ✅ Menu page component with category grouping and dietary tag filtering
- ✅ Shopping cart context with localStorage persistence
- ✅ Cart drawer UI with quantity controls and customization display
- ✅ Database seeded with 18 menu items across all weekdays
- ✅ Ordering window configuration (8:00 AM - 10:30 AM)

**Deliverables**: Staff can browse today's menu and add items to cart with customizations ✅

### Phase 2: Order Placement & Payment
**Status**: 🔴 Not Started
**Progress**: 0/6 tasks completed
**Blockers**: Depends on Phase 1

### Phase 3: Kitchen Dashboard
**Status**: 🔴 Not Started
**Progress**: 0/6 tasks completed
**Blockers**: Depends on Phase 2

### Phase 4: Admin Panel
**Status**: 🔴 Not Started
**Progress**: 0/8 tasks completed
**Blockers**: None (can start in parallel with Phase 3)

### Phase 5: Polish & Testing
**Status**: 🔴 Not Started
**Progress**: 0/8 tasks completed
**Blockers**: Depends on Phases 1-4

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Stripe payment integration complexity | Use Stripe test mode extensively; implement comprehensive error handling |
| Ordering window logic errors | Thorough testing with different timezones; clear validation messages |
| Kitchen staff UI usability | User testing with actual kitchen staff; iterative feedback |
| Performance with many concurrent users | Database indexing; caching strategies; load testing |
| Browser compatibility issues | Cross-browser testing early; use polyfills where needed |

---

## Success Criteria

- [ ] Staff can register, login, and place orders during ordering window
- [ ] Payment processing works reliably with Stripe
- [ ] Kitchen staff can view and manage orders efficiently
- [ ] Admin can manage weekly menu without technical assistance
- [ ] System enforces ordering window correctly
- [ ] One order per user per day validation works
- [ ] Mobile responsive design works on common devices
- [ ] No critical bugs in production
- [ ] Documentation complete for all user roles

---

## Notes

- All features align with PRD.md Section 4 (Functional Requirements)
- Focus on P0 (Must Have) features for MVP
- P1 (Should Have) features included in Phase 5
- Regular commits and branch management for each phase
- Weekly progress reviews recommended

---

## References

- **PRD**: `./PRD.md` - Complete product requirements
- **CLAUDE.md**: `./CLAUDE.md` - Project context and setup
- **Database Schema**: `./backend/prisma/schema.prisma`
- **Getting Started**: `./GETTING_STARTED.md`

---

**Last Updated**: October 7, 2025
**Next Review**: After Phase 2 completion
**Recent Changes**:
- Phase 1 completed successfully (Menu browsing & cart system)
- All Phase 1 tasks marked as complete
- Ready to begin Phase 2 (Order placement & payment)
