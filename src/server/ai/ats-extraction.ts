import { type OpenAIResponsesProviderOptions, openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import OpenAI from "openai";
import { JOB_EXTRACTION_PROMPT, RESUME_EXTRACTION_PROMPT } from "./prompts";

// Initialize OpenAI client for embeddings
const openaiClient = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Types for extracted JSON structures
export interface ExtractedJob {
	jobId: string;
	jobTitle: string;
	companyProfile: {
		companyName: string;
		industry?: string;
		website?: string;
		description?: string;
	};
	location: {
		city: string;
		state: string;
		country: string;
		remoteStatus: string;
	};
	datePosted: string;
	employmentType: string;
	jobSummary: string;
	keyResponsibilities: string[];
	qualifications: {
		required: string[];
		preferred: string[];
	};
	compensationAndBenefits: {
		salaryRange: string;
		benefits: string[];
	};
	applicationInfo: {
		howToApply: string;
		applyLink: string;
		contactEmail?: string;
	};
	extractedKeywords: string[];
}

export interface ExtractedResume {
	UUID: string;
	"Personal Data": {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		linkedin: string;
		portfolio: string;
		location: {
			city: string;
			country: string;
		};
	};
	Experiences: Array<{
		jobTitle: string;
		company: string;
		location: string;
		startDate: string;
		endDate: string;
		description: string[];
		technologiesUsed: string[];
	}>;
	Projects: Array<{
		projectName: string;
		description: string;
		technologiesUsed: string[];
		link: string;
		startDate: string;
		endDate: string;
	}>;
	Skills: Array<{
		category: string;
		skillName: string;
	}>;
	"Research Work": Array<{
		title: string | null;
		publication: string | null;
		date: string | null;
		link: string | null;
		description: string | null;
	}>;
	Achievements: string[];
	Education: Array<{
		institution: string;
		degree: string;
		fieldOfStudy: string | null;
		startDate: string;
		endDate: string;
		grade: string;
		description: string;
	}>;
	"Extracted Keywords": string[];
}

export interface ATSScore {
	overallScore: number;
	cosineSimilarity: number;
	keywordMatchPercent: number;
	skillOverlapPercent: number;
	experienceRelevance: number;
}

export interface ATSRecommendation {
	category: string;
	itemId?: string;
	suggestion: string;
	priority: "high" | "medium" | "low";
}

interface Portfolio {
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
}

/**
 * Extract job posting to structured JSON
 */
export async function extractJobPosting(
	jobDescription: string,
): Promise<ExtractedJob> {
	const { text } = await generateText({
		model: openai("gpt-5-mini"),
		providerOptions: {
			openai: {
				reasoningEffort: "minimal",
			} satisfies OpenAIResponsesProviderOptions,
		},
		prompt: JOB_EXTRACTION_PROMPT(jobDescription),
	});

	// Parse JSON from response (remove any markdown formatting if present)
	const cleanedText = text
		.trim()
		.replace(/^```json\n?/g, "")
		.replace(/\n?```$/g, "")
		.trim();

	try {
		return JSON.parse(cleanedText) as ExtractedJob;
	} catch (error) {
		console.error("Failed to parse extracted job JSON:", error);
		console.error("Raw text:", cleanedText);
		throw new Error("Failed to extract job posting structure");
	}
}

/**
 * Convert portfolio to resume text format, then extract to structured JSON
 */
function portfolioToResumeText(portfolio: Portfolio): string {
	const formatDate = (date: Date | null | undefined, isCurrent = false) => {
		if (isCurrent) return "Present";
		if (!date) return "";
		const d = new Date(date);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	};

	let resumeText = "";

	// Personal Data
	resumeText += `Name: ${portfolio.name || "N/A"}\n`;
	resumeText += `Email: ${portfolio.email || ""}\n`;
	resumeText += `Phone: ${portfolio.phone || ""}\n`;
	resumeText += `LinkedIn: ${portfolio.linkedin || ""}\n`;
	resumeText += `Portfolio: ${portfolio.website || portfolio.github || ""}\n\n`;

	// Work Experience
	if (portfolio.workExperiences.length > 0) {
		resumeText += "WORK EXPERIENCE\n";
		for (const exp of portfolio.workExperiences) {
			resumeText += `${exp.jobTitle} at ${exp.company}\n`;
			resumeText += `Location: ${exp.location || "N/A"}\n`;
			resumeText += `Duration: ${formatDate(exp.startDate)} - ${formatDate(exp.endDate, exp.isCurrent)}\n`;
			for (const bullet of exp.bulletPoints) {
				resumeText += `- ${bullet}\n`;
			}
			resumeText += "\n";
		}
	}

	// Education
	if (portfolio.educations.length > 0) {
		resumeText += "EDUCATION\n";
		for (const edu of portfolio.educations) {
			resumeText += `${edu.degree} in ${edu.fieldOfStudy}\n`;
			resumeText += `Institution: ${edu.institution}\n`;
			resumeText += `Duration: ${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}\n`;
			if (edu.gpa) resumeText += `GPA: ${edu.gpa}\n`;
			resumeText += "\n";
		}
	}

	// Projects
	if (portfolio.projects.length > 0) {
		resumeText += "PROJECTS\n";
		for (const proj of portfolio.projects) {
			resumeText += `${proj.name}\n`;
			if (proj.description) resumeText += `${proj.description}\n`;
			if (proj.technologies.length > 0) {
				resumeText += `Technologies: ${proj.technologies.join(", ")}\n`;
			}
			if (proj.url) resumeText += `Link: ${proj.url}\n`;
			for (const bullet of proj.bulletPoints) {
				resumeText += `- ${bullet}\n`;
			}
			resumeText += "\n";
		}
	}

	// Skills
	if (portfolio.skills.length > 0) {
		resumeText += "SKILLS\n";
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
			resumeText += `${category}: ${skills.join(", ")}\n`;
		}
		resumeText += "\n";
	}

	// Achievements
	if (portfolio.achievements.length > 0) {
		resumeText += "ACHIEVEMENTS\n";
		for (const ach of portfolio.achievements) {
			resumeText += `${ach.title}: ${ach.description}\n`;
		}
	}

	return resumeText;
}

