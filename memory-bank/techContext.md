# Tech Context: Portfolio Resume System

## Technology Stack Overview

### Frontend Technologies

#### Core Framework
- **Next.js 15** (App Router)
  - Latest version with enhanced performance and caching
  - Server Components and Client Components architecture
  - Built-in optimizations for images, fonts, and routing
  - Middleware support for authentication and routing

- **React 19**
  - Latest React version with concurrent features
  - Server Actions integration
  - Improved error boundaries and suspense
  - Automatic batching for state updates

#### UI Framework & Styling
- **shadcn/ui**
  - Modern, accessible component library
  - Built on Radix UI primitives
  - Tailwind CSS integration
  - Dark mode support via next-themes

- **Tailwind CSS v4**
  - Utility-first CSS framework
  - Optimized build process
  - Responsive design utilities
  - Custom design system integration

#### State Management & Data Fetching
- **TanStack Query (React Query)**
  - Server state management
  - Caching and background refetching
  - Optimistic updates
  - Query invalidation strategies

- **tRPC v11**
  - End-to-end type safety
  - Auto-generated client
  - Procedure-based API design
  - Built-in error handling

#### Forms & Validation
- **React Hook Form v7**
  - Performant form library
  - Minimal re-renders
  - Easy integration with validation schemas

- **Zod v3**
  - TypeScript-first schema validation
  - Runtime type checking
  - Automatic type inference
  - API validation integration

### Backend Technologies

#### API Layer
- **tRPC Server**
  - Type-safe API procedures
  - Middleware support
  - Input/output validation
  - Router composition

- **Next.js API Routes**
  - RESTful endpoints for specific use cases
  - AI streaming endpoints
  - PDF generation endpoints
  - File download handlers

#### Database & ORM
- **PostgreSQL**
  - Primary database (production)
  - ACID compliance
  - Full-text search capabilities
  - JSONB support for flexible data

- **Prisma ORM v6**
  - Type-safe database access
  - Auto-generated client
  - Migration management
  - Query optimization

- **SQLite** (Development)
  - Local development database
  - Easy setup and migration
  - Compatible schema with PostgreSQL

#### Authentication
- **Better Auth v1.3**
  - Modern authentication library
  - GitHub OAuth integration
  - Email/password authentication
  - Session management
  - Type-safe client/server integration

### AI & External Services

#### AI Integration
- **OpenAI API**
  - gpt-5-mini model for job matching
  - Structured output generation
  - Streaming responses via AI SDK

- **Vercel AI SDK v5**
  - Streaming AI responses
  - Structured output generation
  - Model-agnostic interface
  - React hooks for AI integration

#### PDF Generation
- **@react-pdf/renderer v4**
  - React-based PDF generation
  - Declarative PDF components
  - Custom layouts and styling
  - Font and image support

- **DOCX Generation** (docx v9)
  - Word document export
  - Template-based generation
  - Rich text formatting

### Development Tools & Configuration

#### Code Quality & Linting
- **Biome v2**
  - Fast linter and formatter
  - TypeScript support
  - Import sorting
  - Code formatting rules

- **TypeScript v5.8**
  - Static type checking
  - Enhanced type inference
  - Path mapping support
  - Strict mode configuration

#### Package Management
- **npm v11**
  - Package dependency management
  - Script execution
  - Lock file management
  - Workspaces support

#### Build & Deployment
- **Next.js Build System**
  - Optimized production builds
  - Code splitting
  - Asset optimization
  - Static generation support

## Development Environment Setup

### Prerequisites
```bash
# Required versions
Node.js >= 18.0.0
npm >= 8.0.0
PostgreSQL >= 14 (production)
```

### Environment Configuration
```typescript
// src/env.js - Environment schema
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    OPENAI_API_KEY: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_GITHUB_CLIENT_ID: z.string().optional(),
    BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string().optional(),
    BETTER_AUTH_URL: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_GITHUB_CLIENT_ID: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
    BETTER_AUTH_GITHUB_CLIENT_SECRET: process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

### Database Setup
```bash
# Development setup
npm run db:push          # Push schema to SQLite
npm run db:seed          # Seed common skills and institutions
npm run db:studio        # Open Prisma Studio

# Production setup
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations on PostgreSQL
```

## Key Technical Decisions

### 1. Next.js App Router vs Pages Router
**Decision**: App Router
**Rationale**:
- Server Components for better performance
- Improved caching strategies
- Better TypeScript support
- Future-proof architecture

### 2. tRPC vs Traditional REST API
**Decision**: tRPC for core APIs, REST for specific endpoints
**Rationale**:
- End-to-end type safety for main application logic
- REST for streaming AI responses and file downloads
- Better developer experience with tRPC
- Automatic client generation

### 3. Prisma vs Other ORMs
**Decision**: Prisma
**Rationale**:
- Excellent TypeScript integration
- Auto-generated types
- Migration management
- Query optimization
- Great developer experience

### 4. Better Auth vs NextAuth.js
**Decision**: Better Auth
**Rationale**:
- Modern, lightweight alternative
- Better TypeScript support
- Simpler configuration
- Active development
- Better performance

### 5. shadcn/ui vs Other UI Libraries
**Decision**: shadcn/ui
**Rationale**:
- Built on Radix UI primitives
- Full customization control
- Excellent accessibility
- Modern design system
- Tailwind CSS integration

## Performance Optimizations

### Frontend Optimizations
```typescript
// Image optimization
import Image from 'next/image';

