# Backend Server

Modern Express.js backend server with TypeScript.

## Features

- 🚀 Express.js with TypeScript
- 🔒 Security headers with Helmet
- 🌐 CORS support
- 📝 Request logging with Morgan
- ✅ Input validation with Zod
- 🔄 Hot reload with tsx
- 🐳 Docker support

## Getting Started

### Prerequisites

- Node.js >= 24.2.0
- pnpm >= 10.11.0

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
```

### Development

```bash
# Start development server with hot reload
pnpm dev
```

The server will start on `http://localhost:3000`

### Building for Production

```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status.

### API Root
```
GET /api
```
Returns API information and available endpoints.

### Users
```
GET /api/users
POST /api/users
```
Example CRUD endpoints.

## Environment Variables

See `.env.example` for all available configuration options.

## Project Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API routes
└── index.ts         # Application entry point
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

