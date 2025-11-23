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
		const { modifiedResumeId } = requestData;
		format = requestData.format ?? "pdf";

		if (!modifiedResumeId) {
			return new Response("Modified resume ID required", { status: 400 });
		}

		if (format !== "pdf" && format !== "docx") {
			return new Response("Invalid format. Must be 'pdf' or 'docx'", {
				status: 400,
			});
		}

		// Fetch the modified resume with all relations
		const modifiedResume = await db.modifiedResume.findUnique({
			where: { id: modifiedResumeId },
			include: {
				originalResume: true,
				workExperiences: {
					orderBy: { startDate: "desc" },
				},
				educations: {
					orderBy: { startDate: "desc" },
				},
				projects: {
					orderBy: { createdAt: "desc" },
				},
				achievements: {
					orderBy: { date: "desc" },
				},
				skills: {
					orderBy: { createdAt: "asc" },
				},
			},
		});

		if (!modifiedResume) {
			return new Response("Modified resume not found", { status: 404 });
		}

		// Check authorization
		if (modifiedResume.originalResume.userId !== session.user.id) {
			return new Response("Unauthorized", { status: 403 });
		}

		// Map structured data to ResumeData format expected by PDF template
		const resumeData = {
			contactInfo: {
				name: modifiedResume.contactName || "Your Name",
				email: modifiedResume.email,
				phone: modifiedResume.phone,
				linkedin: modifiedResume.linkedin,
				github: modifiedResume.github,
				website: modifiedResume.website,
			},
			professionalSummary: modifiedResume.professionalSummary,
			workExperiences: modifiedResume.workExperiences.map((exp) => ({
				id: exp.id,
				jobTitle: exp.jobTitle,
				company: exp.company,
				location: exp.location,
				startDate: exp.startDate,
				endDate: exp.endDate,
				isCurrent: exp.isCurrent,
				bulletPoints: exp.bulletPoints,
			})),
			educations: modifiedResume.educations.map((edu) => ({
				id: edu.id,
				institution: edu.institution,
				degree: edu.degree,
				fieldOfStudy: edu.fieldOfStudy,
				gpa: edu.gpa,
				startDate: edu.startDate,
				endDate: edu.endDate,
				isCurrent: edu.isCurrent,
			})),
			skills: modifiedResume.skills.map((skill) => ({
				id: skill.id,
				name: skill.name,
				category: skill.category,
			})),
			projects: modifiedResume.projects.map((proj) => ({
				id: proj.id,
				name: proj.name,
				description: proj.description,
				bulletPoints: proj.bulletPoints,
				technologies: proj.technologies,
				url: proj.url,
			})),
			achievements: modifiedResume.achievements.map((ach) => ({
				id: ach.id,
				title: ach.title,
				description: ach.description,
				category: ach.category,
				date: ach.date,
			})),
		};

		const sanitizedName = modifiedResume.name.replace(/[^a-z0-9]/gi, "_");

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
