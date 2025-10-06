# HRC Kitchen - Lunch Ordering System

A web-based lunch ordering system for Huon Regional Care staff featuring self-service registration, daily rotating menus, time-windowed ordering, and secure payment processing.

## Project Structure

```
hrc-kitchen/
├── backend/          # Node.js/Express/TypeScript API server
├── frontend/         # React/TypeScript web application
├── docker/           # Docker configuration files
├── docs/            # Additional documentation
├── PRD.md           # Product Requirements Document
└── CLAUDE.md        # Claude Code project instructions
```

## Tech Stack

### Backend
- Node.js 18+ with TypeScript
- Express.js
- PostgreSQL 14+
- Prisma ORM
- JWT Authentication
- Stripe Payment Integration

### Frontend
- React 18+ with TypeScript
- Vite
- React Router v6
- Material-UI
- Axios
- React Hook Form

## Prerequisites

- Node.js 18+ LTS
- PostgreSQL 14+
- npm 9+
- Stripe account (for payments)

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration

   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

3. **Set up database:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

   - Backend API: http://localhost:3000
   - Frontend: http://localhost:5173

## Available Scripts

- `npm run dev` - Start both backend and frontend in development mode
- `npm run build` - Build both applications for production
- `npm run start` - Start production backend server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm test` - Run tests for all workspaces

## Development

See individual README files for detailed information:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## Documentation

- [Product Requirements Document](./PRD.md) - Complete functional and technical specifications
- [API Documentation](./docs/api.md) - API endpoints and usage (coming soon)
- [Database Schema](./docs/database.md) - Database structure (coming soon)

## Project Phases

### Phase 1: MVP (Current)
- User registration and authentication
- Basic menu display
- Order placement with cart
- Stripe payment integration
- Kitchen dashboard
- Order status tracking
- Admin menu management
- Ordering window enforcement

## License

Proprietary - Huon Regional Care

## Support

For issues or questions, contact: support@hrc-kitchen.com
