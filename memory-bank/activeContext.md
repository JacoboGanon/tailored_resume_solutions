# Active Context: Portfolio Resume System

## Current Development Focus

### Active Work Areas

#### 1. ATS Analysis & Optimization System
**Status**: Recently implemented and being refined
**Current Focus**: Enhancing the ATS scoring algorithm and user interface

**Key Components Being Worked On**:
- `src/app/api/ats/analyze/route.ts` - ATS analysis endpoint
- `src/app/api/ats/optimize/route.ts` - Resume optimization endpoint
- `src/server/ai/ats-extraction.ts` - AI-powered job/resume data extraction
- `src/server/ai/ats-optimizer.ts` - ATS optimization logic
- `src/components/ats/score-card.tsx` - ATS score visualization
- `src/components/ats/recommendations-list.tsx` - Optimization recommendations
- `src/components/ats/resume-diff-viewer.tsx` - Before/after comparison
- `src/app/dashboard/ats-analyzer/page.tsx` - ATS analysis dashboard

**Recent Changes**:
- Implemented comprehensive ATS scoring system with multiple metrics
- Added real-time resume optimization suggestions
- Created visual diff viewer for resume improvements
- Integrated keyword analysis and skill matching
- Added priority keyword identification

#### 2. DOCX Resume Template Generation
**Status**: New feature implementation
**Current Focus**: Creating Word document export functionality

**Key Components**:
- `src/components/docx/resume-template.ts` - DOCX template implementation
- `src/app/api/resume/download-modified/route.ts` - Modified resume download endpoint

**Implementation Details**:
- Using `docx` library for Word document generation
- Supporting both PDF and DOCX export formats
- Maintaining consistent formatting across formats
- Handling special characters and formatting preservation

#### 3. Enhanced PDF Resume Template
**Status**: Continuous improvement
**Current Focus**: Optimizing layout and ATS compatibility

**Key Components**:
- `src/components/pdf/resume-template.tsx` - PDF template component
- Improved formatting for better ATS parsing
- Enhanced typography and spacing
- Better section organization and hierarchy

### Current Technical Challenges

#### 1. ATS Scoring Accuracy
**Challenge**: Balancing comprehensive analysis with performance
**Current Approach**:
- Multi-factor scoring algorithm (cosine similarity, keyword matching, skill overlap)
- Weighted scoring based on job requirements
- Real-time analysis with streaming responses

**Known Issues**:
- Scoring consistency across different job types
- Handling edge cases in job descriptions
- Optimizing prompt engineering for better AI accuracy

#### 2. PDF/DOCX Template Consistency
**Challenge**: Maintaining visual consistency across export formats
**Current Approach**:
- Shared styling system between PDF and DOCX generators
- Standardized section layouts and typography
- Cross-format compatibility testing

**Technical Considerations**:
- Font rendering differences between formats
- Page break handling in long resumes
- Image and logo placement consistency

#### 3. Performance Optimization
**Challenge**: Real-time AI analysis with large portfolio data
**Current Optimizations**:
- Streaming AI responses for better UX
- Efficient data formatting for AI prompts
- Caching of common skill and institution data

**Areas for Improvement**:
- AI prompt optimization for faster responses
- Database query optimization for large portfolios
- Client-side state management efficiency

### Active Development Patterns

#### 1. Component Architecture
**Current Pattern**: Modular, reusable components with clear separation of concerns

```typescript
// Example: ATS Analysis Component Structure
├── ats/
│   ├── score-card.tsx          // Score visualization
│   ├── recommendations-list.tsx // Recommendations display
│   ├── resume-diff-viewer.tsx   // Before/after comparison
│   └── metric-breakdown.tsx     // Detailed metrics
```

**Benefits**:
- Easy testing and maintenance
- Reusable across different pages
- Clear data flow and state management

#### 2. API Design Pattern
**Current Pattern**: RESTful endpoints for AI operations, tRPC for CRUD operations

```typescript
// AI Operations (REST)
POST /api/ats/analyze     // ATS analysis
POST /api/ats/optimize    // Resume optimization
POST /api/match-job       // Job matching (streaming)

// CRUD Operations (tRPC)
portfolio.get            // Get user portfolio
portfolio.update         // Update portfolio data
resume.create           // Create new resume
resume.history          // Get resume history
```

**Rationale**:
- Streaming support for AI operations
- Type safety for data operations
- Clear separation of concerns

#### 3. State Management Pattern
**Current Pattern**: TanStack Query for server state, local state for UI interactions

```typescript
// Server State (TanStack Query)
const { data: portfolio } = usePortfolio(userId);
const { data: atsAnalysis } = useATSAnalysis(resumeId);

// Local State (useState/useReducer)
const [selectedItems, setSelectedItems] = useState<SelectedItems>();
const [analysisState, setAnalysisState] = useState<'idle' | 'analyzing' | 'complete'>();
```

