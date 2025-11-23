import {
	calculateATSScore,
	extractJobPosting,
	extractResumeData,
	generateATSRecommendations,
} from "~/server/ai/ats-extraction";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export const maxDuration = 60; // ATS analysis can take longer

export async function POST(req: Request) {
	try {
		const session = await getSession();

		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { resumeId } = await req.json();

		if (!resumeId || typeof resumeId !== "string") {
			return new Response("Invalid resume ID", { status: 400 });
		}

		// Get resume
		const resume = await db.resume.findUnique({
			where: { id: resumeId },
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

		if (!resume || resume.userId !== session.user.id) {
			return new Response("Resume not found", { status: 404 });
		}

		if (!resume.user.portfolio) {
			return new Response("Portfolio not found", { status: 404 });
		}

		// Create a readable stream for progress updates
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				const sendProgress = (message: string) => {
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ type: "progress", message })}\n\n`,
						),
					);
				};

				try {
					sendProgress("Extracting job posting structure...");
					const extractedJob = await extractJobPosting(resume.jobDescription);

					sendProgress("Extracting resume structure...");
					const extractedResume = await extractResumeData(
						resume.user.portfolio,
					);

					sendProgress("Calculating ATS scores...");
					const scores = await calculateATSScore(extractedJob, extractedResume);

					sendProgress("Generating recommendations...");
					const { recommendations, priorityKeywords, missingSkills } =
						await generateATSRecommendations(
							extractedJob,
							extractedResume,
							scores,
						);

					sendProgress("Saving analysis...");
					const analysis = await db.aTSAnalysis.create({
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

					// Send final result
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ type: "complete", analysis })}\n\n`,
						),
					);
					controller.close();
				} catch (error) {
					console.error("Error in ATS analysis:", error);
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ type: "error", error: String(error) })}\n\n`,
						),
					);
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("Error in ATS analyze route:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
