import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";
import {
	calculateATSScore,
	extractJobPosting,
	extractResumeData,
	generateATSRecommendations,
} from "~/server/ai/ats-extraction";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export const maxDuration = 60; // Optimization can take longer

/**
 * Zod schema for optimized resume structured output
 */
const optimizedResumeSchema = z.object({
	contactInfo: z.object({
		name: z.string().describe("Full name of the candidate"),
		email: z.string().email().optional().nullable().describe("Email address"),
		phone: z.string().optional().nullable().describe("Phone number"),
		linkedin: z
			.string()
			.url()
			.optional()
			.nullable()
			.describe("LinkedIn profile URL"),
		github: z
			.string()
			.url()
			.optional()
			.nullable()
			.describe("GitHub profile URL"),
		website: z
			.string()
			.url()
			.optional()
			.nullable()
			.describe("Personal website URL"),
	}),
	professionalSummary: z
		.string()
		.optional()
		.nullable()
		.describe(
			"2-3 sentence professional summary highlighting key qualifications",
		),
	workExperiences: z
		.array(
			z.object({
				jobTitle: z.string().describe("Job title"),
				company: z.string().describe("Company name"),
				location: z.string().optional().nullable().describe("Job location"),
				startDate: z
					.string()
					.describe("Start date in format 'YYYY-MM-DD' or 'Present'"),
				endDate: z
					.string()
					.optional()
					.nullable()
					.describe("End date in format 'YYYY-MM-DD' or 'Present'"),
				isCurrent: z.boolean().describe("Whether this is the current position"),
				bulletPoints: z
					.array(z.string())
					.describe("Array of achievement bullet points"),
			}),
		)
		.describe("Work experience entries"),
	educations: z
		.array(
			z.object({
				institution: z.string().describe("Educational institution name"),
				degree: z.string().describe("Degree type (e.g., Bachelor of Science)"),
				fieldOfStudy: z.string().describe("Field of study or major"),
				gpa: z.string().optional().nullable().describe("GPA if above 3.5"),
				startDate: z.string().describe("Start date in format 'YYYY-MM-DD'"),
				endDate: z
					.string()
					.optional()
					.nullable()
					.describe("End date in format 'YYYY-MM-DD' or 'Present'"),
				isCurrent: z.boolean().describe("Whether currently enrolled"),
			}),
		)
		.describe("Education entries"),
	skills: z
		.array(
			z.object({
				name: z.string().describe("Skill name"),
				category: z.string().optional().nullable().describe("Skill category"),
			}),
		)
		.describe("Skills list"),
	projects: z
		.array(
			z.object({
				name: z.string().describe("Project name"),
				description: z
					.string()
					.optional()
					.nullable()
					.describe("Project description"),
				bulletPoints: z
					.array(z.string())
					.describe("Array of project highlight bullet points"),
				technologies: z
					.array(z.string())
					.describe("Technologies used in the project"),
				url: z
					.string()
					.url()
					.optional()
					.nullable()
					.describe("Project URL if available"),
			}),
		)
		.optional()
		.describe("Projects list"),
	achievements: z
		.array(
			z.object({
				title: z.string().describe("Achievement title"),
				description: z.string().describe("Achievement description"),
				category: z.string().describe("Achievement category"),
				date: z
					.string()
					.optional()
					.nullable()
					.describe("Date in format 'YYYY-MM-DD' if available"),
			}),
		)
		.optional()
		.describe("Achievements list"),
});

type OptimizedResume = z.infer<typeof optimizedResumeSchema>;

/**
 * Convert portfolio to markdown resume format for AI context
 */
