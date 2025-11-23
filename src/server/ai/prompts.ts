// Resume best practices and prompts for AI

export const RESUME_BEST_PRACTICES = `
# Resume Best Practices

## General Guidelines
- Keep resume to 1 page (2 pages max for experienced professionals with 10+ years)
- Use a clean, professional font (Times New Roman, Arial, Calibri) at 10-12pt
- Use consistent formatting and spacing
- Include quantifiable achievements and metrics whenever possible
- Tailor content to the specific job you're applying for
- Use action verbs to start bullet points (Led, Developed, Implemented, Achieved, etc.)
- Avoid personal pronouns (I, me, my)
- Proofread for grammar and spelling errors

## ATS (Applicant Tracking System) Optimization
- Use standard section headings (Experience, Education, Skills)
- Avoid tables, images, headers, and footers
- Use standard fonts and simple formatting
- Include relevant keywords from the job description
- Save and submit as .docx or .pdf
- Avoid acronyms without spelling them out first

## Content Structure
1. **Contact Information**: Name, phone, email, LinkedIn, GitHub, website
2. **Summary/Objective** (optional): 2-3 sentences highlighting key qualifications
3. **Work Experience**: List in reverse chronological order
   - Job title, company, location, dates (Month YYYY - Month YYYY)
   - 3-5 bullet points per position highlighting achievements
   - Use STAR method (Situation, Task, Action, Result)
4. **Education**: Degree, institution, graduation date, GPA (if above 3.5)
5. **Skills**: Group by category (Technical, Languages, Tools, etc.)
6. **Projects** (optional): Relevant projects with brief descriptions
7. **Additional** (optional): Awards, certifications, publications, volunteer work

## Bullet Point Formula
[Action Verb] + [What You Did] + [How You Did It] + [Results/Impact]

Example: "Developed automated testing framework using Python and Selenium, reducing QA time by 40% and improving release velocity"
`;

export const JOB_MATCHING_SYSTEM_PROMPT = `You are an expert career advisor and resume optimization specialist. Your task is to analyze a job description and a candidate's portfolio data, then select the most relevant items that would make the candidate competitive for this specific position.

Consider the following factors:
1. Required skills and qualifications mentioned in the job description
2. Preferred experience and background
3. Company culture and values (if mentioned)
4. Technical requirements and tools
5. Level of responsibility and seniority
6. Industry-specific keywords and terminology

Generate a professional resume title based on the job description that:
- Captures the core role and key specialization (e.g., "Senior Software Engineer - Cloud Infrastructure")
- Is concise and professional (typically 3-8 words)
- Includes the company name if it's well-known (e.g., "Software Engineer at Google")
- Focuses on the primary role, not generic terms

Select items that:
- Directly align with the job requirements
- Demonstrate relevant skills and experience
- Include quantifiable achievements when possible
- Show progression and growth in relevant areas
- Match the technical stack or domain
- Are recent and relevant (prioritize recent experience for technical roles)

For each category, rank items by relevance and select the top items that would fit on a 1-2 page resume. Focus on quality over quantity - it's better to have 3 highly relevant experiences than 5 mediocre ones.`;

export const JOB_MATCHING_USER_PROMPT = (
	jobDescription: string,
	portfolioData: string,
) => `
Analyze the following job description and select the most relevant items from the candidate's portfolio.

## Job Description:
${jobDescription}

## Candidate Portfolio:
${portfolioData}

Return a JSON object with arrays of IDs for the most relevant items in each category. Include only items that strengthen the application for this specific job.
`;

export const IMPROVEMENT_SUGGESTIONS_PROMPT = (
	jobDescription: string,
	selectedItems: string,
	portfolioContext: string,
) => `
As an expert resume advisor, provide specific, actionable suggestions for improving the selected resume content to better align with this job opportunity.

## Job Description:
${jobDescription}

## Currently Selected Items:
${selectedItems}

## Full Portfolio Context:
${portfolioContext}

Provide 3-5 concrete suggestions for improvement, such as:
- Specific keywords or skills to emphasize
- Bullet point rewording to better match job requirements
- Missing qualifications or experiences that should be highlighted
- Quantifiable metrics that could be added
- Technical terms or industry jargon to incorporate
- Skills that should be added or emphasized
- Projects or achievements that are currently omitted but should be included

Format your response as a JSON array of suggestion objects with fields: category, item_id (if applicable), suggestion, priority (high/medium/low).
`;

