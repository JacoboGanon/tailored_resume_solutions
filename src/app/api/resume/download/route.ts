import { renderToBuffer } from "@react-pdf/renderer";
import { Packer } from "docx";
import { createResumeDocument } from "~/components/docx/resume-template";
import { ResumeDocument } from "~/components/pdf/resume-template";
import { getSession } from "~/server/better-auth/server";
import { db } from "~/server/db";

export const maxDuration = 30;

export async function POST(req: Request) {
	let format = "pdf";
	try {
		const session = await getSession();

		if (!session) {
			return new Response("Unauthorized", { status: 401 });
		}

		const requestData = await req.json();
		const { resumeId } = requestData;
		format = requestData.format ?? "pdf";

		if (!resumeId) {
			return new Response("Resume ID required", { status: 400 });
		}

		if (format !== "pdf" && format !== "docx") {
			return new Response("Invalid format. Must be 'pdf' or 'docx'", {
				status: 400,
			});
		}

		// Fetch the resume
		const resume = await db.resume.findUnique({
			where: { id: resumeId },
		});

		if (!resume || resume.userId !== session.user.id) {
			return new Response("Resume not found", { status: 404 });
		}

		// Get selected item IDs from JSONB field
		const selectedIds = resume.selectedItemIds as {
			workExperienceIds?: string[];
			educationIds?: string[];
			projectIds?: string[];
			achievementIds?: string[];
			skillIds?: string[];
		};

		// Fetch portfolio with all data
		const portfolio = await db.portfolio.findUnique({
			where: { userId: session.user.id },
			include: {
				workExperiences: {
					where: {
						id: { in: selectedIds.workExperienceIds || [] },
					},
					orderBy: { startDate: "desc" },
				},
				educations: {
					where: {
						id: { in: selectedIds.educationIds || [] },
					},
					orderBy: { startDate: "desc" },
				},
				projects: {
					where: {
						id: { in: selectedIds.projectIds || [] },
					},
					orderBy: { startDate: "desc" },
				},
				achievements: {
					where: {
						id: { in: selectedIds.achievementIds || [] },
					},
					orderBy: { date: "desc" },
				},
				skills: {
					where: {
						skillId: { in: selectedIds.skillIds || [] },
					},
					include: {
						skill: true,
					},
				},
			},
		});

		if (!portfolio) {
			return new Response("Portfolio not found", { status: 404 });
		}

		// Prepare resume data - use profile name if available, fallback to session name
		const resumeData = {
			contactInfo: {
				name: portfolio.name || session.user.name || "Your Name",
				email: portfolio.email,
				phone: portfolio.phone,
				linkedin: portfolio.linkedin,
				github: portfolio.github,
				website: portfolio.website,
			},
			workExperiences: portfolio.workExperiences,
			educations: portfolio.educations,
			skills: portfolio.skills.map((ps) => ps.skill),
			projects: portfolio.projects,
			achievements: portfolio.achievements,
		};

		const sanitizedName = resume.name.replace(/[^a-z0-9]/gi, "_");

		if (format === "docx") {
			// Generate DOCX
			const doc = createResumeDocument(resumeData);
			const buffer = await Packer.toBuffer(doc);

			return new Response(new Uint8Array(buffer), {
				headers: {
					"Content-Type":
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					"Content-Disposition": `attachment; filename="${sanitizedName}.docx"`,
				},
			});
		}

		// Generate PDF (default)
		const pdfBuffer = await renderToBuffer(
			ResumeDocument({ data: resumeData }),
		);

		// Return PDF
		return new Response(new Uint8Array(pdfBuffer), {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${sanitizedName}.pdf"`,
			},
		});
	} catch (error) {
		console.error(`Error generating ${format}:`, error);
		return new Response("Internal server error", { status: 500 });
	}
}
