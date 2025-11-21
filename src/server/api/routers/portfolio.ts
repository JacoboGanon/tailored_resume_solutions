import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Helper function to parse bullet points from pasted text
function parseBulletPoints(text: string): string[] {
	const lines = text.split("\n");
	const bulletPoints: string[] = [];

	for (const line of lines) {
		const trimmedLine = line.trim();
		if (!trimmedLine) continue;

		// Remove common bullet point markers (-, *, •, numbered lists)
		const cleaned = trimmedLine
			.replace(/^[-*•]\s*/, "")
			.replace(/^\d+\.\s*/, "")
			.trim();

		if (cleaned) {
			bulletPoints.push(cleaned);
		}
	}

	return bulletPoints;
}

// Zod schemas for validation
const contactInfoSchema = z.object({
	email: z.string().email().optional(),
	phone: z.string().optional(),
	linkedin: z.string().url().optional().or(z.literal("")),
	github: z.string().url().optional().or(z.literal("")),
	website: z.string().url().optional().or(z.literal("")),
});

const workExperienceSchema = z.object({
	jobTitle: z.string().min(1),
	company: z.string().min(1),
	location: z.string().optional(),
	startDate: z.date(),
	endDate: z.date().optional().nullable(),
	isCurrent: z.boolean().default(false),
	bulletPoints: z.array(z.string()),
});

const educationSchema = z.object({
	institution: z.string().min(1),
	degree: z.string().min(1),
	fieldOfStudy: z.string().min(1),
	gpa: z.string().optional(),
	minors: z.array(z.string()).optional(),
	startDate: z.date(),
	endDate: z.date().optional().nullable(),
	isCurrent: z.boolean().default(false),
});

const projectSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1),
	technologies: z.array(z.string()),
	url: z.string().url().optional().or(z.literal("")),
	startDate: z.date().optional().nullable(),
	endDate: z.date().optional().nullable(),
});

const achievementSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	date: z.date().optional().nullable(),
	category: z.string().min(1),
});

