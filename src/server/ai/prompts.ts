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
		description: string;
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
		formatted += `Description: ${proj.description}\n`;
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
