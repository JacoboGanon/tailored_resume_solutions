import { z } from "zod";
import {
	calculateATSScore,
	extractJobPosting,
	extractResumeData,
	generateATSRecommendations,
} from "~/server/ai/ats-extraction";
import { optimizeResumeForATS } from "~/server/ai/ats-optimizer";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

/**
 * Convert structured modified resume to markdown for display
 */
function modifiedResumeToMarkdown(modifiedResume: {
	contactName: string | null;
	email: string | null;
	phone: string | null;
	linkedin: string | null;
	github: string | null;
	website: string | null;
	professionalSummary: string | null;
	workExperiences: Array<{
		jobTitle: string;
		company: string;
		location: string | null;
		startDate: Date;
		endDate: Date | null;
		isCurrent: boolean;
		bulletPoints: string[];
	}>;
	educations: Array<{
		institution: string;
		degree: string;
		fieldOfStudy: string;
		gpa: string | null;
		startDate: Date;
		endDate: Date | null;
		isCurrent: boolean;
	}>;
	skills: Array<{
		name: string;
		category: string | null;
	}>;
	projects: Array<{
		name: string;
		description: string | null;
		bulletPoints: string[];
		technologies: string[];
		url: string | null;
	}>;
	achievements: Array<{
		title: string;
		description: string;
		category: string;
		date: Date | null;
	}>;
}): string {
	const formatDate = (date: Date | null | undefined, isCurrent = false) => {
		if (isCurrent) return "Present";
		if (!date) return "";
		const d = new Date(date);
		return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
	};

	let markdown = "";

	// Header
	if (modifiedResume.contactName) {
		markdown += `# ${modifiedResume.contactName}\n\n`;
	}

	// Contact Info
	const contactParts: string[] = [];
	if (modifiedResume.email) contactParts.push(modifiedResume.email);
	if (modifiedResume.phone) contactParts.push(modifiedResume.phone);
	if (modifiedResume.linkedin)
		contactParts.push(`LinkedIn: ${modifiedResume.linkedin}`);
	if (modifiedResume.github)
		contactParts.push(`GitHub: ${modifiedResume.github}`);
	if (modifiedResume.website)
		contactParts.push(`Website: ${modifiedResume.website}`);
	if (contactParts.length > 0) {
		markdown += `${contactParts.join(" | ")}\n\n`;
	}

	// Professional Summary
	if (modifiedResume.professionalSummary) {
		markdown += `## Professional Summary\n\n${modifiedResume.professionalSummary}\n\n`;
	}

	// Work Experience
	if (modifiedResume.workExperiences.length > 0) {
		markdown += "## Work Experience\n\n";
		for (const exp of modifiedResume.workExperiences) {
			markdown += `### ${exp.jobTitle} at ${exp.company}\n`;
			markdown += `${exp.location || ""} | ${formatDate(exp.startDate)} - ${formatDate(exp.endDate, exp.isCurrent)}\n\n`;
			for (const bullet of exp.bulletPoints) {
				markdown += `- ${bullet}\n`;
			}
			markdown += "\n";
		}
	}

	// Education
	if (modifiedResume.educations.length > 0) {
		markdown += "## Education\n\n";
		for (const edu of modifiedResume.educations) {
			markdown += `### ${edu.degree} in ${edu.fieldOfStudy}\n`;
			markdown += `${edu.institution} | ${formatDate(edu.startDate)} - ${formatDate(edu.endDate, edu.isCurrent)}\n`;
			if (edu.gpa) markdown += `GPA: ${edu.gpa}\n`;
			markdown += "\n";
		}
	}

	// Skills
	if (modifiedResume.skills.length > 0) {
		markdown += "## Skills\n\n";
		const skillsByCategory = modifiedResume.skills.reduce(
			(acc, s) => {
				const category = s.category || "Other";
				if (!acc[category]) acc[category] = [];
				acc[category].push(s.name);
				return acc;
			},
			{} as Record<string, string[]>,
		);
		for (const [category, skills] of Object.entries(skillsByCategory)) {
			markdown += `**${category}**: ${skills.join(", ")}\n\n`;
		}
	}

	// Projects
	if (modifiedResume.projects.length > 0) {
		markdown += "## Projects\n\n";
		for (const proj of modifiedResume.projects) {
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
	if (modifiedResume.achievements.length > 0) {
		markdown += "## Achievements\n\n";
		for (const ach of modifiedResume.achievements) {
			markdown += `### ${ach.title} (${ach.category})\n`;
			if (ach.date) markdown += `${formatDate(ach.date)}\n\n`;
			markdown += `${ach.description}\n\n`;
		}
	}

	return markdown;
}

export const atsRouter = createTRPCRouter({
	// Analyze resume against job description
	// @deprecated Use /api/ats/analyze streaming endpoint instead
	analyzeResume: protectedProcedure
		.input(
			z.object({
				resumeId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Get resume
			const resume = await ctx.db.resume.findUnique({
				where: { id: input.resumeId },
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

			if (!resume || resume.userId !== ctx.session.user.id) {
				throw new Error("Resume not found");
			}

			if (!resume.user.portfolio) {
				throw new Error("Portfolio not found");
			}

			// Extract job posting
			const extractedJob = await extractJobPosting(resume.jobDescription);

			// Extract resume data
			const extractedResume = await extractResumeData(resume.user.portfolio);

			// Calculate ATS scores
			const scores = await calculateATSScore(extractedJob, extractedResume);

			// Generate recommendations
			const { recommendations, priorityKeywords, missingSkills } =
				await generateATSRecommendations(extractedJob, extractedResume, scores);

			// Save analysis to database
			const analysis = await ctx.db.aTSAnalysis.create({
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

			return analysis;
		}),

	// Get ATS analysis for a resume
	getATSAnalysis: protectedProcedure
		.input(
			z.object({
				resumeId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const resume = await ctx.db.resume.findUnique({
				where: { id: input.resumeId },
			});

			if (!resume || resume.userId !== ctx.session.user.id) {
				throw new Error("Resume not found");
			}

			const analysis = await ctx.db.aTSAnalysis.findFirst({
				where: { resumeId: input.resumeId },
				orderBy: { createdAt: "desc" },
			});

			return analysis;
		}),

	// Optimize resume based on ATS analysis
	// @deprecated Use /api/ats/optimize streaming endpoint instead
	optimizeResume: protectedProcedure
		.input(
			z.object({
				resumeId: z.string(),
				analysisId: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Get resume
			const resume = await ctx.db.resume.findUnique({
				where: { id: input.resumeId },
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

			if (!resume || resume.userId !== ctx.session.user.id) {
				throw new Error("Resume not found");
			}

			if (!resume.user.portfolio) {
				throw new Error("Portfolio not found");
			}

			// Get or create analysis
			let analysis = input.analysisId
				? await ctx.db.aTSAnalysis.findUnique({
						where: { id: input.analysisId },
					})
				: await ctx.db.aTSAnalysis.findFirst({
						where: { resumeId: input.resumeId },
						orderBy: { createdAt: "desc" },
					});

			if (!analysis) {
				// Run analysis first
				const extractedJob = await extractJobPosting(resume.jobDescription);
				const extractedResume = await extractResumeData(resume.user.portfolio);
				const scores = await calculateATSScore(extractedJob, extractedResume);
				const { recommendations, priorityKeywords, missingSkills } =
					await generateATSRecommendations(
						extractedJob,
						extractedResume,
						scores,
					);

				analysis = await ctx.db.aTSAnalysis.create({
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
			const extractedResume = analysis.extractedResume as unknown as Awaited<
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

			// Optimize resume
			const { modifications } = await optimizeResumeForATS(
				resume.jobDescription,
				extractedJob,
				extractedResume,
				resume.user.portfolio,
				scores,
				recommendations,
				analysis.priorityKeywords,
				analysis.missingSkills,
			);

			const portfolio = resume.user.portfolio;

			// Save modified resume with structured data from portfolio
			// Note: The optimizedResume markdown is discarded since this endpoint is deprecated.
			// Use /api/ats/optimize for proper structured optimization.
			const modifiedResume = await ctx.db.modifiedResume.create({
				data: {
					originalResumeId: resume.id,
					name: `${resume.name} - Optimized`,
					contactName: portfolio.name,
					email: portfolio.email,
					phone: portfolio.phone,
					linkedin: portfolio.linkedin,
					github: portfolio.github,
					website: portfolio.website,
					modifications: modifications,
					atsScore: scores.overallScore,
					workExperiences: {
						create: portfolio.workExperiences.map((exp) => ({
							jobTitle: exp.jobTitle,
							company: exp.company,
							location: exp.location,
							startDate: exp.startDate,
							endDate: exp.endDate,
							isCurrent: exp.isCurrent,
							bulletPoints: exp.bulletPoints,
						})),
					},
					educations: {
						create: portfolio.educations.map((edu) => ({
							institution: edu.institution,
							degree: edu.degree,
							fieldOfStudy: edu.fieldOfStudy,
							gpa: edu.gpa,
							startDate: edu.startDate,
							endDate: edu.endDate,
							isCurrent: edu.isCurrent,
						})),
					},
					projects: {
						create: portfolio.projects.map((proj) => ({
							name: proj.name,
							description: proj.description,
							bulletPoints: proj.bulletPoints,
							technologies: proj.technologies,
							url: proj.url,
						})),
					},
					achievements: {
						create: portfolio.achievements.map((ach) => ({
							title: ach.title,
							description: ach.description,
							category: ach.category,
							date: ach.date,
						})),
					},
					skills: {
						create: portfolio.skills.map((ps) => ({
							name: ps.skill.name,
							category: ps.skill.category,
						})),
					},
				},
			});

			return modifiedResume;
		}),

	// Get all modified resumes for a user
	getModifiedResumes: protectedProcedure
		.input(
			z.object({
				resumeId: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			type ModifiedResumeWithIncludes = Awaited<
				ReturnType<
					typeof ctx.db.modifiedResume.findMany<{
						include: {
							workExperiences: true;
							educations: true;
							projects: true;
							achievements: true;
							skills: true;
						};
					}>
				>
			>;

			let modifiedResumes: ModifiedResumeWithIncludes;

			if (input.resumeId) {
				const resume = await ctx.db.resume.findUnique({
					where: { id: input.resumeId },
				});

				if (!resume || resume.userId !== ctx.session.user.id) {
					throw new Error("Resume not found");
				}

				modifiedResumes = await ctx.db.modifiedResume.findMany({
					where: { originalResumeId: input.resumeId },
					include: {
						workExperiences: { orderBy: { startDate: "desc" } },
						educations: { orderBy: { startDate: "desc" } },
						projects: { orderBy: { createdAt: "desc" } },
						achievements: { orderBy: { date: "desc" } },
						skills: { orderBy: { createdAt: "asc" } },
					},
					orderBy: { createdAt: "desc" },
				});
			} else {
				// Get all resumes for user, then get modified versions
				const resumes = await ctx.db.resume.findMany({
					where: { userId: ctx.session.user.id },
					select: { id: true },
				});

				modifiedResumes = await ctx.db.modifiedResume.findMany({
					where: {
						originalResumeId: {
							in: resumes.map((r) => r.id),
						},
					},
					include: {
						workExperiences: { orderBy: { startDate: "desc" } },
						educations: { orderBy: { startDate: "desc" } },
						projects: { orderBy: { createdAt: "desc" } },
						achievements: { orderBy: { date: "desc" } },
						skills: { orderBy: { createdAt: "asc" } },
					},
					orderBy: { createdAt: "desc" },
				});
			}

			// Convert structured data to markdown for backward compatibility with frontend
			return modifiedResumes.map((mr) => ({
				...mr,
				modifiedContent: {
					markdown: modifiedResumeToMarkdown({
						contactName: mr.contactName,
						email: mr.email,
						phone: mr.phone,
						linkedin: mr.linkedin,
						github: mr.github,
						website: mr.website,
						professionalSummary: mr.professionalSummary,
						workExperiences: mr.workExperiences,
						educations: mr.educations,
						skills: mr.skills,
						projects: mr.projects,
						achievements: mr.achievements,
					}),
				},
			}));
		}),

	// Compare original vs modified resume
	compareVersions: protectedProcedure
		.input(
			z.object({
				modifiedResumeId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const modifiedResume = await ctx.db.modifiedResume.findUnique({
				where: { id: input.modifiedResumeId },
				include: {
					originalResume: {
						include: {
							atsAnalyses: {
								orderBy: { createdAt: "desc" },
								take: 1,
							},
						},
					},
					workExperiences: { orderBy: { startDate: "desc" } },
					educations: { orderBy: { startDate: "desc" } },
					projects: { orderBy: { createdAt: "desc" } },
					achievements: { orderBy: { date: "desc" } },
					skills: { orderBy: { createdAt: "asc" } },
				},
			});

			if (!modifiedResume) {
				throw new Error("Modified resume not found");
			}

			const originalResume = modifiedResume.originalResume;

			if (originalResume.userId !== ctx.session.user.id) {
				throw new Error("Unauthorized");
			}

			const originalAnalysis = originalResume.atsAnalyses[0];

			// Convert structured data to markdown for backward compatibility
			const modifiedResumeWithMarkdown = {
				...modifiedResume,
				modifiedContent: {
					markdown: modifiedResumeToMarkdown({
						contactName: modifiedResume.contactName,
						email: modifiedResume.email,
						phone: modifiedResume.phone,
						linkedin: modifiedResume.linkedin,
						github: modifiedResume.github,
						website: modifiedResume.website,
						professionalSummary: modifiedResume.professionalSummary,
						workExperiences: modifiedResume.workExperiences,
						educations: modifiedResume.educations,
						skills: modifiedResume.skills,
						projects: modifiedResume.projects,
						achievements: modifiedResume.achievements,
					}),
				},
			};

			return {
				original: {
					resume: originalResume,
					analysis: originalAnalysis,
				},
				modified: {
					resume: modifiedResumeWithMarkdown,
					score: modifiedResume.atsScore,
				},
			};
		}),
});
