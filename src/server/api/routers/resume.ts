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
					selectedItemIds: JSON.stringify(input.selectedItemIds),
				},
			});
		}),

	// Get resume history
	getResumeHistory: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.resume.findMany({
			where: { userId: ctx.session.user.id },
			orderBy: { createdAt: "desc" },
		});
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

	// Delete resume from history
	deleteResume: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
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
						selectedItemIds: JSON.stringify(input.selectedItemIds),
					}),
				},
			});
		}),
});
