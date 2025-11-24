# Portfolio Resume System - System Overview

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture](#architecture)
3. [Data Flow](#data-flow)
4. [AI Matching Algorithm](#ai-matching-algorithm)
5. [Technology Stack](#technology-stack)
6. [Key Features](#key-features)

## Introduction

The Portfolio Resume System is a full-featured web application that allows users to create, manage, and customize their professional resumes using AI-powered job matching. The system helps users tailor their resumes to specific job descriptions by intelligently selecting the most relevant experiences, skills, and achievements.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  (Next.js 15 with React 19, TanStack Query, shadcn/ui)     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (tRPC)                        │
│  - Portfolio Router (CRUD operations)                        │
│  - Resume Router (history management)                        │
│  - AI Streaming Endpoint (/api/match-job)                   │
│  - PDF Generation Endpoint (/api/resume/download)           │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
┌──────────────────┐   ┌────────────────────┐
│  Database Layer  │   │   External APIs    │
│  (SQLite/Prisma) │   │  - OpenAI gpt-5-mini│
│                  │   │  - Better Auth     │
└──────────────────┘   └────────────────────┘
```

### Component Structure

#### Frontend Components

- **Dashboard Layout**: Main application layout with sidebar navigation
  - Profile Page: Data input and portfolio management
  - Job Personalization: AI-powered job matching
  - Resume History: Saved resume management

- **UI Components** (shadcn/ui based):
  - Forms, inputs, and validation
  - Dialogs and modals for data entry
  - Comboboxes for skills and institutions
  - Cards, badges, and data displays

#### Backend Services

- **Authentication**: Better Auth with GitHub OAuth and email/password
- **Database**: Prisma ORM with SQLite (easily swappable to PostgreSQL/MySQL)
- **API**: tRPC for type-safe API calls
- **AI Integration**: OpenAI SDK with streaming support

## Data Flow

### 1. Portfolio Creation Flow

```
User Input → Form Validation → tRPC Mutation → Prisma ORM → Database
                                     ↓
                            TanStack Query Cache Update
                                     ↓
                              UI Auto-Refresh
```

### 2. Job Matching Flow

```
Job Description Input
        ↓
User Clicks "Analyze"
        ↓
POST /api/match-job
        ↓
Fetch User Portfolio from DB
        ↓
Format Portfolio for AI (prompts.ts)
        ↓
OpenAI API Call (streamObject)
        ↓
Stream Results to Client in Real-Time
        ↓
Display Selected Items with UI Updates
        ↓
User Saves Resume to History
        ↓
Resume Record Created in DB
```

### 3. PDF Generation Flow

```
User Requests PDF Download
        ↓
POST /api/resume/download
        ↓
Fetch Resume + Selected Portfolio Items
        ↓
Format Data for PDF Template
        ↓
@react-pdf/renderer Generates PDF Buffer
        ↓
Return PDF as Blob to Client
        ↓
Browser Triggers Download
```

## AI Matching Algorithm

### Overview

The AI matching system uses OpenAI's gpt-5-mini model with structured output (via AI SDK's `streamObject`) to analyze job descriptions and select relevant portfolio items.

### Process

1. **Input Preparation**
   - Job description from user
   - User's complete portfolio formatted as structured text
   - Context includes: work experiences, education, projects, skills, achievements

2. **AI Prompt Engineering**
   ```
   System Prompt: Expert career advisor analyzing job fit
   User Prompt: Job description + Formatted portfolio
   Schema: Structured output with arrays of selected IDs
   ```

3. **Streaming Response**
   - AI returns IDs of selected items as it processes
   - Real-time UI updates show selections as they're made
   - Includes reasoning for selections

4. **Result Processing**
   - Selected IDs used to filter portfolio items
   - Display relevant experiences, skills, projects
   - Optional: Generate improvement suggestions

### Schema Definition

```typescript
{
  workExperienceIds: string[],
  educationIds: string[],
  projectIds: string[],
  achievementIds: string[],
  skillIds: string[],
  reasoning?: string
}
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **React**: v19
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod

### Backend
- **API**: tRPC v11
- **Database**: Prisma ORM (SQLite default)
- **Authentication**: Better Auth
- **AI**: OpenAI SDK + AI SDK (Vercel)
- **PDF Generation**: @react-pdf/renderer

### Development Tools
- **Language**: TypeScript
- **Linter**: Biome
- **Package Manager**: npm

## Key Features

### 1. Portfolio Management
- Contact information storage
- Work experience tracking with bullet points
- Education history
- Skills management with suggestions
- Projects showcase
- Achievements and awards

### 2. AI-Powered Job Matching
- Real-time streaming analysis
- Intelligent item selection based on job requirements
- Reasoning explanation
- Manual selection override capability

### 3. Resume History
- Save multiple resume versions
- Track which items were selected for each job
- Quick access to past applications
- Easy regeneration and download

### 4. PDF Generation
- Professional, ATS-friendly format
- Clean, single-column layout
- Standard fonts for compatibility
- Instant download capability

### 5. User Experience
- Responsive design (mobile and desktop)
- Real-time validation
- Optimistic UI updates
- Toast notifications
- Keyboard shortcuts

## Database Schema

### Core Models

- **User**: Authentication and user profile
- **Portfolio**: One-to-one with User, contains contact info
- **WorkExperience**: Multiple per portfolio
- **Education**: Multiple per portfolio
- **Skill**: Shared across users, many-to-many with Portfolio
- **Project**: Multiple per portfolio
- **Achievement**: Multiple per portfolio
- **Resume**: Saved resume versions with selected item IDs
- **CommonInstitution**: Lookup table for common universities
- **CommonSkill**: Cached skill suggestions

### Relationships

```
User 1:1 Portfolio
Portfolio 1:N WorkExperience
Portfolio 1:N Education
Portfolio N:M Skill (via PortfolioSkill)
Portfolio 1:N Project
Portfolio 1:N Achievement
User 1:N Resume
```

## Security Considerations

1. **Authentication Required**: All dashboard routes require authentication
2. **Data Isolation**: Users can only access their own portfolio data
3. **Input Validation**: Zod schemas validate all inputs
4. **SQL Injection Protection**: Prisma ORM handles query sanitization
5. **Rate Limiting**: Consider implementing for AI endpoints (production)

## Performance Optimizations

1. **Streaming AI Responses**: Results appear as generated, not all at once
2. **TanStack Query Caching**: Reduces unnecessary API calls
3. **Optimistic Updates**: UI updates before server confirmation
4. **Database Indexing**: Indexed foreign keys and frequently queried fields
5. **PDF Generation**: Server-side rendering, no client-side overhead

## Future Enhancements

- Multiple resume templates
- Export to Word (.docx)
- Resume scoring and suggestions
- ATS optimization checker
- Cover letter generation
- Job application tracking
- Browser extension for auto-fill
- Collaborative resume review
- Analytics and insights

