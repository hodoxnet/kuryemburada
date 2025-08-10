# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Önemli Kurallar

### Dil Kuralı
**Bu projede çalışırken her zaman Türkçe konuş ve yanıtla.** Kod yorumları, commit mesajları, dokümantasyon ve kullanıcıyla olan tüm iletişim Türkçe olmalıdır.

### MCP Context Kuralı
**Güncel dokümantasyon ve API referansları için Context 7 MCP'yi kullan.** Özellikle NestJS, Prisma, Redis ve diğer teknolojilerle ilgili güncel bilgiler için Context 7 MCP aracılığıyla dokümantasyonlara erişim sağla. Bu, en güncel best practice'leri ve API değişikliklerini takip etmeni sağlayacaktır.

## Project Overview

This is a courier operation management system (Kurye Operasyon Sistemi) built with NestJS backend and planned Next.js frontend. The system manages courier companies, couriers, orders, and payments with role-based access control.

## Development Commands

### Backend Commands (run from `/backend` directory)

```bash
# Install dependencies
npm install

# Database operations
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio GUI

# Development
npm run start:dev          # Start in watch mode (port 3001)
npm run start:debug        # Start with debugging

# Production
npm run build              # Build for production
npm run start:prod         # Run production build

# Code quality
npm run lint               # Run ESLint
npm run format             # Format with Prettier

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Generate coverage report
npm run test:e2e           # Run end-to-end tests
```

## High-Level Architecture

### Technology Stack
- **Backend**: NestJS with TypeScript, PostgreSQL database, Prisma ORM
- **Authentication**: JWT with role-based access (SUPER_ADMIN, COMPANY, COURIER)
- **Caching**: Redis integration for performance optimization
- **API Documentation**: Swagger available at `http://localhost:3001/api-docs`
- **Logging**: Winston logger with custom configuration

### Database Architecture

The system uses PostgreSQL with Prisma ORM. Key entities and their relationships:

- **User**: Core authentication entity with role-based access
- **Company**: Business entities that create delivery orders
- **Courier**: Delivery personnel with vehicle and document tracking
- **Order**: Delivery requests with full lifecycle tracking
- **Payment**: Financial transactions linked to orders
- **Document**: File uploads for verification (licenses, certificates)
- **Notification**: User notifications system
- **PricingRule**: Flexible pricing configuration

### Module Structure

The backend follows NestJS modular architecture:

- **AppModule**: Root module with global configurations
- **AuthModule**: JWT authentication, role guards, password management
- **PrismaModule**: Database service provider
- **CacheModule**: Redis caching implementation
- **Common**: Shared decorators, filters, interceptors, and utilities

### Security Implementation

- JWT tokens for authentication
- Role-based guards for authorization
- Global exception filters for error handling
- Request logging interceptor
- Environment-based configuration
- Password hashing with bcrypt

### API Patterns

All API endpoints follow RESTful conventions with:
- Consistent error responses via global exception filter
- Request validation using class-validator
- Automatic API documentation generation
- CORS enabled for cross-origin requests

## Environment Configuration

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Application port (default: 3001)
- Redis configuration for caching

## Testing Strategy

The project uses Jest for testing with separate configurations for unit and e2e tests. Test files follow the `*.spec.ts` pattern for unit tests and are located in the `/test` directory for e2e tests.