export const portfolioRouter = createTRPCRouter({
	// Get or create user's portfolio
	getOrCreate: protectedProcedure.query(async ({ ctx }) => {
		let portfolio = await ctx.db.portfolio.findUnique({
			where: { userId: ctx.session.user.id },
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
		});

		if (!portfolio) {
			portfolio = await ctx.db.portfolio.create({
				data: {
					userId: ctx.session.user.id,
				},
				include: {
					workExperiences: true,
					educations: true,
					projects: true,
					achievements: true,
					skills: {
						include: {
							skill: true,
						},
					},
				},
			});
		}

		return portfolio;
	}),

	// Contact Information
	updateContactInfo: protectedProcedure
		.input(contactInfoSchema)
		.mutation(async ({ ctx, input }) => {
			const portfolio = await ctx.db.portfolio.findUnique({
				where: { userId: ctx.session.user.id },
			});

			if (!portfolio) {
				throw new Error("Portfolio not found");
			}

			return ctx.db.portfolio.update({
				where: { id: portfolio.id },
				data: {
					contactInfo: JSON.stringify(input),
				},
			});
		}),

	// Work Experience CRUD
	addWorkExperience: protectedProcedure
		.input(workExperienceSchema)
		.mutation(async ({ ctx, input }) => {
			const portfolio = await ctx.db.portfolio.findUnique({
				where: { userId: ctx.session.user.id },
			});

			if (!portfolio) {
				throw new Error("Portfolio not found");
			}

			return ctx.db.workExperience.create({
				data: {
					portfolioId: portfolio.id,
					...input,
					bulletPoints: JSON.stringify(input.bulletPoints),
				},
			});
		}),

	updateWorkExperience: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: workExperienceSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.workExperience.update({
				where: { id: input.id },
				data: {
					...input.data,
					bulletPoints: JSON.stringify(input.data.bulletPoints),
				},
			});
		}),

	deleteWorkExperience: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.workExperience.delete({
				where: { id: input.id },
			});
		}),

	// Parse bullet points helper
	parseWorkBulletPoints: protectedProcedure
		.input(z.object({ text: z.string() }))
		.mutation(({ input }) => {
			return parseBulletPoints(input.text);
		}),

	// Education CRUD
	addEducation: protectedProcedure
		.input(educationSchema)
		.mutation(async ({ ctx, input }) => {
			const portfolio = await ctx.db.portfolio.findUnique({
				where: { userId: ctx.session.user.id },
			});

			if (!portfolio) {
				throw new Error("Portfolio not found");
			}

			return ctx.db.education.create({
				data: {
					portfolioId: portfolio.id,
					...input,
					minors: input.minors ? JSON.stringify(input.minors) : null,
				},
			});
		}),

	updateEducation: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: educationSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.education.update({
				where: { id: input.id },
				data: {
					...input.data,
					minors: input.data.minors ? JSON.stringify(input.data.minors) : null,
				},
			});
		}),

	deleteEducation: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.education.delete({
				where: { id: input.id },
			});
		}),

	// Skills
	addSkill: protectedProcedure
		.input(
			z.object({ name: z.string().min(1), category: z.string().optional() }),
		)
		.mutation(async ({ ctx, input }) => {
			const portfolio = await ctx.db.portfolio.findUnique({
				where: { userId: ctx.session.user.id },
			});

			if (!portfolio) {
				throw new Error("Portfolio not found");
			}

			// Find or create skill
			let skill = await ctx.db.skill.findUnique({
				where: { name: input.name },
			});

			if (!skill) {
				skill = await ctx.db.skill.create({
					data: {
						name: input.name,
						category: input.category,
					},
				});
			}

			// Add to portfolio
			return ctx.db.portfolioSkill.create({
				data: {
					portfolioId: portfolio.id,
					skillId: skill.id,
				},
				include: {
					skill: true,
				},
			});
		}),

	removeSkill: protectedProcedure
		.input(z.object({ skillId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const portfolio = await ctx.db.portfolio.findUnique({
				where: { userId: ctx.session.user.id },
			});

			if (!portfolio) {
				throw new Error("Portfolio not found");
			}

			return ctx.db.portfolioSkill.deleteMany({
				where: {
					portfolioId: portfolio.id,
					skillId: input.skillId,
				},
			});
		}),

	getCommonSkills: protectedProcedure
		.input(z.object({ search: z.string().optional() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.skill.findMany({
				where: {
					isCommon: true,
					...(input.search && {
						name: {
							contains: input.search,
						},
					}),
				},
				take: 50,
			});
		}),

	// Projects CRUD
	addProject: protectedProcedure
		.input(projectSchema)
		.mutation(async ({ ctx, input }) => {
			const portfolio = await ctx.db.portfolio.findUnique({
				where: { userId: ctx.session.user.id },
			});

			if (!portfolio) {
				throw new Error("Portfolio not found");
			}

			return ctx.db.project.create({
				data: {
					portfolioId: portfolio.id,
					...input,
					technologies: JSON.stringify(input.technologies),
				},
			});
		}),

	updateProject: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: projectSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.project.update({
				where: { id: input.id },
				data: {
					...input.data,
					technologies: JSON.stringify(input.data.technologies),
				},
			});
		}),

	deleteProject: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.project.delete({
				where: { id: input.id },
			});
		}),

	// Achievements CRUD
	addAchievement: protectedProcedure
		.input(achievementSchema)
		.mutation(async ({ ctx, input }) => {
			const portfolio = await ctx.db.portfolio.findUnique({
				where: { userId: ctx.session.user.id },
			});

			if (!portfolio) {
				throw new Error("Portfolio not found");
			}

			return ctx.db.achievement.create({
				data: {
					portfolioId: portfolio.id,
					...input,
				},
			});
		}),

	updateAchievement: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: achievementSchema,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.achievement.update({
				where: { id: input.id },
				data: input.data,
			});
		}),

	deleteAchievement: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.achievement.delete({
				where: { id: input.id },
			});
		}),

	// Common Institutions
	getCommonInstitutions: protectedProcedure
		.input(
			z.object({ search: z.string().optional(), type: z.string().optional() }),
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.commonInstitution.findMany({
				where: {
					...(input.search && {
						name: {
							contains: input.search,
						},
					}),
					...(input.type && {
						type: input.type,
					}),
				},
				take: 50,
			});
		}),

	addCommonInstitution: protectedProcedure
		.input(z.object({ name: z.string().min(1), type: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.commonInstitution.create({
				data: input,
			});
		}),
});