function portfolioToMarkdown(portfolio: {
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
	name?: string | null;
	email?: string | null;
	phone?: string | null;
	linkedin?: string | null;
	github?: string | null;
	website?: string | null;
}): string {
	const formatDate = (date: Date | null | undefined, isCurrent = false) => {
		if (isCurrent) return "Present";
		if (!date) return "";
		const d = new Date(date);
		return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
	};

	let markdown = "";

	// Header
	if (portfolio.name) {
		markdown += `# ${portfolio.name}\n\n`;
	}

	// Contact Info
	const contactParts: string[] = [];
	if (portfolio.email) contactParts.push(portfolio.email);
	if (portfolio.phone) contactParts.push(portfolio.phone);
	if (portfolio.linkedin) contactParts.push(`LinkedIn: ${portfolio.linkedin}`);
	if (portfolio.github) contactParts.push(`GitHub: ${portfolio.github}`);
	if (portfolio.website) contactParts.push(`Website: ${portfolio.website}`);
	if (contactParts.length > 0) {
		markdown += `${contactParts.join(" | ")}\n\n`;
	}

	// Work Experience
	if (portfolio.workExperiences.length > 0) {
		markdown += "## Work Experience\n\n";
		for (const exp of portfolio.workExperiences) {
			markdown += `### ${exp.jobTitle} at ${exp.company}\n`;
			markdown += `${exp.location || ""} | ${formatDate(exp.startDate)} - ${formatDate(exp.endDate, exp.isCurrent)}\n\n`;
			for (const bullet of exp.bulletPoints) {
				markdown += `- ${bullet}\n`;
			}
			markdown += "\n";
		}
	}

	// Education
	if (portfolio.educations.length > 0) {
		markdown += "## Education\n\n";
		for (const edu of portfolio.educations) {
			markdown += `### ${edu.degree} in ${edu.fieldOfStudy}\n`;
			markdown += `${edu.institution} | ${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}\n`;
			if (edu.gpa) markdown += `GPA: ${edu.gpa}\n`;
			markdown += "\n";
		}
	}

	// Skills
	if (portfolio.skills.length > 0) {
		markdown += "## Skills\n\n";
		const skillsByCategory = portfolio.skills.reduce(
			(acc, s) => {
				const category = s.skill.category || "Other";
				if (!acc[category]) acc[category] = [];
				acc[category].push(s.skill.name);
				return acc;
			},
			{} as Record<string, string[]>,
		);
		for (const [category, skills] of Object.entries(skillsByCategory)) {
			markdown += `**${category}**: ${skills.join(", ")}\n\n`;
		}
	}

	// Projects
	if (portfolio.projects.length > 0) {
		markdown += "## Projects\n\n";
		for (const proj of portfolio.projects) {
			markdown += `### ${proj.name}\n`;
			if (proj.description) markdown += `${proj.description}\n\n`;
			if (proj.technologies.length > 0) {
				markdown += `**Technologies**: ${proj.technologies.join(", ")}\n\n`;
			}
			if (proj.url) markdown += `**Link**: ${proj.url}\n\n`;
			for (const bullet of proj.bulletPoints) {
				markdown += `- ${bullet}\n`;
			}
			markdown += "\n";
		}
	}

	// Achievements
	if (portfolio.achievements.length > 0) {
		markdown += "## Achievements\n\n";
		for (const ach of portfolio.achievements) {
			markdown += `### ${ach.title} (${ach.category})\n`;
			if (ach.date) markdown += `${formatDate(ach.date)}\n\n`;
			markdown += `${ach.description}\n\n`;
		}
	}

	return markdown;
}

/**
 * Format recommendations for the prompt
 */
function formatRecommendations(
	recommendations: Array<{
		category: string;
		suggestion: string;
		priority: "high" | "medium" | "low";
	}>,
): string {
	return recommendations
		.map((rec, idx) => {
			const priority = rec.priority.toUpperCase();
			return `${idx + 1}. [${priority}] ${rec.suggestion}`;
		})
		.join("\n");
}

/**
 * Format skill priority text
 */
