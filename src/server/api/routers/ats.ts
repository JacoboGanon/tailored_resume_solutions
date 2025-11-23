import { z } from "zod";
import {
	calculateATSScore,
	extractJobPosting,
	extractResumeData,
	generateATSRecommendations,
} from "~/server/ai/ats-extraction";
import { optimizeResumeForATS } from "~/server/ai/ats-optimizer";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const atsRouter = createTRPCRouter({
	// Analyze resume against job description
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
					extractedJob: extractedJob as unknown as Record<string, unknown>,
					extractedResume: extractedResume as unknown as Record<
						string,
						unknown
					>,
					overallScore: scores.overallScore,
					cosineSimilarity: scores.cosineSimilarity,
					keywordMatchPercent: scores.keywordMatchPercent,
					skillOverlapPercent: scores.skillOverlapPercent,
					experienceRelevance: scores.experienceRelevance,
					recommendations: recommendations as unknown as Record<
						string,
						unknown
					>,
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
						extractedJob: extractedJob as unknown as Record<string, unknown>,
						extractedResume: extractedResume as unknown as Record<
							string,
							unknown
						>,
						overallScore: scores.overallScore,
						cosineSimilarity: scores.cosineSimilarity,
						keywordMatchPercent: scores.keywordMatchPercent,
						skillOverlapPercent: scores.skillOverlapPercent,
						experienceRelevance: scores.experienceRelevance,
						recommendations: recommendations as unknown as Record<
							string,
							unknown
						>,
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
			const { optimizedResume, modifications } = await optimizeResumeForATS(
				resume.jobDescription,
				extractedJob,
				extractedResume,
				resume.user.portfolio,
				scores,
				recommendations,
				analysis.priorityKeywords,
				analysis.missingSkills,
			);

			// Save modified resume
			const modifiedResume = await ctx.db.modifiedResume.create({
				data: {
					originalResumeId: resume.id,
					name: `${resume.name} - Optimized`,
					modifiedContent: { markdown: optimizedResume } as unknown as Record<
						string,
						unknown
					>,
					modifications: modifications as unknown as Record<string, unknown>,
					atsScore: scores.overallScore,
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
			if (input.resumeId) {
				const resume = await ctx.db.resume.findUnique({
					where: { id: input.resumeId },
				});

				if (!resume || resume.userId !== ctx.session.user.id) {
					throw new Error("Resume not found");
				}

				return ctx.db.modifiedResume.findMany({
					where: { originalResumeId: input.resumeId },
					orderBy: { createdAt: "desc" },
				});
			}

			// Get all resumes for user, then get modified versions
			const resumes = await ctx.db.resume.findMany({
				where: { userId: ctx.session.user.id },
				select: { id: true },
			});

			return ctx.db.modifiedResume.findMany({
				where: {
					originalResumeId: {
						in: resumes.map((r) => r.id),
					},
				},
				orderBy: { createdAt: "desc" },
			});
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

			return {
				original: {
					resume: originalResume,
					analysis: originalAnalysis,
				},
				modified: {
					resume: modifiedResume,
					score: modifiedResume.atsScore,
				},
			};
		}),
});
