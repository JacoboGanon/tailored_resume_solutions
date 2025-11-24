import { z } from "zod";

export const optimizedResumeSchema = z.object({
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

export type OptimizedResume = z.infer<typeof optimizedResumeSchema>;