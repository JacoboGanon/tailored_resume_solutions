# Project Brief: Portfolio Resume System

## Project Overview

The Portfolio Resume System is an AI-powered web application that enables users to create, manage, and customize professional resumes tailored to specific job descriptions. The system leverages OpenAI's gpt-5-mini model to intelligently match user portfolio items with job requirements, providing real-time recommendations and generating ATS-friendly PDF resumes.

## Core Requirements

### Functional Requirements
1. **Portfolio Management**: Users must be able to input and manage comprehensive professional profiles including:
   - Contact information and personal details
   - Work experience with bullet points and achievements
   - Education history with degrees and institutions
   - Technical and soft skills with categorization
   - Project portfolio with descriptions and technologies
   - Awards and achievements

2. **AI-Powered Job Matching**: System must analyze job descriptions and:
   - Extract key requirements and skills from job postings
   - Match portfolio items to job relevance using AI
   - Provide real-time streaming analysis with reasoning
   - Allow manual override of AI selections
   - Generate improvement suggestions

3. **Resume Generation**: Create professional, ATS-optimized resumes:
   - PDF generation using @react-pdf/renderer
   - Clean, single-column layout with standard fonts
   - Dynamic content based on selected portfolio items
   - Multiple resume versions for different applications

4. **History Management**: Track and manage resume versions:
   - Save multiple resume configurations
   - Store job descriptions and selected items
   - Enable re-download and modification of past resumes
   - Provide search and filtering capabilities

5. **ATS Analysis**: Analyze resume effectiveness:
   - Calculate ATS compatibility scores
   - Identify missing keywords and skills
   - Provide optimization recommendations
   - Compare resume against job requirements

### Non-Functional Requirements
1. **Performance**: Real-time AI streaming with minimal latency
2. **Security**: User data isolation and secure authentication
3. **Scalability**: Support for multiple concurrent users
4. **Usability**: Intuitive interface with responsive design
5. **Reliability**: Consistent PDF generation and data persistence

## Technical Constraints
- Must use Next.js 15 with App Router
- TypeScript for type safety
- Prisma ORM with PostgreSQL database
- tRPC for type-safe API calls
- Better Auth for authentication
- shadcn/ui components for consistent UI
- OpenAI API for AI functionality

## Success Criteria
1. Users can create complete portfolios within 10 minutes
2. AI matching provides relevant selections with >80% user satisfaction
3. PDF generation completes within 5 seconds
4. ATS analysis improves resume scores by 15+ points
5. System supports 100+ concurrent users without degradation

## Target Users
- Job seekers applying to multiple positions
- Career changers needing to highlight transferable skills
- Professionals in technical fields requiring detailed skill matching
- Students and recent graduates optimizing first resumes
- Career coaches and resume writers assisting clients

## Business Goals
1. Reduce time spent on resume customization by 75%
2. Increase interview rates through better job matching
3. Provide data-driven insights for resume improvement
4. Create scalable platform for career development tools
5. Establish foundation for additional career services

## Project Scope
### In Scope
- Portfolio data management system
- AI-powered job description analysis
- PDF resume generation and customization
- Resume history and version control
- ATS scoring and optimization
- User authentication and data security

### Out of Scope
- Cover letter generation (future enhancement)
- Job board integration
- Video resume creation
- Multi-language support
- Enterprise team features
- Advanced analytics dashboard

## Timeline Considerations
- Phase 1: Core portfolio management and basic AI matching
- Phase 2: PDF generation and history management
- Phase 3: ATS analysis and optimization features
- Phase 4: Advanced AI features and user experience improvements

## Key Metrics for Success
- User engagement (sessions per week)
- Resume creation completion rate
- AI matching accuracy (user feedback scores)
- PDF download success rate
- ATS score improvement percentage
- User retention and referral rates