### Current User Experience Focus

#### 1. ATS Analyzer Dashboard
**User Flow**:
1. User selects existing resume or creates new one
2. System performs ATS analysis with real-time feedback
3. User receives detailed score breakdown and recommendations
4. User can apply optimizations and see before/after comparison
5. Download optimized resume in PDF or DOCX format

**Current Improvements**:
- Better visual feedback during analysis
- More actionable recommendations
- Improved score visualization with progress indicators
- Enhanced diff viewer with clear change highlighting

#### 2. Resume Personalization Flow
**User Flow**:
1. User pastes job description
2. AI analyzes and selects relevant portfolio items in real-time
3. User reviews and adjusts selections
4. System generates ATS-optimized resume
5. User can run ATS analysis before final download

**Current Enhancements**:
- Faster AI response times
- Better selection reasoning explanations
- Improved manual override interface
- Enhanced preview functionality

### Active Technical Decisions

#### 1. AI Model Selection
**Current Choice**: OpenAI gpt-5-mini
**Rationale**:
- Good balance of performance and cost
- Structured output support
- Fast response times for streaming
- High accuracy for job matching tasks

**Considerations**:
- Monitoring token usage and costs
- Evaluating newer models as they become available
- Implementing fallback options for reliability

#### 2. Database Schema Evolution
**Recent Changes**: Added ATS analysis and modified resume tracking

```prisma
// New Models Added
model ATSAnalysis {
  // ATS scoring and analysis data
}

model ModifiedResume {
  // Optimized resume versions
  // Relations to modified portfolio items
}
```

**Impact**:
- Enhanced resume versioning capabilities
- Better tracking of optimization improvements
- Support for A/B testing different resume versions

#### 3. Component Library Usage
**Current Approach**: Heavy use of shadcn/ui components
**Benefits**:
- Consistent design system
- Accessibility built-in
- Easy customization
- Good TypeScript support

**Custom Components**:
- ATS-specific visualizations
- Resume preview components
- Specialized form inputs for portfolio data

### Current Testing Strategy

#### 1. Unit Testing
**Focus**: Core business logic and utility functions
**Coverage Areas**:
- ATS scoring algorithms
- AI prompt formatting
- Data validation schemas
- Utility functions for resume generation

#### 2. Integration Testing
**Focus**: API endpoints and database operations
**Test Scenarios**:
- ATS analysis workflow
- Resume generation and download
- Portfolio CRUD operations
- Authentication flows

#### 3. E2E Testing
**Focus**: Critical user journeys
**Key Flows**:
- Complete resume creation and optimization
- ATS analysis and improvement cycle
- User authentication and portfolio management

### Current Performance Monitoring

#### 1. Key Metrics Tracked
- AI response times (target: <30 seconds)
- PDF generation speed (target: <5 seconds)
- Database query performance
- API error rates and types

#### 2. Optimization Areas
- AI prompt efficiency
- Database query optimization
- Client-side rendering performance
- Bundle size optimization

### Current Security Considerations

#### 1. Data Privacy
- User portfolio data encryption
- Secure API key management
- GDPR compliance considerations
- Data retention policies

#### 2. API Security
- Rate limiting implementation
- Input validation and sanitization
- Authentication middleware
- CORS configuration

### Immediate Next Steps

#### 1. Short-term (1-2 weeks)
- Refine ATS scoring algorithm based on user feedback
- Improve DOCX template formatting consistency
- Add more comprehensive error handling
- Enhance mobile responsiveness of ATS analyzer

#### 2. Medium-term (2-4 weeks)
- Implement A/B testing for different resume templates
- Add cover letter generation functionality
- Improve AI prompt engineering for better accuracy
- Add advanced analytics and insights dashboard

#### 3. Long-term (1-2 months)
- Implement team collaboration features
- Add integration with job boards
- Create advanced ATS optimization tools
- Develop enterprise features for career services

### Current Development Environment

#### 1. Local Development
- Next.js development server with Turbo
- SQLite database for local testing
- Hot reload for rapid development
- Prisma Studio for database management

#### 2. Code Quality Tools
- Biome for linting and formatting
- TypeScript strict mode
- Pre-commit hooks for quality checks
- Automated testing on PRs

#### 3. Deployment Pipeline
- Automated builds on Vercel
- Database migrations on deploy
- Environment variable validation
- Performance monitoring integration

### Current Team Considerations

#### 1. Development Priorities
- User experience and interface polish
- ATS analysis accuracy and reliability
- Performance optimization
- Feature completeness for MVP launch

#### 2. Technical Debt Management
- Regular dependency updates
- Code refactoring sessions
- Documentation maintenance
- Test coverage improvements

#### 3. Knowledge Sharing
- Code review practices
- Technical documentation updates
- Pair programming sessions
- Architecture decision records
