import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const selectedItemsSchema = z.object({
	workExperienceIds: z.array(z.string()),
	educationIds: z.array(z.string()),
	projectIds: z.array(z.string()),
	achievementIds: z.array(z.string()),
	skillIds: z.array(z.string()),
});

export const resumeRouter = createTRPCRouter({
	// Save resume to history
	saveResume: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				jobDescription: z.string().min(1),
				selectedItemIds: selectedItemsSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.resume.create({
				data: {
					userId: ctx.session.user.id,
					name: input.name,
					jobDescription: input.jobDescription,
					selectedItemIds: input.selectedItemIds,
				},
			});
		}),

	// Get resume history (includes both original and optimized resumes)
	getResumeHistory: protectedProcedure.query(async ({ ctx }) => {
		const resumes = await ctx.db.resume.findMany({
			where: { userId: ctx.session.user.id },
			orderBy: { createdAt: "desc" },
		});

		// Get all modified resumes for the user's resumes
		const modifiedResumes = await ctx.db.modifiedResume.findMany({
			where: {
				originalResumeId: {
					in: resumes.map((r) => r.id),
				},
			},
			orderBy: { createdAt: "desc" },
			include: {
				originalResume: true,
			},
		});

		// Format modified resumes to look like regular resumes for display
		const formattedOptimized = modifiedResumes.map((modified) => ({
			id: modified.id,
			userId: modified.originalResume.userId,
			name: modified.name,
			jobDescription: modified.originalResume.jobDescription,
			selectedItemIds: modified.originalResume.selectedItemIds,
			pdfUrl: null,
			createdAt: modified.createdAt,
			updatedAt: modified.createdAt,
			isOptimized: true,
			originalResumeId: modified.originalResumeId,
			modifiedResumeId: modified.id,
		}));

		// Mark original resumes
		const formattedOriginal = resumes.map((resume) => ({
			...resume,
			isOptimized: false,
		}));

		// Combine and sort by creation date
		return [...formattedOriginal, ...formattedOptimized].sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
		);
	}),

	// Get single resume
	getResume: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const resume = await ctx.db.resume.findUnique({
				where: { id: input.id },
			});

			if (!resume || resume.userId !== ctx.session.user.id) {
				throw new Error("Resume not found");
			}

			return resume;
		}),

	// Delete resume from history (handles both regular and optimized resumes)
	deleteResume: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				isOptimized: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.isOptimized) {
				// Delete modified resume
				const modifiedResume = await ctx.db.modifiedResume.findUnique({
					where: { id: input.id },
					include: {
						originalResume: true,
					},
				});

				if (
					!modifiedResume ||
					modifiedResume.originalResume.userId !== ctx.session.user.id
				) {
					throw new Error("Resume not found");
				}

				return ctx.db.modifiedResume.delete({
					where: { id: input.id },
				});
			}

			// Delete regular resume
			const resume = await ctx.db.resume.findUnique({
				where: { id: input.id },
			});

			if (!resume || resume.userId !== ctx.session.user.id) {
				throw new Error("Resume not found");
			}

			return ctx.db.resume.delete({
				where: { id: input.id },
			});
		}),

	// Update resume
	updateResume: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				selectedItemIds: selectedItemsSchema.optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const resume = await ctx.db.resume.findUnique({
				where: { id: input.id },
			});

			if (!resume || resume.userId !== ctx.session.user.id) {
				throw new Error("Resume not found");
			}

			return ctx.db.resume.update({
				where: { id: input.id },
				data: {
					...(input.name && { name: input.name }),
					...(input.selectedItemIds && {
						selectedItemIds: input.selectedItemIds,
					}),
				},
			});
		}),
});