function formatSkillPriority(
	priorityKeywords: string[],
	missingSkills: string[],
): string {
	let text = "**High Priority Keywords:**\n";
	text += priorityKeywords
		.slice(0, 5)
		.map((k) => `- ${k}`)
		.join("\n");
	text += "\n\n**Missing Skills to Consider:**\n";
	text += missingSkills
		.slice(0, 5)
		.map((s) => `- ${s}`)
		.join("\n");
	return text;
}

/**
 * Parse date string from AI response to Date object
 * Handles formats: YYYY-MM-DD, YYYY-MM, YYYY, and "Present"
 * Returns null for empty/null/"Present" values
 */
function parseDate(dateStr: string | null | undefined): Date | null {
	if (!dateStr || dateStr === "Present" || dateStr.trim() === "") {
		return null;
	}
	const trimmed = dateStr.trim();

	// Try YYYY-MM-DD format first (ISO format)
	const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (isoMatch) {
		const [, year, month, day] = isoMatch;
		const date = new Date(
			parseInt(year ?? "0", 10),
			parseInt(month ?? "0", 10) - 1,
			parseInt(day ?? "0", 10),
		);
		if (!Number.isNaN(date.getTime())) {
			return date;
		}
	}

	// Try YYYY-MM format
	const yearMonthMatch = trimmed.match(/^(\d{4})-(\d{2})$/);
	if (yearMonthMatch) {
		const [, year, month] = yearMonthMatch;
		const date = new Date(
			parseInt(year ?? "0", 10),
			parseInt(month ?? "0", 10) - 1,
			1,
		);
		if (!Number.isNaN(date.getTime())) {
			return date;
		}
	}

	// Try YYYY format
	const yearMatch = trimmed.match(/^(\d{4})$/);
	if (yearMatch) {
		const [, year] = yearMatch;
		const date = new Date(parseInt(year ?? "0", 10), 0, 1);
		if (!Number.isNaN(date.getTime())) {
			return date;
		}
	}

	// Fallback to native Date parsing
	const parsed = new Date(trimmed);
	if (!Number.isNaN(parsed.getTime())) {
		return parsed;
	}

	return null;
}

/**
 * Parse a required date string, throwing an error if parsing fails
 * Use this for start dates that are required fields
 */
function parseDateRequired(
	dateStr: string | null | undefined,
	fieldName: string,
	context?: string,
): Date {
	const parsed = parseDate(dateStr);
	if (!parsed) {
		const contextStr = context ? ` in ${context}` : "";
		throw new Error(
			`Failed to parse required date field '${fieldName}'${contextStr}. Received: ${dateStr ?? "null/undefined"}. Expected format: YYYY-MM-DD`,
		);
	}
	return parsed;
}

/**
 * Create structured prompt for AI optimization
 */
function createStructuredOptimizationPrompt(
	atsRecommendations: string,
	skillPriorityText: string,
	currentCosineSimilarity: number,
	rawJobDescription: string,
	extractedJobKeywords: string,
	rawResume: string,
	extractedResumeKeywords: string,
): string {
	return `You are an expert resume editor and talent acquisition specialist. Your task is to revise the following resume so that it aligns as closely as possible with the provided job description and extracted job keywords, in order to maximize the cosine similarity between the resume and the job keywords.

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
  - Preserve the core section structure: Contact Info, Professional Summary (optional), Education, Work Experience, Projects (optional), Skills, Achievements (optional).
  - When a requirement is missing, do not fabricate experience. Instead, highlight adjacent or transferable elements already in the resume and frame them with the job's terminology.
  - Maintain a natural, professional tone and avoid keyword stuffing.
  - Where possible, use quantifiable achievements already present in the resume and action verbs to make impact clear.
  - The current cosine similarity score is ${currentCosineSimilarity.toFixed(4)}. Revise the resume using the above constraints to increase this score.
- Return the optimized resume as structured data matching the provided schema. Use "YYYY-MM-DD" format for all dates. Use "Present" for current positions or ongoing education.

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

Return the optimized resume as structured JSON matching the schema exactly.`;
}

