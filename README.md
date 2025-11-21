# Portfolio Resume System

An AI-powered resume builder that helps you create, manage, and customize professional resumes tailored to specific job descriptions.

## Features

- 📝 **Portfolio Management**: Store and manage your work experience, education, skills, projects, and achievements
- 🤖 **AI Job Matching**: Uses OpenAI GPT-4o-mini to analyze job descriptions and select the most relevant items from your portfolio
- 📄 **PDF Generation**: Export professional, ATS-friendly resumes as PDF files
- 📚 **Resume History**: Save multiple versions of your resume for different job applications
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 🔒 **Secure Authentication**: GitHub OAuth and email/password authentication via Better Auth

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Prisma ORM with SQLite (easily swappable to PostgreSQL/MySQL)
- **API**: tRPC for type-safe API calls
- **Authentication**: Better Auth
- **AI**: OpenAI SDK with AI SDK (Vercel) for streaming
- **PDF**: @react-pdf/renderer
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- (Optional) GitHub OAuth credentials for social login

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd portfolio-customization
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./db.sqlite"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32
BETTER_AUTH_GITHUB_CLIENT_ID="your-github-client-id"
BETTER_AUTH_GITHUB_CLIENT_SECRET="your-github-client-secret"
```

4. **Set up the database**

```bash
# Push schema to database
npm run db:push

# Seed with common skills and institutions
npm run db:seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── profile/        # Portfolio data input
│   │   ├── personalize/    # AI job matching
│   │   └── history/        # Resume history
│   └── api/                # API routes
│       ├── match-job/      # AI streaming endpoint
│       └── resume/         # PDF generation
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── pdf/                # PDF template
├── server/
│   ├── api/                # tRPC routers
│   ├── ai/                 # OpenAI integration
│   ├── better-auth/        # Authentication
│   └── db.ts               # Prisma client
└── styles/                 # Global styles

docs/
├── SYSTEM_OVERVIEW.md      # Architecture documentation
├── RESUME_BEST_PRACTICES.md # Resume writing guide
└── API.md                  # API documentation

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Database seeding
```

## Usage

### 1. Create Your Portfolio

Navigate to the **Profile** page and fill in:
- Contact information
- Work experience (with achievements)
- Education
- Skills
- Projects
- Achievements

### 2. Match to a Job

Go to **Job Personalization** and:
1. Paste the full job description
2. Click "Analyze & Match"
3. Watch as AI selects the most relevant items in real-time
4. Review the selections and reasoning
5. Save to history

### 3. Download Your Resume

After saving, click "Download PDF" to get your professionally formatted resume.

### 4. Manage History

View all your saved resumes in **Resume History**, where you can:
- View details of each resume
- Download PDFs again
- Delete old versions

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with common data
- `npm run db:studio` - Open Prisma Studio
- `npm run check` - Run Biome linter
- `npm run typecheck` - Run TypeScript type checking

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- [System Overview](./docs/SYSTEM_OVERVIEW.md) - Architecture, data flow, and AI algorithm
- [Resume Best Practices](./docs/RESUME_BEST_PRACTICES.md) - Resume writing guidelines and ATS optimization
- [API Documentation](./docs/API.md) - Complete API reference

## Configuration

### Database

The default database is SQLite for easy setup. To use PostgreSQL or MySQL:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql" // or "mysql"
  url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

3. Run migrations:
```bash
npm run db:push
```

### AI Model

To change the OpenAI model, edit `src/server/ai/openai.ts`:

```typescript
model: openai("gpt-4o-mini") // Change to "gpt-4o", "gpt-4-turbo", etc.
```

### PDF Template

Customize the resume template in `src/components/pdf/resume-template.tsx` to change:
- Fonts
- Colors
- Layout
- Section order

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

For database, consider:
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [PlanetScale](https://planetscale.com/) - Serverless MySQL
- [Supabase](https://supabase.com/) - PostgreSQL with additional features

### Docker

See [T3 Stack Docker deployment guide](https://create.t3.gg/en/deployment/docker)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and type checks
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [T3 Stack](https://create.t3.gg/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [OpenAI](https://openai.com/)
- Authentication by [Better Auth](https://www.better-auth.com/)

## Support

For issues, questions, or suggestions:
- Check the [documentation](./docs/)
- Open an issue on GitHub
- Review the [T3 Stack docs](https://create.t3.gg/)

---

**Note**: This is an educational project. Ensure you have proper API keys and follow OpenAI's usage policies.
# tailored_resume_solutions
