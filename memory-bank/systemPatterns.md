# System Patterns: Portfolio Resume System

## Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  Next.js 15 App Router + React 19 + shadcn/ui              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Dashboard     │ │   Landing       │ │   Authentication│ │
│  │   - Profile     │ │   - Marketing   │ │   - Sign In/Up  │ │
│  │   - Personalize │ │   - Features    │ │   - OAuth       │ │
│  │   - History     │ │   - CTA         │ │                 │ │
│  │   - ATS Analyzer│ │                 │ │                 │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   tRPC Routers  │ │   REST APIs     │ │   Auth APIs     │ │
│  │   - Portfolio   │ │   - AI Stream   │ │   - Better Auth │ │
│  │   - Resume      │ │   - PDF Gen     │ │   - Sessions    │ │
│  │   - ATS         │ │   - Download    │ │   - OAuth       │ │
│  │   - Post        │ │                 │ │                 │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
┌──────────────────┐   ┌────────────────────┐
│  Database Layer  │   │   External APIs    │
│  PostgreSQL      │   │  - OpenAI GPT-4o   │
│  Prisma ORM      │   │  - GitHub OAuth    │
│                  │   │  - Email Service  │
└──────────────────┘   └────────────────────┘
```

## Core Design Patterns

### 1. Repository Pattern with Prisma

**Implementation**: All database operations go through Prisma client with type-safe queries

```typescript
// Example: Portfolio Repository
export class PortfolioRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: string) {
    return this.prisma.portfolio.findUnique({
      where: { userId },
      include: {
        workExperiences: true,
        educations: true,
        projects: true,
        achievements: true,
        skills: { include: { skill: true } }
      }
    });
  }

  async updateWorkExperience(id: string, data: Partial<WorkExperience>) {
    return this.prisma.workExperience.update({
      where: { id },
      data
    });
  }
}
```

**Benefits**:
- Type-safe database operations
- Centralized data access logic
- Easy testing and mocking
- Consistent error handling

### 2. tRPC Router Pattern

**Implementation**: Modular routers for different domains with shared middleware

```typescript
// Portfolio Router Example
export const portfolioRouter = t.router({
  get: t.procedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.portfolio.findUnique({
        where: { userId: input },
        include: portfolioIncludes
      });
    }),

  updateContact: t.procedure
    .input(contactInfoSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.portfolio.upsert({
        where: { userId: ctx.user.id },
        update: input,
        create: { userId: ctx.user.id, ...input }
      });
    })
});
```

**Benefits**:
- End-to-end type safety
- Automatic client-side type inference
- Shared validation logic
- Built-in error handling

### 3. Streaming AI Pattern

**Implementation**: Real-time AI responses using Vercel AI SDK

```typescript
// AI Streaming Endpoint
export async function POST(req: Request) {
  const { jobDescription, portfolio } = await req.json();
  
  const result = streamObject({
    model: openai('gpt-4o-mini'),
    schema: jobMatchingSchema,
    prompt: formatJobMatchingPrompt(jobDescription, portfolio),
    onFinish: ({ object }) => {
      // Log completion for analytics
    }
  });

  return result.toDataStreamResponse();
}
```

**Benefits**:
- Real-time user feedback
- Progressive enhancement
- Reduced perceived latency
- Better user experience

### 4. Component Composition Pattern

**Implementation**: Reusable UI components with prop-based customization

```typescript
// Example: Form Section Component
interface FormSectionProps<T> {
  title: string;
  data: T[];
  onAdd: () => void;
  onUpdate: (id: string, data: Partial<T>) => void;
  onDelete: (id: string) => void;
  renderForm: (item: T, onSave: (data: T) => void) => React.ReactNode;
}

export function FormSection<T>({
  title,
  data,
  onAdd,
  onUpdate,
  onDelete,
  renderForm
}: FormSectionProps<T>) {
  // Generic form section implementation
}
```

**Benefits**:
- Code reuse across different data types
- Consistent UI patterns
- Type-safe component props
- Easy maintenance and updates

## Data Flow Patterns

### 1. Optimistic Update Pattern

**Implementation**: UI updates immediately, then syncs with server

```typescript
// Example: Work Experience Update
const updateWorkExperience = useMutation({
  mutationFn: async (data: WorkExperienceInput) => {
    return trpc.portfolio.updateWorkExperience.mutate(data);
  },
  onMutate: async (newData) => {
    // Cancel in-flight queries
    await queryClient.cancelQueries({ queryKey: ['portfolio'] });
    
    // Snapshot previous value
    const previousPortfolio = queryClient.getQueryData(['portfolio']);
    
    // Optimistically update
    queryClient.setQueryData(['portfolio'], (old: Portfolio) => ({
      ...old,
      workExperiences: old.workExperiences.map(exp => 
        exp.id === newData.id ? { ...exp, ...newData } : exp
      )
    }));
    
    return { previousPortfolio };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['portfolio'], context?.previousPortfolio);
  }
});
```

### 2. Server-Side PDF Generation Pattern

**Implementation**: PDF generation on server with client-side download

```typescript
// PDF Generation Endpoint
export async function POST(req: Request) {
  const { resumeId } = await req.json();
  
  const resume = await getResumeWithPortfolio(resumeId);
  const pdfBuffer = await generateResumePDF(resume);
  
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="resume-${resumeId}.pdf"`
    }
  });
}

// Client-side Download
const downloadPDF = async (resumeId: string) => {
  const response = await fetch('/api/resume/download', {
    method: 'POST',
    body: JSON.stringify({ resumeId })
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resume-${resumeId}.pdf`;
  a.click();
};
```

## Security Patterns

### 1. Authentication Middleware Pattern

**Implementation**: Better Auth with route protection

```typescript
// Auth Middleware for tRPC
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});