export async function POST(req: Request) {
	try {
		const session = await getSession();

		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { resumeId, analysisId } = await req.json();

		if (!resumeId || typeof resumeId !== "string") {
			return new Response("Invalid resume ID", { status: 400 });
		}

		// Get resume
		const resume = await db.resume.findUnique({
			where: { id: resumeId },
			include: {
				user: {
					include: {
						portfolio: {
							include: {
								workExperiences: { orderBy: { startDate: "desc" } },
								educations: { orderBy: { startDate: "desc" } },
								projects: { orderBy: { startDate: "desc" } },
								achievements: { orderBy: { date: "desc" } },
								skills: {
									include: {
										skill: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!resume || resume.userId !== session.user.id) {
			return new Response("Resume not found", { status: 404 });
		}

		if (!resume.user.portfolio) {
			return new Response("Portfolio not found", { status: 404 });
		}

		// Create a readable stream for progress updates and content
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				const sendProgress = (message: string) => {
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ type: "progress", message })}\n\n`,
						),
					);
				};

				try {
					// Get or create analysis
					let analysis = analysisId
						? await db.aTSAnalysis.findUnique({
								where: { id: analysisId },
							})
						: await db.aTSAnalysis.findFirst({
								where: { resumeId: resume.id },
								orderBy: { createdAt: "desc" },
							});

					if (!analysis) {
						if (!resume.user.portfolio) {
							throw new Error("Portfolio not found");
						}
						sendProgress("Running ATS analysis first...");
						const extractedJob = await extractJobPosting(resume.jobDescription);
						const extractedResume = await extractResumeData(
							resume.user.portfolio,
						);
						const scores = await calculateATSScore(
							extractedJob,
							extractedResume,
						);
						const { recommendations, priorityKeywords, missingSkills } =
							await generateATSRecommendations(
								extractedJob,
								extractedResume,
								scores,
							);

						analysis = await db.aTSAnalysis.create({
							data: {
								resumeId: resume.id,
								extractedJob: JSON.parse(JSON.stringify(extractedJob)),
								extractedResume: JSON.parse(JSON.stringify(extractedResume)),
								overallScore: scores.overallScore,
								cosineSimilarity: scores.cosineSimilarity,
								keywordMatchPercent: scores.keywordMatchPercent,
								skillOverlapPercent: scores.skillOverlapPercent,
								experienceRelevance: scores.experienceRelevance,
								recommendations: JSON.parse(JSON.stringify(recommendations)),
								priorityKeywords,
								missingSkills,
							},
						});
					}

					// Get extracted data
					const extractedJob = analysis.extractedJob as unknown as Awaited<
						ReturnType<typeof extractJobPosting>
					>;
					const extractedResume =
						analysis.extractedResume as unknown as Awaited<
							ReturnType<typeof extractResumeData>
						>;
					const recommendations = analysis.recommendations as unknown as Array<{
						category: string;
						suggestion: string;
						priority: "high" | "medium" | "low";
					}>;

					const scores = {
						overallScore: analysis.overallScore,
						cosineSimilarity: analysis.cosineSimilarity,
						keywordMatchPercent: analysis.keywordMatchPercent,
						skillOverlapPercent: analysis.skillOverlapPercent,
						experienceRelevance: analysis.experienceRelevance,
					};

					// Prepare optimization data
					sendProgress("Preparing optimization...");
					if (!resume.user.portfolio) {
						throw new Error("Portfolio not found");
					}
					const rawResume = portfolioToMarkdown(resume.user.portfolio);
					const extractedJobKeywords =
						extractedJob.extractedKeywords.join(", ");
					const extractedResumeKeywords =
						extractedResume["Extracted Keywords"].join(", ");
					const atsRecommendations = formatRecommendations(recommendations);
					const skillPriorityText = formatSkillPriority(
						analysis.priorityKeywords,
						analysis.missingSkills,
					);

					// Stream the optimization with structured output
					sendProgress("Generating optimized resume...");
					const result = streamObject({
						model: openai("gpt-4o"),
						schema: optimizedResumeSchema,
						prompt: createStructuredOptimizationPrompt(
							atsRecommendations,
							skillPriorityText,
							scores.cosineSimilarity,
							resume.jobDescription,
							extractedJobKeywords,
							rawResume,
							extractedResumeKeywords,
						),
						temperature: 0.3,
					});

					// Wait for the final complete object
					let optimizedResume: OptimizedResume | null = null;

					// Get the final complete object (don't stream partial updates)
					const finalResult = await result.object;
					optimizedResume = finalResult;

					if (!optimizedResume) {
						throw new Error("Failed to generate optimized resume");
					}

					// Generate modifications log
					const modifications: Array<{
						section: string;
						change: string;
						reason: string;
					}> = [];

					for (const rec of recommendations.slice(0, 5)) {
						modifications.push({
							section: rec.category,
							change: rec.suggestion,
							reason: `To improve ${rec.priority} priority ATS score`,
						});
					}

					// Save modified resume to database with structured data
					sendProgress("Saving optimized resume...");
					const modifiedResume = await db.modifiedResume.create({
						data: {
							originalResumeId: resume.id,
							name: `${resume.name} - Optimized`,
							contactName: optimizedResume.contactInfo.name,
							email: optimizedResume.contactInfo.email,
							phone: optimizedResume.contactInfo.phone,
							linkedin: optimizedResume.contactInfo.linkedin,
							github: optimizedResume.contactInfo.github,
							website: optimizedResume.contactInfo.website,
							professionalSummary: optimizedResume.professionalSummary,
							modifications: modifications,
							atsScore: scores.overallScore,
							workExperiences: {
								create: optimizedResume.workExperiences.map((exp, idx) => ({
									jobTitle: exp.jobTitle,
									company: exp.company,
									location: exp.location,
									startDate: parseDateRequired(
										exp.startDate,
										"startDate",
										`work experience ${idx + 1} (${exp.jobTitle} at ${exp.company})`,
									),
									endDate: exp.endDate ? parseDate(exp.endDate) : null,
									isCurrent: exp.isCurrent,
									bulletPoints: exp.bulletPoints,
								})),
							},
							educations: {
								create: optimizedResume.educations.map((edu, idx) => ({
									institution: edu.institution,
									degree: edu.degree,
									fieldOfStudy: edu.fieldOfStudy,
									gpa: edu.gpa,
									startDate: parseDateRequired(
										edu.startDate,
										"startDate",
										`education ${idx + 1} (${edu.degree} at ${edu.institution})`,
									),
									endDate: edu.endDate ? parseDate(edu.endDate) : null,
									isCurrent: edu.isCurrent,
								})),
							},
							skills: {
								create: optimizedResume.skills.map((skill) => ({
									name: skill.name,
									category: skill.category,
								})),
							},
							projects: {
								create: (optimizedResume.projects || []).map((proj) => ({
									name: proj.name,
									description: proj.description,
									bulletPoints: proj.bulletPoints,
									technologies: proj.technologies,
									url: proj.url,
								})),
							},
							achievements: {
								create: (optimizedResume.achievements || []).map((ach) => ({
									title: ach.title,
									description: ach.description,
									category: ach.category,
									date: ach.date ? parseDate(ach.date) : null,
								})),
							},
						},
					});

					// Send completion with the modified resume ID
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ type: "complete", modifiedResumeId: modifiedResume.id })}\n\n`,
						),
					);
					controller.close();
				} catch (error) {
					console.error("Error in ATS optimization:", error);
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ type: "error", error: String(error) })}\n\n`,
						),
					);
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("Error in ATS optimize route:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
