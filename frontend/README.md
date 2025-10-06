# HRC Kitchen Frontend

React web application with TypeScript, Vite, and Material-UI.

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

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Project Structure

```
frontend/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable React components
│   ├── contexts/     # React context providers
│   ├── pages/        # Page components
│   ├── services/     # API service functions
│   ├── types/        # TypeScript types
│   ├── utils/        # Utility functions
│   ├── App.tsx       # Main app component
│   ├── main.tsx      # Application entry point
│   ├── theme.ts      # Material-UI theme
│   └── index.css     # Global styles
└── vite.config.ts    # Vite configuration
```

## Features

- React 18 with TypeScript
- Vite for fast development and building
- Material-UI for component library
- React Router for navigation
- Axios for API calls
- React Hook Form for form handling
- Stripe Elements for payment processing
- Context API for state management

## Development

The development server includes:
- Hot module replacement (HMR)
- API proxy to backend (http://localhost:3000)
- TypeScript type checking
- ESLint for code quality

## Building for Production

```bash
npm run build
```

This will create an optimized production build in the `dist/` directory.

## Environment Variables

See `.env.example` for all required environment variables.