// Route Protection
export const withAuth = async (req: NextRequest) => {
  const session = await auth.api.getSession({
    headers: req.headers
  });
  
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  
  return session;
};
```

### 2. Data Isolation Pattern

**Implementation**: User-scoped queries with validation

```typescript
// User-Scoped Data Access
export const getUserPortfolio = async (userId: string, requestUserId: string) => {
  if (userId !== requestUserId) {
    throw new Error('Unauthorized access to portfolio data');
  }
  
  return prisma.portfolio.findUnique({
    where: { userId },
    include: portfolioIncludes
  });
};

// Input Validation
const portfolioUpdateSchema = z.object({
  userId: z.string(),
  data: z.object({
    name: z.string().optional(),
    email: z.string().email().optional()
    // ... other fields
  })
});
```

## Performance Patterns

### 1. Query Optimization Pattern

**Implementation**: Efficient database queries with proper indexing

```typescript
// Optimized Portfolio Query
const getPortfolioWithIncludes = async (userId: string) => {
  return prisma.portfolio.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      workExperiences: {
        orderBy: { startDate: 'desc' },
        select: {
          id: true,
          jobTitle: true,
          company: true,
          bulletPoints: true
        }
      },
      skills: {
        select: {
          skill: {
            select: { id: true, name: true, category: true }
          }
        }
      }
      // ... other optimized selects
    }
  });
};
```

### 2. Caching Pattern

**Implementation**: TanStack Query with intelligent caching

```typescript
// Query Configuration
export const usePortfolio = (userId: string) => {
  return useQuery({
    queryKey: ['portfolio', userId],
    queryFn: () => trpc.portfolio.get.query(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

// Skill Caching
export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => trpc.skills.getAll.query(),
    staleTime: 30 * 60 * 1000, // 30 minutes for relatively static data
    initialData: cachedSkills
  });
};
```

## Error Handling Patterns

### 1. Global Error Boundary Pattern

**Implementation**: React Error Boundary with fallback UI

```typescript
// Error Boundary Component
export class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### 2. tRPC Error Handling Pattern

**Implementation**: Structured error responses

```typescript
// Custom Error Types
export class PortfolioNotFoundError extends TRPCError {
  constructor(userId: string) {
    super({
      code: 'NOT_FOUND',
      message: `Portfolio not found for user: ${userId}`
    });
  }
}

// Error Handling in Procedures
export const getPortfolio = protectedProcedure
  .input(z.string())
  .query(async ({ ctx, input }) => {
    try {
      const portfolio = await portfolioService.findByUserId(input);
      if (!portfolio) {
        throw new PortfolioNotFoundError(input);
      }
      return portfolio;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch portfolio'
      });
    }
  });
```

## Testing Patterns

### 1. Component Testing Pattern

**Implementation**: React Testing Library with user-centric tests

```typescript
// Example Component Test
describe('WorkExperienceSection', () => {
  it('should add new work experience', async () => {
    const user = userEvent.setup();
    
    render(<WorkExperienceSection portfolio={mockPortfolio} />);
    
    await user.click(screen.getByText('Add Work Experience'));
    await user.type(screen.getByLabelText('Job Title'), 'Software Engineer');
    await user.type(screen.getByLabelText('Company'), 'Tech Corp');
    await user.click(screen.getByText('Save'));
    
    expect(screen.getByText('Software Engineer at Tech Corp')).toBeInTheDocument();
  });
});
```

### 2. API Testing Pattern

**Implementation**: tRPC testing with mocked database

```typescript
// Example API Test
describe('portfolioRouter', () => {
  it('should update portfolio contact info', async () => {
    const mockCtx = {
      user: { id: 'user1' },
      prisma: mockPrisma
    };
    
    const caller = createCaller(portfolioRouter, mockCtx);
    
    const result = await caller.updateContact({
      name: 'John Doe',
      email: 'john@example.com'
    });
    
    expect(mockPrisma.portfolio.upsert).toHaveBeenCalledWith({
      where: { userId: 'user1' },
      update: { name: 'John Doe', email: 'john@example.com' },
      create: { userId: 'user1', name: 'John Doe', email: 'john@example.com' }
    });
  });
});
```

## Deployment Patterns

### 1. Environment Configuration Pattern

**Implementation**: Type-safe environment variables

```typescript
// Environment Schema
const envSchema = z.object({
  DATABASE_URL: z.string(),
  OPENAI_API_KEY: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_GITHUB_CLIENT_ID: z.string().optional(),
  BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string().optional()
});

export const env = envSchema.parse(process.env);
```

### 2. Database Migration Pattern

**Implementation**: Prisma migrations with seeding

```typescript
// Migration Script
export const runMigrations = async () => {
  try {
    await prisma.$executeRaw`SELECT 1`; // Test connection
    console.log('Database connected successfully');
    
    // Run migrations
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Seed common data if needed
    await seedCommonData();
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};
```

## Future Architecture Considerations

### 1. Microservices Migration Path
- Extract AI service to separate microservice
- Implement event-driven architecture for resume processing
- Add message queue for background job processing

### 2. Scaling Patterns
- Implement read replicas for portfolio queries
- Add CDN for PDF storage and delivery
- Consider serverless functions for AI endpoints

### 3. Monitoring and Observability
- Add structured logging with correlation IDs
- Implement performance monitoring for AI endpoints
- Set up database query performance tracking
