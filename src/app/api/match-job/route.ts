import { matchJobToPortfolio } from "~/server/ai/openai";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export const maxDuration = 30;

export async function POST(req: Request) {
	try {
		const session = await getSession();

		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { jobDescription } = await req.json();

		if (!jobDescription || typeof jobDescription !== "string") {
			return new Response("Invalid job description", { status: 400 });
		}

		// Fetch user's portfolio
		const portfolio = await db.portfolio.findUnique({
			where: { userId: session.user.id },
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
			return new Response("Portfolio not found", { status: 404 });
		}

		// Call AI matching function
		const result = await matchJobToPortfolio(jobDescription, portfolio);

		// Return the stream
		return result.toTextStreamResponse();
	} catch (error) {
		console.error("Error matching job:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
