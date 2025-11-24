import type { OptimizedResume } from "~/app/api/ats/optimize/route";

/**
 * Format date string from AI response to display format
 * Handles formats: YYYY-MM-DD, YYYY-MM, YYYY, and "Present"
 */
function formatDateString(dateStr: string | null | undefined, isCurrent = false): string {
	if (isCurrent) return "Present";
	if (!dateStr || dateStr === "Present" || dateStr.trim() === "") {
		return "";
	}
	const trimmed = dateStr.trim();

	// Try YYYY-MM-DD format first (ISO format)
	const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (isoMatch) {
		const [, year, month, day] = isoMatch;
		const date = new Date(
			parseInt(year ?? "0", 10),
			parseInt(month ?? "0", 10) - 1,
			parseInt(day ?? "0", 10),
		);
		if (!Number.isNaN(date.getTime())) {
			return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
		}
	}

	// Try YYYY-MM format
	const yearMonthMatch = trimmed.match(/^(\d{4})-(\d{2})$/);
	if (yearMonthMatch) {
		const [, year, month] = yearMonthMatch;
		const date = new Date(
			parseInt(year ?? "0", 10),
			parseInt(month ?? "0", 10) - 1,
			1,
		);
		if (!Number.isNaN(date.getTime())) {
			return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
		}
	}

	// Try YYYY format
	const yearMatch = trimmed.match(/^(\d{4})$/);
	if (yearMatch) {
		const [, year] = yearMatch;
		return year ?? "";
	}

	// Return as-is if we can't parse it
	return trimmed;
}

/**
 * Convert structured OptimizedResume object to markdown format
 * Handles partial/incomplete objects gracefully (undefined fields)
 */
export function formatOptimizedResumeToMarkdown(
	resume: Partial<OptimizedResume> | null | undefined,
): string {
	if (!resume) {
		return "";
	}

	let markdown = "";

	// Header
	if (resume.contactInfo?.name) {
		markdown += `# ${resume.contactInfo.name}\n\n`;
	}

	// Contact Info
	const contactParts: string[] = [];
	if (resume.contactInfo?.email) contactParts.push(resume.contactInfo.email);
	if (resume.contactInfo?.phone) contactParts.push(resume.contactInfo.phone);
	if (resume.contactInfo?.linkedin)
		contactParts.push(`LinkedIn: ${resume.contactInfo.linkedin}`);
	if (resume.contactInfo?.github)
		contactParts.push(`GitHub: ${resume.contactInfo.github}`);
	if (resume.contactInfo?.website)
		contactParts.push(`Website: ${resume.contactInfo.website}`);
	if (contactParts.length > 0) {
		markdown += `${contactParts.join(" | ")}\n\n`;
	}

	// Professional Summary
	if (resume.professionalSummary) {
		markdown += `## Professional Summary\n\n${resume.professionalSummary}\n\n`;
	}

	// Work Experience
	if (resume.workExperiences && resume.workExperiences.length > 0) {
		markdown += "## Work Experience\n\n";
		for (const exp of resume.workExperiences) {
			if (exp.jobTitle && exp.company) {
				markdown += `### ${exp.jobTitle} at ${exp.company}\n`;
				const location = exp.location ? `${exp.location} | ` : "";
				const startDate = formatDateString(exp.startDate);
				const endDate = formatDateString(exp.endDate, exp.isCurrent);
				markdown += `${location}${startDate} - ${endDate}\n\n`;
				if (exp.bulletPoints && exp.bulletPoints.length > 0) {
					for (const bullet of exp.bulletPoints) {
						markdown += `- ${bullet}\n`;
					}
					markdown += "\n";
				}
			}
		}
	}

	// Education
	if (resume.educations && resume.educations.length > 0) {
		markdown += "## Education\n\n";
		for (const edu of resume.educations) {
			if (edu.degree && edu.fieldOfStudy && edu.institution) {
				markdown += `### ${edu.degree} in ${edu.fieldOfStudy}\n`;
				const startDate = formatDateString(edu.startDate);
				const endDate = formatDateString(edu.endDate, edu.isCurrent);
				markdown += `${edu.institution} | ${startDate} - ${endDate}\n`;
				if (edu.gpa) markdown += `GPA: ${edu.gpa}\n`;
				markdown += "\n";
			}
		}
	}

	// Skills
	if (resume.skills && resume.skills.length > 0) {
		markdown += "## Skills\n\n";
		const skillsByCategory = resume.skills.reduce(
			(acc, s) => {
				if (!s.name) return acc;
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
	if (resume.projects && resume.projects.length > 0) {
		markdown += "## Projects\n\n";
		for (const proj of resume.projects) {
			if (proj.name) {
				markdown += `### ${proj.name}\n`;
				if (proj.description) markdown += `${proj.description}\n\n`;
				if (proj.technologies && proj.technologies.length > 0) {
					markdown += `**Technologies**: ${proj.technologies.join(", ")}\n\n`;
				}
				if (proj.url) markdown += `**Link**: ${proj.url}\n\n`;
				if (proj.bulletPoints && proj.bulletPoints.length > 0) {
					for (const bullet of proj.bulletPoints) {
						markdown += `- ${bullet}\n`;
					}
					markdown += "\n";
				}
			}
		}
	}

	// Achievements
	if (resume.achievements && resume.achievements.length > 0) {
		markdown += "## Achievements\n\n";
		for (const ach of resume.achievements) {
			if (ach.title && ach.description) {
				markdown += `### ${ach.title} (${ach.category || "Achievement"})\n`;
				if (ach.date) {
					const dateStr = formatDateString(ach.date);
					if (dateStr) markdown += `${dateStr}\n\n`;
				}
				markdown += `${ach.description}\n\n`;
			}
		}
	}

	return markdown;
}