// Component lazy loading
import dynamic from 'next/dynamic';
const PDFViewer = dynamic(() => import('./PDFViewer'), {
  loading: () => <PDFViewerSkeleton />,
  ssr: false
});

// Route-level caching
export const revalidate = 3600; // 1 hour
```

### Backend Optimizations
```typescript
// Database query optimization
const getPortfolioOptimized = async (userId: string) => {
  return prisma.portfolio.findUnique({
    where: { userId },
    select: {
      // Only select needed fields
      id: true,
      name: true,
      email: true,
      workExperiences: {
        orderBy: { startDate: 'desc' },
        take: 10 // Limit results
      }
    }
  });
};

// Response caching
export const GET = async () => {
  const skills = await getCachedSkills();
  return NextResponse.json(skills, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
};
```

### AI Integration Optimizations
```typescript
// Streaming with structured output
const streamJobAnalysis = async (jobDescription: string, portfolio: Portfolio) => {
  return streamObject({
    model: openai('gpt-5-mini'),
    schema: jobMatchingSchema,
    prompt: formatOptimizedPrompt(jobDescription, portfolio),
    maxTokens: 2000, // Limit tokens for cost control
  });
};

// Prompt optimization
const formatOptimizedPrompt = (job: string, portfolio: Portfolio) => {
  return `
    Analyze this job description and select relevant portfolio items.
    
    JOB: ${job.substring(0, 2000)} // Limit input length
    
    PORTFOLIO: ${formatPortfolioCompact(portfolio)}
    
    Return only the IDs of most relevant items.
  `;
};
```

## Security Implementation

### Authentication Security
```typescript
// Better Auth configuration
export const auth = betterAuth({
  database: {
    provider: 'prisma',
    prisma: prisma
  },
  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day
  },
  advanced: {
    generateId: false, // Use database-generated IDs
    crossSubDomainCookies: false
  }
});
```

### Data Validation Security
```typescript
// Input validation schemas
const resumeInputSchema = z.object({
  name: z.string().min(1).max(100),
  jobDescription: z.string().min(10).max(10000),
  selectedItemIds: z.object({
    workExperienceIds: z.array(z.string()),
    educationIds: z.array(z.string()),
    projectIds: z.array(z.string()),
    achievementIds: z.array(z.string()),
    skillIds: z.array(z.string())
  })
});

// SQL injection prevention via Prisma
const getUserResumes = async (userId: string) => {
  // Prisma automatically sanitizes input
  return prisma.resume.findMany({
    where: { userId }, // Safe parameterized query
    orderBy: { createdAt: 'desc' }
  });
};
```

### API Security
```typescript
// Rate limiting middleware
const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const ip = ctx.req?.ip || 'unknown';
  const key = `rate-limit:${ip}`;
  
  const requests = await redis.incr(key);
  if (requests === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  
  if (requests > 100) { // 100 requests per minute
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
  }
  
  return next();
});

// Protected procedures
export const protectedProcedure = t.procedure
  .use(rateLimitMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  });
```

## Monitoring & Observability

### Error Tracking
```typescript
// Global error handler
export const errorHandler = (error: Error) => {
  console.error('Application error:', error);
  
  // Send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket, etc.
  }
  
  // Log structured data
  logger.error({
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
};
```

### Performance Monitoring
```typescript
// API response time tracking
const performanceMiddleware = t.middleware(async ({ ctx, next }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;
  
  logger.info({
    procedure: ctx._def.type,
    path: ctx._def.path,
    duration,
    timestamp: new Date().toISOString()
  });
  
  return result;
});
```

## Deployment Configuration

### Environment Variables
```bash
# Production environment
DATABASE_URL="postgresql://user:password@localhost:5432/resume_db"
OPENAI_API_KEY="sk-..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_GITHUB_CLIENT_ID="..."
BETTER_AUTH_GITHUB_CLIENT_SECRET="..."
NEXT_PUBLIC_APP_URL="https://yourapp.com"
```

### Build Configuration
```json
// package.json scripts
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "preview": "next build && next start",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "typecheck": "tsc --noEmit",
    "check": "biome check ."
  }
}
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
COPY . .
RUN npm ci
RUN npm run build

FROM base AS runner
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## Future Technology Considerations

### Potential Upgrades
1. **Database**: Consider PostgreSQL extensions for full-text search
2. **AI Models**: Evaluate newer OpenAI models or alternatives
3. **File Storage**: Add S3 or similar for PDF storage
4. **CDN**: Implement CDN for static assets
5. **Monitoring**: Add APM tools like New Relic or DataDog

### Scalability Planning
1. **Database**: Read replicas for heavy read operations
2. **AI**: Queue system for batch processing
3. **Files**: Object storage for generated PDFs
4. **Caching**: Redis for session and query caching
5. **Load Balancing**: Multiple app instances behind load balancer

### Technology Debt Management
1. **Dependencies**: Regular security updates and audits
2. **Code Quality**: Maintain test coverage above 80%
3. **Performance**: Regular performance audits and optimization
4. **Documentation**: Keep technical documentation current
5. **Monitoring**: Implement comprehensive logging and alerting
