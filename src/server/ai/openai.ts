import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";
import {
	formatPortfolioForAI,
	IMPROVEMENT_SUGGESTIONS_PROMPT,
	JOB_MATCHING_SYSTEM_PROMPT,
	JOB_MATCHING_USER_PROMPT,
} from "./prompts";

// Schema for the streamObject response
export const jobMatchSchema = z.object({
	workExperienceIds: z
		.array(z.string())
		.describe(
			"Array of selected work experience IDs that are most relevant to the job",
		),
	educationIds: z
		.array(z.string())
		.describe(
			"Array of selected education IDs that are most relevant to the job",
		),
	projectIds: z
		.array(z.string())
		.describe(
			"Array of selected project IDs that are most relevant to the job",
		),
	achievementIds: z
		.array(z.string())
		.describe(
			"Array of selected achievement IDs that are most relevant to the job",
		),
	skillIds: z
		.array(z.string())
		.describe("Array of selected skill IDs that are most relevant to the job"),
	reasoning: z
		.string()
		.optional()
		.describe("Brief explanation of why these items were selected"),
});

export type JobMatchResult = z.infer<typeof jobMatchSchema>;

// Schema for improvement suggestions
export const suggestionSchema = z.object({
	suggestions: z.array(
		z.object({
			category: z
				.enum([
					"work_experience",
					"education",
					"project",
					"achievement",
					"skill",
					"general",
				])
				.describe("Category of the suggestion"),
			itemId: z
				.string()
				.optional()
				.describe("ID of the specific item this suggestion relates to"),
			suggestion: z.string().describe("The specific, actionable suggestion"),
			priority: z
				.enum(["high", "medium", "low"])
				.describe("Priority level of this suggestion"),
		}),
	),
});

export type SuggestionResult = z.infer<typeof suggestionSchema>;

interface Portfolio {
	workExperiences: Array<{
		id: string;
		jobTitle: string;
		company: string;
		location?: string | null;
		startDate: Date;
		endDate?: Date | null;
		isCurrent: boolean;
		bulletPoints: string;
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
		technologies: string;
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
}

/**
 * Match job description to portfolio and return relevant item IDs
 * Returns a stream that can be consumed in real-time
 */
export async function matchJobToPortfolio(
	jobDescription: string,
	portfolio: Portfolio,
) {
	const portfolioFormatted = formatPortfolioForAI(portfolio);

	const result = await streamObject({
		model: openai("gpt-4o-mini"),
		schema: jobMatchSchema,
		system: JOB_MATCHING_SYSTEM_PROMPT,
		prompt: JOB_MATCHING_USER_PROMPT(jobDescription, portfolioFormatted),
	});

	return result;
}

/**
 * Generate improvement suggestions based on selected items and job description
 */
export async function generateImprovementSuggestions(
	jobDescription: string,
	selectedItemIds: {
		workExperienceIds: string[];
		educationIds: string[];
		projectIds: string[];
		achievementIds: string[];
		skillIds: string[];
	},
	portfolio: Portfolio,
): Promise<SuggestionResult> {
	const portfolioFormatted = formatPortfolioForAI(portfolio);

	// Format selected items for context
	const selectedFormatted = JSON.stringify(selectedItemIds, null, 2);

	const { object } = await streamObject({
		model: openai("gpt-4o-mini"),
		schema: suggestionSchema,
		prompt: IMPROVEMENT_SUGGESTIONS_PROMPT(
			jobDescription,
			selectedFormatted,
			portfolioFormatted,
		),
	});

	return object;
}