/**
 * Extract resume data to structured JSON
 */
export async function extractResumeData(
	portfolio: Portfolio,
): Promise<ExtractedResume> {
	const resumeText = portfolioToResumeText(portfolio);

	const { text } = await generateText({
		model: openai("gpt-5-mini"),
		providerOptions: {
			openai: {
				reasoningEffort: "minimal",
			} satisfies OpenAIResponsesProviderOptions,
		},
		prompt: RESUME_EXTRACTION_PROMPT(resumeText),
	});

	const cleanedText = text
		.trim()
		.replace(/^```json\n?/g, "")
		.replace(/\n?```$/g, "")
		.trim();

	try {
		return JSON.parse(cleanedText) as ExtractedResume;
	} catch (error) {
		console.error("Failed to parse extracted resume JSON:", error);
		console.error("Raw text:", cleanedText);
		throw new Error("Failed to extract resume structure");
	}
}

/**
 * Extract keywords from text using simple NLP techniques
 */
function extractKeywords(text: string): string[] {
	// Convert to lowercase and split into words
	const words = text.toLowerCase().split(/\s+/);

	// Remove common stop words
	const stopWords = new Set([
		"the",
		"a",
		"an",
		"and",
		"or",
		"but",
		"in",
		"on",
		"at",
		"to",
		"for",
		"of",
		"with",
		"by",
		"from",
		"as",
		"is",
		"was",
		"are",
		"were",
		"been",
		"be",
		"have",
		"has",
		"had",
		"do",
		"does",
		"did",
		"will",
		"would",
		"should",
		"could",
		"may",
		"might",
		"must",
		"can",
		"this",
		"that",
		"these",
		"those",
		"i",
		"you",
		"he",
		"she",
		"it",
		"we",
		"they",
		"what",
		"which",
		"who",
		"whom",
		"whose",
		"where",
		"when",
		"why",
		"how",
		"all",
		"each",
		"every",
		"both",
		"few",
		"more",
		"most",
		"other",
		"some",
		"such",
		"no",
		"nor",
		"not",
		"only",
		"own",
		"same",
		"so",
		"than",
		"too",
		"very",
		"just",
		"now",
	]);

	// Filter out stop words and short words, keep capitalized words and technical terms
	const keywords = new Set<string>();

	for (const word of words) {
		const cleaned = word.replace(/[^\w]/g, "");
		if (cleaned.length > 2 && !stopWords.has(cleaned)) {
			keywords.add(cleaned);
		}
	}

	// Also extract capitalized terms (likely skills/technologies)
	const capitalizedTerms =
		text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
	for (const term of capitalizedTerms) {
		const cleaned = term.toLowerCase();
		if (cleaned.length > 2) {
			keywords.add(cleaned);
		}
	}

	return Array.from(keywords);
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
	if (vecA.length !== vecB.length) {
		throw new Error("Vectors must have the same length");
	}

	let dotProduct = 0;
	let normA = 0;
	let normB = 0;

	for (let i = 0; i < vecA.length; i++) {
		dotProduct += (vecA[i] ?? 0) * (vecB[i] ?? 0);
		normA += (vecA[i] ?? 0) * (vecA[i] ?? 0);
		normB += (vecB[i] ?? 0) * (vecB[i] ?? 0);
	}

	if (normA === 0 || normB === 0) {
		return 0;
	}

	return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate ATS scores using embeddings and keyword matching
 */
export async function calculateATSScore(
	extractedJob: ExtractedJob,
	extractedResume: ExtractedResume,
): Promise<ATSScore> {
	// Extract keywords from job and resume
	const jobKeywords = [
		...extractedJob.extractedKeywords,
		...extractedJob.qualifications.required,
		...extractedJob.qualifications.preferred,
		...extractKeywords(extractedJob.jobSummary),
		...extractKeywords(extractedJob.keyResponsibilities.join(" ")),
	];

	const resumeKeywords = [
		...extractedResume["Extracted Keywords"],
		...extractedResume.Skills.map((s) => s.skillName),
		...extractedResume.Experiences.flatMap((e) => [
			...e.technologiesUsed,
			...extractKeywords(e.description.join(" ")),
		]),
		...extractedResume.Projects.flatMap((p) => [
			...p.technologiesUsed,
			...extractKeywords(p.description),
		]),
	];

	// Remove duplicates and normalize
	const uniqueJobKeywords = Array.from(
		new Set(jobKeywords.map((k) => k.toLowerCase())),
	);
	const uniqueResumeKeywords = Array.from(
		new Set(resumeKeywords.map((k) => k.toLowerCase())),
	);

	// Calculate keyword match percentage
	const matchedKeywords = uniqueJobKeywords.filter((keyword) =>
		uniqueResumeKeywords.some(
			(resumeKeyword) =>
				resumeKeyword.includes(keyword) || keyword.includes(resumeKeyword),
		),
	);
	const keywordMatchPercent =
		uniqueJobKeywords.length > 0
			? (matchedKeywords.length / uniqueJobKeywords.length) * 100
			: 0;

	// Calculate skill overlap
	const jobSkills = [
		...extractedJob.qualifications.required,
		...extractedJob.qualifications.preferred,
	].map((s) => s.toLowerCase());
	const resumeSkills = extractedResume.Skills.map((s) =>
		s.skillName.toLowerCase(),
	);
	const matchedSkills = jobSkills.filter((skill) =>
		resumeSkills.some(
			(resumeSkill) =>
				resumeSkill.includes(skill) || skill.includes(resumeSkill),
		),
	);
	const skillOverlapPercent =
		jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 0;

	// Calculate cosine similarity using embeddings
	let cosineSimilarityScore = 0;
	try {
		// Create embeddings for job and resume keywords
		const jobText = uniqueJobKeywords.join(" ");
		const resumeText = uniqueResumeKeywords.join(" ");

		const [jobEmbedding, resumeEmbedding] = await Promise.all([
			openaiClient.embeddings.create({
				model: "text-embedding-3-small",
				input: jobText || "empty",
			}),
			openaiClient.embeddings.create({
				model: "text-embedding-3-small",
				input: resumeText || "empty",
			}),
		]);

		cosineSimilarityScore = cosineSimilarity(
			jobEmbedding.data[0]?.embedding ?? [],
			resumeEmbedding.data[0]?.embedding ?? [],
		);
	} catch (error) {
		console.error("Error calculating embeddings:", error);
		// Fallback: use keyword overlap as similarity proxy
		cosineSimilarityScore = keywordMatchPercent / 100;
	}

	// Calculate experience relevance (simple heuristic based on job title matching)
	const jobTitleWords = extractedJob.jobTitle.toLowerCase().split(/\s+/);
	let experienceRelevance = 0;
	if (extractedResume.Experiences.length > 0) {
		const relevanceScores = extractedResume.Experiences.map((exp) => {
			const expTitleWords = exp.jobTitle.toLowerCase().split(/\s+/);
			const matchingWords = jobTitleWords.filter((word) =>
				expTitleWords.some(
					(expWord) => expWord.includes(word) || word.includes(expWord),
				),
			);
			return matchingWords.length / Math.max(jobTitleWords.length, 1);
		});
		experienceRelevance =
			(relevanceScores.reduce((a, b) => a + b, 0) / relevanceScores.length) *
			100;
	}

	// Calculate overall score (weighted average)
	const overallScore =
		cosineSimilarityScore * 40 +
		keywordMatchPercent * 0.3 +
		skillOverlapPercent * 0.2 +
		experienceRelevance * 0.1;

	return {
		overallScore: Math.min(100, Math.max(0, overallScore)),
		cosineSimilarity: cosineSimilarityScore,
		keywordMatchPercent,
		skillOverlapPercent,
		experienceRelevance,
	};
}

/**
 * Generate ATS recommendations based on scores and gaps
 */
export async function generateATSRecommendations(
	extractedJob: ExtractedJob,
	extractedResume: ExtractedResume,
	scores: ATSScore,
): Promise<{
	recommendations: ATSRecommendation[];
	priorityKeywords: string[];
	missingSkills: string[];
}> {
	const recommendations: ATSRecommendation[] = [];
	const priorityKeywords: string[] = [];
	const missingSkills: string[] = [];

	// Find missing skills
	const jobSkills = [
		...extractedJob.qualifications.required,
		...extractedJob.qualifications.preferred,
	].map((s) => s.toLowerCase());
	const resumeSkills = extractedResume.Skills.map((s) =>
		s.skillName.toLowerCase(),
	);

	for (const jobSkill of jobSkills) {
		const found = resumeSkills.some(
			(resumeSkill) =>
				resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill),
		);
		if (!found) {
			missingSkills.push(jobSkill);
			recommendations.push({
				category: "skill",
				suggestion: `Add "${jobSkill}" to your skills section`,
				priority: extractedJob.qualifications.required
					.map((s) => s.toLowerCase())
					.includes(jobSkill)
					? "high"
					: "medium",
			});
		}
	}

	// Find missing keywords
	const jobKeywords = extractedJob.extractedKeywords.map((k) =>
		k.toLowerCase(),
	);
	const resumeKeywords = extractedResume["Extracted Keywords"].map((k) =>
		k.toLowerCase(),
	);

	for (const keyword of jobKeywords.slice(0, 10)) {
		// Top 10 keywords
		const found = resumeKeywords.some(
			(resumeKeyword) =>
				resumeKeyword.includes(keyword) || keyword.includes(resumeKeyword),
		);
		if (!found) {
			priorityKeywords.push(keyword);
			recommendations.push({
				category: "general",
				suggestion: `Incorporate the keyword "${keyword}" naturally into your resume`,
				priority: "medium",
			});
		}
	}

	// Add score-based recommendations
	if (scores.keywordMatchPercent < 50) {
		recommendations.push({
			category: "general",
			suggestion:
				"Increase keyword density by incorporating more job-relevant terms throughout your resume",
			priority: "high",
		});
	}

	if (scores.skillOverlapPercent < 60) {
		recommendations.push({
			category: "skill",
			suggestion:
				"Add more required and preferred skills to better match the job requirements",
			priority: "high",
		});
	}

	if (scores.experienceRelevance < 50) {
		recommendations.push({
			category: "work_experience",
			suggestion:
				"Reframe your work experience to better align with the job title and responsibilities",
			priority: "medium",
		});
	}

	return {
		recommendations: recommendations.slice(0, 10), // Limit to top 10
		priorityKeywords: priorityKeywords.slice(0, 15),
		missingSkills: missingSkills.slice(0, 10),
	};
}
