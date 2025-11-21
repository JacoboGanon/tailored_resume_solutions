# API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Portfolio Router](#portfolio-router)
4. [Resume Router](#resume-router)
5. [HTTP Endpoints](#http-endpoints)
6. [Error Handling](#error-handling)
7. [Type Definitions](#type-definitions)

## Overview

This application uses **tRPC** for type-safe API calls between the client and server. All tRPC procedures are organized into routers that handle different aspects of the application.

### Base URL

- **Development**: `http://localhost:3000/api/trpc`
- **Production**: `https://yourdomain.com/api/trpc`

### API Architecture

```
Client (React)
    ↓ (Type-safe calls)
tRPC React Query Hooks
    ↓ (HTTP/JSON)
tRPC Server Routers
    ↓
Database (via Prisma)
```

## Authentication

All API endpoints require authentication unless specified. Authentication is handled by Better Auth.

### Protected Procedures

Protected procedures automatically:
- Verify user authentication
- Provide session context (`ctx.session`)
- Return 401 if not authenticated

### Session Context

```typescript
ctx.session = {
  user: {
    id: string;
    name: string;
    email: string;
  }
}
```

## Portfolio Router

**Import Path**: `portfolio` in tRPC client

### Get or Create Portfolio

Retrieves the user's portfolio or creates one if it doesn't exist.

```typescript
api.portfolio.getOrCreate.useQuery()
```

**Returns:**
```typescript
{
  id: string;
  userId: string;
  contactInfo: string | null; // JSON string
  workExperiences: WorkExperience[];
  educations: Education[];
  projects: Project[];
  achievements: Achievement[];
  skills: PortfolioSkill[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Update Contact Information

Updates user's contact information.

```typescript
api.portfolio.updateContactInfo.useMutation()
```

**Input:**
```typescript
{
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}
```

**Returns:** Updated Portfolio

---

### Work Experience Operations

#### Add Work Experience

```typescript
api.portfolio.addWorkExperience.useMutation()
```

**Input:**
```typescript
{
  jobTitle: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
  bulletPoints: string[]; // Array of achievement strings
}
```

**Returns:** Created WorkExperience

#### Update Work Experience

```typescript
api.portfolio.updateWorkExperience.useMutation()
```

**Input:**
```typescript
{
  id: string;
  data: {
    jobTitle: string;
    company: string;
    location?: string;
    startDate: Date;
    endDate?: Date | null;
    isCurrent: boolean;
    bulletPoints: string[];
  }
}
```

**Returns:** Updated WorkExperience

#### Delete Work Experience

```typescript
api.portfolio.deleteWorkExperience.useMutation()
```

**Input:**
```typescript
{
  id: string;
}
```

**Returns:** Deleted WorkExperience

#### Parse Bullet Points

Parses pasted text into separate bullet points.

```typescript
api.portfolio.parseWorkBulletPoints.useMutation()
```

**Input:**
```typescript
{
  text: string; // Multi-line text with bullets
}
```

**Returns:** `string[]` - Array of parsed bullet points

**Example:**
```typescript
// Input:
"- Developed API\n* Improved performance\n• Led team"

// Output:
["Developed API", "Improved performance", "Led team"]
```

---

### Education Operations

#### Add Education

```typescript
api.portfolio.addEducation.useMutation()
```

**Input:**
```typescript
{
  institution: string;
  degree: string;
  fieldOfStudy: string;
  gpa?: string;
  minors?: string[];
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
}
```

**Returns:** Created Education

#### Update Education

```typescript
api.portfolio.updateEducation.useMutation()
```

**Input:**
```typescript
{
  id: string;
  data: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    gpa?: string;
    minors?: string[];
    startDate: Date;
    endDate?: Date | null;
    isCurrent: boolean;
  }
}
```

**Returns:** Updated Education

#### Delete Education

```typescript
api.portfolio.deleteEducation.useMutation()
```

**Input:**
```typescript
{
  id: string;
}
```

**Returns:** Deleted Education

---

### Skills Operations

#### Add Skill

```typescript
api.portfolio.addSkill.useMutation()
```

**Input:**
```typescript
{
  name: string;
  category?: string;
}
```

**Returns:** Created PortfolioSkill with related Skill

**Note:** If the skill doesn't exist in the database, it will be created. If it exists, it will be linked to the user's portfolio.

#### Remove Skill

```typescript
api.portfolio.removeSkill.useMutation()
```

**Input:**
```typescript
{
  skillId: string;
}
```

**Returns:** Deletion count

#### Get Common Skills

Retrieves cached list of common skills for suggestions.

```typescript
api.portfolio.getCommonSkills.useQuery({ search?: string })
```

**Input:**
```typescript
{
  search?: string; // Optional search term
}
```

**Returns:** `Skill[]` - Up to 50 common skills

---

### Projects Operations

#### Add Project

```typescript
api.portfolio.addProject.useMutation()
```

**Input:**
```typescript
{
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}
```

**Returns:** Created Project

#### Update Project

```typescript
api.portfolio.updateProject.useMutation()
```

**Input:**
```typescript
{
  id: string;
  data: {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate?: Date | null;
    endDate?: Date | null;
  }
}
```

**Returns:** Updated Project

#### Delete Project

```typescript
api.portfolio.deleteProject.useMutation()
```

**Input:**
```typescript
{
  id: string;
}
```

**Returns:** Deleted Project

---

### Achievements Operations

#### Add Achievement

```typescript
api.portfolio.addAchievement.useMutation()
```

**Input:**
```typescript
{
  title: string;
  description: string;
  date?: Date | null;
  category: string; // "competition", "award", "club", etc.
}
```

**Returns:** Created Achievement

#### Update Achievement

```typescript
api.portfolio.updateAchievement.useMutation()
```

**Input:**
```typescript
{
  id: string;
  data: {
    title: string;
    description: string;
    date?: Date | null;
    category: string;
  }
}
```

**Returns:** Updated Achievement

#### Delete Achievement

```typescript
api.portfolio.deleteAchievement.useMutation()
```

**Input:**
```typescript
{
  id: string;
}
```

**Returns:** Deleted Achievement

---

### Common Institutions

#### Get Common Institutions

Retrieves cached list of common universities/schools.

```typescript
api.portfolio.getCommonInstitutions.useQuery({ 
  search?: string; 
  type?: string; 
})
```

**Input:**
```typescript
{
  search?: string; // Search term
  type?: string; // "university", "college", "bootcamp"
}
```

**Returns:** `CommonInstitution[]` - Up to 50 institutions

#### Add Common Institution

```typescript
api.portfolio.addCommonInstitution.useMutation()
```

**Input:**
```typescript
{
  name: string;
  type: string;
}
```

**Returns:** Created CommonInstitution

---

## Resume Router

**Import Path**: `resume` in tRPC client

### Save Resume

Saves a customized resume to history.

```typescript
api.resume.saveResume.useMutation()
```

**Input:**
```typescript
{
  name: string;
  jobDescription: string;
  selectedItemIds: {
    workExperienceIds: string[];
    educationIds: string[];
    projectIds: string[];
    achievementIds: string[];
    skillIds: string[];
  }
}
```

**Returns:** Created Resume with `id`

---

### Get Resume History

Retrieves all saved resumes for the user.

```typescript
api.resume.getResumeHistory.useQuery()
```

**Returns:** `Resume[]` - Array of saved resumes

---

### Get Single Resume

Retrieves a specific resume by ID.

```typescript
api.resume.getResume.useQuery({ id: string })
```

**Input:**
```typescript
{
  id: string;
}
```

**Returns:** Single Resume

**Errors:**
- `404`: Resume not found or doesn't belong to user

---

### Update Resume

Updates a saved resume.

```typescript
api.resume.updateResume.useMutation()
```

**Input:**
```typescript
{
  id: string;
  name?: string;
  selectedItemIds?: {
    workExperienceIds: string[];
    educationIds: string[];
    projectIds: string[];
    achievementIds: string[];
    skillIds: string[];
  }
}
```

**Returns:** Updated Resume

---

### Delete Resume

Deletes a resume from history.

```typescript
api.resume.deleteResume.useMutation()
```

**Input:**
```typescript
{
  id: string;
}
```

**Returns:** Deleted Resume

---

## HTTP Endpoints

These are REST endpoints (not tRPC) that handle streaming and file downloads.

### POST /api/match-job

Analyzes job description and returns matching portfolio items via streaming.

**Authentication:** Required (via session cookie)

**Request Body:**
```json
{
  "jobDescription": "Full job posting text..."
}
```

**Response:** Text stream (SSE format)

The response streams JSON objects as they're generated by the AI:

```typescript
// Streamed partial objects
{ workExperienceIds: ["id1"] }
{ workExperienceIds: ["id1", "id2"] }
{ workExperienceIds: ["id1", "id2"], educationIds: ["edu1"] }
// ... continues until complete
```

**Usage Example:**
```typescript
import { experimental_useObject as useObject } from "ai/react";
import { jobMatchSchema } from "~/server/ai/openai";

const { object, submit, isLoading } = useObject({
  api: "/api/match-job",
  schema: jobMatchSchema,
});

// Trigger analysis
submit({ jobDescription: "..." });

// Access streaming results
console.log(object?.workExperienceIds); // Updates in real-time
```

**Errors:**
- `401`: Unauthorized
- `400`: Invalid job description
- `404`: Portfolio not found
- `500`: Server error

---

### POST /api/resume/download

Generates and downloads a PDF resume.

**Authentication:** Required (via session cookie)

**Request Body:**
```json
{
  "resumeId": "resume-id-string"
}
```

**Response:** PDF file (binary)

**Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Resume_Name.pdf"
```

**Usage Example:**
```typescript
const response = await fetch("/api/resume/download", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resumeId: "abc123" }),
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "resume.pdf";
a.click();
```

**Errors:**
- `401`: Unauthorized
- `400`: Missing resume ID
- `404`: Resume not found or doesn't belong to user
- `500`: PDF generation failed

---

## Error Handling

### tRPC Errors

tRPC errors include:
- `code`: Error code (e.g., "UNAUTHORIZED", "NOT_FOUND")
- `message`: Human-readable error message

**Example:**
```typescript
try {
  await api.portfolio.addWorkExperience.mutate(data);
} catch (error) {
  if (error.data?.code === "UNAUTHORIZED") {
    // Handle auth error
  }
  console.error(error.message);
}
```

### HTTP Errors

Standard HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (not logged in)
- `404`: Not Found (resource doesn't exist)
- `500`: Server Error

---

## Type Definitions

### Portfolio

```typescript
interface Portfolio {
  id: string;
  userId: string;
  contactInfo: string | null; // JSON: { email, phone, linkedin, github, website }
  createdAt: Date;
  updatedAt: Date;
  workExperiences: WorkExperience[];
  educations: Education[];
  projects: Project[];
  achievements: Achievement[];
  skills: PortfolioSkill[];
}
```

### WorkExperience

```typescript
interface WorkExperience {
  id: string;
  portfolioId: string;
  jobTitle: string;
  company: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  bulletPoints: string; // JSON array
  createdAt: Date;
  updatedAt: Date;
}
```

### Education

```typescript
interface Education {
  id: string;
  portfolioId: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  gpa: string | null;
  minors: string | null; // JSON array
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Skill

```typescript
interface Skill {
  id: string;
  name: string;
  category: string | null;
  isCommon: boolean;
  createdAt: Date;
}
```

### PortfolioSkill

```typescript
interface PortfolioSkill {
  id: string;
  portfolioId: string;
  skillId: string;
  skill: Skill;
  createdAt: Date;
}
```

### Project

```typescript
interface Project {
  id: string;
  portfolioId: string;
  name: string;
  description: string;
  technologies: string; // JSON array
  url: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Achievement

```typescript
interface Achievement {
  id: string;
  portfolioId: string;
  title: string;
  description: string;
  date: Date | null;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Resume

```typescript
interface Resume {
  id: string;
  userId: string;
  name: string;
  jobDescription: string;
  selectedItemIds: string; // JSON: { workExperienceIds[], educationIds[], ... }
  pdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### JobMatchResult (AI Response)

```typescript
interface JobMatchResult {
  workExperienceIds: string[];
  educationIds: string[];
  projectIds: string[];
  achievementIds: string[];
  skillIds: string[];
  reasoning?: string;
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production:

**Recommended Limits:**
- AI Matching: 10 requests per hour per user
- PDF Generation: 50 requests per hour per user
- tRPC mutations: 100 requests per minute per user

**Implementation:** Consider using `@upstash/ratelimit` or similar.

---

## Webhooks

Not currently implemented. Future consideration for:
- Resume updates notification
- Job application tracking
- Integration with job boards

---

## Versioning

API Version: **v1** (implicit)

Future versions will be prefixed: `/api/v2/...`

---

## Support

For API issues or questions:
- Check documentation first
- Review error messages in browser console
- Check server logs for detailed error information
- Ensure authentication is working correctly