export const formatPortfolioForAI = (portfolio: {
	workExperiences: Array<{
		id: string;
		jobTitle: string;
		company: string;
		location?: string | null;
		startDate: Date;
		endDate?: Date | null;
		isCurrent: boolean;
		bulletPoints: string[];
	}>;
	educations: Array<{
		id: string;
		institution: string;
		degree: string;
		fieldOfStudy: string;
		gpa?: string | null;
		startDate: Date;
		endDate?: Date | null;
	}>;
	projects: Array<{
		id: string;
		name: string;
		description?: string | null;
		bulletPoints: string[];
		technologies: string[];
		url?: string | null;
		startDate?: Date | null;
		endDate?: Date | null;
	}>;
	achievements: Array<{
		id: string;
		title: string;
		description: string;
		date?: Date | null;
		category: string;
	}>;
	skills: Array<{
		id: string;
		skill: {
			id: string;
			name: string;
			category?: string | null;
		};
	}>;
}): string => {
	const formatDate = (date: Date | null | undefined) => {
		if (!date) return "Present";
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			year: "numeric",
		});
	};

	let formatted = "# Work Experience\n\n";
	for (const exp of portfolio.workExperiences) {
		formatted += `## [ID: ${exp.id}] ${exp.jobTitle} at ${exp.company}\n`;
		formatted += `Location: ${exp.location || "N/A"}\n`;
		formatted += `Duration: ${formatDate(exp.startDate)} - ${exp.isCurrent ? "Present" : formatDate(exp.endDate)}\n`;
		formatted += `Achievements:\n${exp.bulletPoints.map((b) => `- ${b}`).join("\n")}\n\n`;
	}

	formatted += "\n# Education\n\n";
	for (const edu of portfolio.educations) {
		formatted += `## [ID: ${edu.id}] ${edu.degree} in ${edu.fieldOfStudy}\n`;
		formatted += `Institution: ${edu.institution}\n`;
		formatted += `Duration: ${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}\n`;
		if (edu.gpa) formatted += `GPA: ${edu.gpa}\n`;
		formatted += "\n";
	}

	formatted += "\n# Projects\n\n";
	for (const proj of portfolio.projects) {
		formatted += `## [ID: ${proj.id}] ${proj.name}\n`;
		if (proj.bulletPoints.length > 0) {
			formatted += `Highlights:\n${proj.bulletPoints.map((b) => `- ${b}`).join("\n")}\n`;
		}
		formatted += `Technologies: ${proj.technologies.join(", ")}\n`;
		if (proj.url) formatted += `URL: ${proj.url}\n`;
		formatted += "\n";
	}

	formatted += "\n# Achievements\n\n";
	for (const ach of portfolio.achievements) {
		formatted += `## [ID: ${ach.id}] ${ach.title} (${ach.category})\n`;
		formatted += `Description: ${ach.description}\n`;
		if (ach.date) formatted += `Date: ${formatDate(ach.date)}\n`;
		formatted += "\n";
	}

	formatted += "\n# Skills\n\n";
	const skillsByCategory = portfolio.skills.reduce(
		(acc, s) => {
			const category = s.skill.category || "Other";
			if (!acc[category]) acc[category] = [];
			acc[category].push({ id: s.skill.id, name: s.skill.name });
			return acc;
		},
		{} as Record<string, Array<{ id: string; name: string }>>,
	);

	for (const [category, skills] of Object.entries(skillsByCategory)) {
		formatted += `## ${category}\n`;
		formatted += `${skills.map((s) => `- [ID: ${s.id}] ${s.name}`).join("\n")}\n\n`;
	}

	return formatted;
};

// ATS Extraction Prompts

export const JOB_EXTRACTION_PROMPT = (
	postingInformation: string,
) => `You are a JSON-extraction engine. Convert the following raw job posting text into exactly the JSON schema below:

— Do not add any extra fields or prose.

— Use "YYYY-MM-DD" for all dates.

— Ensure any URLs (website, applyLink) conform to URI format.

— Do not change the structure or key names; output only valid JSON matching the schema.

Do not format the response in Markdown or any other format. Just output raw JSON.

Schema:

{
  "jobId": "string",
  "jobTitle": "string",
  "companyProfile": {
    "companyName": "string",
    "industry": "Optional[string]",
    "website": "Optional[string]",
    "description": "Optional[string]"
  },
  "location": {
    "city": "string",
    "state": "string",
    "country": "string",
    "remoteStatus": "Not Specified"
  },
  "datePosted": "YYYY-MM-DD",
  "employmentType": "Full-time | Full time | Part-time | Part time | Contract | Internship | Temporary | Not Specified",
  "jobSummary": "string",
  "keyResponsibilities": [
    "string",
    "..."
  ],
  "qualifications": {
    "required": [
      "string",
      "..."
    ],
    "preferred": [
      "string",
      "..."
    ]
  },
  "compensationAndBenefits": {
    "salaryRange": "string",
    "benefits": [
      "string",
      "..."
    ]
  },
  "applicationInfo": {
    "howToApply": "string",
    "applyLink": "string",
    "contactEmail": "Optional[string]"
  },
  "extractedKeywords": [
    "string",
    "..."
  ]
}

Job Posting:

${postingInformation}`;

