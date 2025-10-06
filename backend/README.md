# HRC Kitchen Backend

Express.js API server with TypeScript, PostgreSQL, and Prisma ORM.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
│   └── seed.ts           # Seed data
├── src/
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/          # Data models (if needed)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   └── index.ts         # Application entry point
├── tests/               # Test files
└── logs/               # Application logs
```

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Verify email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Menu
- `GET /menu/today` - Get today's menu
- `GET /menu/week` - Get weekly menu (admin)
- `POST /menu/items` - Create menu item (admin)
- `PUT /menu/items/:id` - Update menu item (admin)
- `DELETE /menu/items/:id` - Delete menu item (admin)

### Orders
- `POST /orders` - Create order
- `GET /orders/my-orders` - Get user's orders
- `GET /orders/today` - Get today's orders (kitchen)
- `PATCH /orders/:id/status` - Update order status (kitchen)

### Payment
- `POST /payment/create-intent` - Create Stripe payment intent
- `POST /payment/confirm` - Confirm payment

### Admin
- `GET /admin/users` - List all users
- `PATCH /admin/users/:id/role` - Update user role
- `GET /admin/config` - Get system config
- `PUT /admin/config` - Update system config
- `GET /admin/reports/daily` - Daily report
- `GET /admin/reports/weekly` - Weekly report

## Environment Variables

See `.env.example` for all required environment variables.

## Database

PostgreSQL database managed with Prisma ORM. Run migrations to set up the schema:

```bash
npm run db:migrate
```

View and edit data with Prisma Studio:

```bash
npm run db:studio
```

## Testing

```bash
npm test
```

## Security

- JWT authentication
- bcrypt password hashing
- Helmet security headers
- CORS configuration
- Rate limiting
- Input validation
