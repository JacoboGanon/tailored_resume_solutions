import { type OpenAIResponsesProviderOptions, openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type {
	ATSRecommendation,
	ATSScore,
	ExtractedJob,
	ExtractedResume,
} from "./ats-extraction";
import { ATS_RESUME_IMPROVEMENT_PROMPT } from "./prompts";

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
 * Convert portfolio to markdown resume format
 */
function portfolioToMarkdown(portfolio: Portfolio): string {
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
function formatRecommendations(recommendations: ATSRecommendation[]): string {
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
 * Optimize resume for ATS based on recommendations
 */
export async function optimizeResumeForATS(
	rawJobDescription: string,
	extractedJob: ExtractedJob,
	extractedResume: ExtractedResume,
	portfolio: Portfolio,
	scores: ATSScore,
	recommendations: ATSRecommendation[],
	priorityKeywords: string[],
	missingSkills: string[],
): Promise<{
	optimizedResume: string;
	modifications: Array<{
		section: string;
		change: string;
		reason: string;
	}>;
}> {
	const rawResume = portfolioToMarkdown(portfolio);
	const extractedJobKeywords = extractedJob.extractedKeywords.join(", ");
	const extractedResumeKeywords =
		extractedResume["Extracted Keywords"].join(", ");
	const atsRecommendations = formatRecommendations(recommendations);
	const skillPriorityText = formatSkillPriority(
		priorityKeywords,
		missingSkills,
	);

	const { text } = await generateText({
		model: openai("gpt-5-mini"),
		providerOptions: {
			openai: {
				reasoningEffort: "minimal",
			} satisfies OpenAIResponsesProviderOptions,
		},
		prompt: ATS_RESUME_IMPROVEMENT_PROMPT(
			atsRecommendations,
			skillPriorityText,
			scores.cosineSimilarity,
			rawJobDescription,
			extractedJobKeywords,
			rawResume,
			extractedResumeKeywords,
		),
	});

	// Clean up the response (remove markdown code blocks if present)
	const optimizedResume = text
		.trim()
		.replace(/^```markdown\n?/g, "")
		.replace(/^```md\n?/g, "")
		.replace(/\n?```$/g, "")
		.trim();

	// Generate a simple modifications log
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

	return {
		optimizedResume,
		modifications,
	};
}