export const RESUME_EXTRACTION_PROMPT = (
	userResume: string,
) => `You are a JSON extraction engine. Convert the following resume text into precisely the JSON schema specified below.

Map each resume section to the schema without inventing information.

If a field is missing in the source text, use an empty string or empty list as appropriate.

Preserve bullet points in the description arrays using short factual sentences.

Use "Present" if an end date is ongoing and prefer YYYY-MM-DD where dates are available.

Keep the additional section organised: list technical skills, languages, certifications/training, and awards exactly as they appear.

Do not compose any extra fields or commentary and output raw JSON only (no Markdown, no prose).

Schema:

{
  "UUID": "string",
  "Personal Data": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "portfolio": "string",
    "location": {
      "city": "string",
      "country": "string"
    }
  },
  "Experiences": [
    {
      "jobTitle": "string",
      "company": "string",
      "location": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD or Present",
      "description": [
        "string",
        "..."
      ],
      "technologiesUsed": [
        "string",
        "..."
      ]
    }
  ],
  "Projects": [
    {
      "projectName": "string",
      "description": "string",
      "technologiesUsed": [
        "string",
        "..."
      ],
      "link": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD"
    }
  ],
  "Skills": [
    {
      "category": "string",
      "skillName": "string"
    }
  ],
  "Research Work": [
    {
      "title": "string | null",
      "publication": "string | null",
      "date": "YYYY-MM-DD | null",
      "link": "string | null",
      "description": "string | null"
    }
  ],
  "Achievements": [
    "string",
    "..."
  ],
  "Education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string | null",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "grade": "string",
      "description": "string"
    }
  ],
  "Extracted Keywords": [
    "string",
    "..."
  ]
}

Resume:

${userResume}`;

export const ATS_RESUME_IMPROVEMENT_PROMPT = (
	atsRecommendations: string,
	skillPriorityText: string,
	currentCosineSimilarity: number,
	rawJobDescription: string,
	extractedJobKeywords: string,
	rawResume: string,
	extractedResumeKeywords: string,
) => `You are an expert resume editor and talent acquisition specialist. Your task is to revise the following resume so that it aligns as closely as possible with the provided job description and extracted job keywords, in order to maximize the cosine similarity between the resume and the job keywords.

Instructions:
- Carefully review the job description and the list of extracted job keywords.
- Use the ATS guidance below to address structural or keyword gaps before rewriting bullets:
  - ATS Recommendations:
${atsRecommendations}
  - Priority keywords ranked by job emphasis:
${skillPriorityText}
- Update the candidate's resume by rephrasing and reordering existing content so it highlights the most relevant evidence:
  - Emphasize and naturally weave job-aligned keywords by rewriting existing bullets, sentences, and headings. You may combine or split bullets, reorder content, and surface tools/methods that are already mentioned or clearly implied.
  - Do NOT invent new jobs, projects, technologies, certifications, or accomplishments that are not present in the original resume text. You may enrich a bullet only when all underlying facts come from the original resume (e.g., clarify that a described study is a "digital health pilot" when the resume already indicates digital health work).
  - Preserve the core section structure: Education, Work Experience, Personal Projects, Additional (Technical Skills, Languages, Certifications & Training, Awards). You may add a concise "Summary" or "Professional Summary" section at the top if it is missing, but do not introduce unrelated sections.
  - Keep each Additional subsection limited to items explicitly present in the original resume. If a subsection has no content, leave it empty.
  - When a requirement is missing, do not fabricate experience. Instead, highlight adjacent or transferable elements already in the resume and frame them with the job's terminology.
  - Maintain a natural, professional tone and avoid keyword stuffing.
  - Where possible, use quantifiable achievements already present in the resume and action verbs to make impact clear.
  - The current cosine similarity score is ${currentCosineSimilarity.toFixed(4)}. Revise the resume using the above constraints to increase this score.
- ONLY output the improved updated resume. Do not include any explanations, commentary, or formatting outside of the resume itself.

Job Description:
\`\`\`md
${rawJobDescription}
\`\`\`

Extracted Job Keywords:
\`\`\`md
${extractedJobKeywords}
\`\`\`

Original Resume:
\`\`\`md
${rawResume}
\`\`\`

Extracted Resume Keywords:
\`\`\`md
${extractedResumeKeywords}
\`\`\`

NOTE: ONLY OUTPUT THE IMPROVED UPDATED RESUME IN MARKDOWN FORMAT.`;
