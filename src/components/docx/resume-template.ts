import {
	AlignmentType,
	BorderStyle,
	Document,
	ExternalHyperlink,
	Paragraph,
	TextRun,
} from "docx";

export interface ResumeData {
	contactInfo: {
		name: string;
		email?: string | null;
		phone?: string | null;
		linkedin?: string | null;
		github?: string | null;
		website?: string | null;
	};
	professionalSummary?: string | null;
	workExperiences: Array<{
		id: string;
		jobTitle: string;
		company: string;
		location?: string | null;
		startDate: Date;
		endDate?: Date | null;
		isCurrent: boolean;
		bulletPoints: string[];
	}>;
	educations: Array<{
		id: string;
		institution: string;
		degree: string;
		fieldOfStudy: string;
		gpa?: string | null;
		startDate: Date;
		endDate?: Date | null;
		isCurrent: boolean;
	}>;
	skills: Array<{
		id: string;
		name: string;
		category?: string | null;
	}>;
	projects?: Array<{
		id: string;
		name: string;
		description?: string | null;
		bulletPoints: string[];
		technologies: string[];
		url?: string | null;
	}>;
	achievements?: Array<{
		id: string;
		title: string;
		description: string;
		category: string;
		date?: Date | null;
	}>;
}

const formatDate = (
	date: Date | null | undefined,
	isCurrent = false,
): string => {
	if (isCurrent) return "Present";
	if (!date) return "";
	const d = new Date(date);
	return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

// Helper function to create section header with visible border
const createSectionHeader = (
	text: string,
	spacing: { before?: number; after?: number } = { before: 200, after: 200 },
): Paragraph => {
	return new Paragraph({
		spacing,
		border: {
			bottom: {
				color: "000000",
				space: 0, // Reduce space to make border closer to text
				style: BorderStyle.SINGLE,
				size: 1,
			},
		},
		children: [
			new TextRun({
				text,
				bold: true,
				size: 24, // 12pt
				color: "000000",
			}),
		],
	});
};

export const createResumeDocument = (data: ResumeData): Document => {
	const children: Paragraph[] = [];

	// Header - Name (centered, bold, larger font)
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { after: 200 },
			children: [
				new TextRun({
					text: data.contactInfo.name,
					bold: true,
					size: 32, // 16pt
				}),
			],
		}),
	);

	// Contact Info (centered)
	const contactParts: (TextRun | ExternalHyperlink)[] = [];
	if (data.contactInfo.email) {
		contactParts.push(new TextRun(data.contactInfo.email));
	}
	if (data.contactInfo.phone) {
		if (contactParts.length > 0) contactParts.push(new TextRun(" • "));
		contactParts.push(new TextRun(data.contactInfo.phone));
	}
	if (data.contactInfo.linkedin) {
		if (contactParts.length > 0) contactParts.push(new TextRun(" • "));
		contactParts.push(
			new ExternalHyperlink({
				children: [
					new TextRun({
						text: "LinkedIn",
						style: "Hyperlink",
					}),
				],
				link: data.contactInfo.linkedin,
			}),
		);
	}
	if (data.contactInfo.github) {
		if (contactParts.length > 0) contactParts.push(new TextRun(" • "));
		contactParts.push(
			new ExternalHyperlink({
				children: [
					new TextRun({
						text: "Github",
						style: "Hyperlink",
					}),
				],
				link: data.contactInfo.github,
			}),
		);
	}
	if (data.contactInfo.website) {
		if (contactParts.length > 0) contactParts.push(new TextRun(" • "));
		contactParts.push(
			new ExternalHyperlink({
				children: [
					new TextRun({
						text: "Website",
						style: "Hyperlink",
					}),
				],
				link: data.contactInfo.website,
			}),
		);
	}

	if (contactParts.length > 0) {
		children.push(
			new Paragraph({
				children: contactParts,
				alignment: AlignmentType.CENTER,
				spacing: { after: 400 },
			}),
		);
	}

	// Determine which is the first section
	const hasProfessionalSummary = !!data.professionalSummary;
	const hasWorkExperience = data.workExperiences.length > 0;
	const hasEducation = data.educations.length > 0;
	const hasSkills = data.skills.length > 0;
	const hasProjects = !!(data.projects && data.projects.length > 0);
	const hasAchievements = !!(data.achievements && data.achievements.length > 0);

	// Professional Summary
	if (data.professionalSummary) {
		children.push(
			createSectionHeader("PROFESSIONAL SUMMARY", {
				before: hasProfessionalSummary ? 200 : 0,
				after: 200,
			}),
		);
		children.push(
			new Paragraph({
				text: data.professionalSummary,
				spacing: { after: 300 },
			}),
		);
	}

	// Work Experience
	if (data.workExperiences.length > 0) {
		children.push(
			createSectionHeader("EXPERIENCE", {
				before: !hasProfessionalSummary && hasWorkExperience ? 200 : 200,
				after: 200,
			}),
		);

		for (const exp of data.workExperiences) {
			// Job title and date on same line
			children.push(
				new Paragraph({
					children: [
						new TextRun({
							text: exp.jobTitle,
							bold: true,
							size: 20, // 10pt
						}),
						new TextRun({
							text: `\t${formatDate(exp.startDate)} - ${formatDate(exp.endDate, exp.isCurrent)}`,
							size: 20,
						}),
					],
					spacing: { after: 100 },
				}),
			);

			// Company and location
			const companyLine =
				exp.company + (exp.location ? ` • ${exp.location}` : "");
			children.push(
				new Paragraph({
					children: [
						new TextRun({
							text: companyLine,
							italics: true,
						}),
					],
					spacing: { after: 100 },
				}),
			);

			// Bullet points
			for (let i = 0; i < exp.bulletPoints.length; i++) {
				const bullet = exp.bulletPoints[i];
				const isLast = i === exp.bulletPoints.length - 1;
				children.push(
					new Paragraph({
						text: `• ${bullet}`,
						indent: { left: 567 }, // 0.5 inch
						spacing: { after: isLast ? 150 : 100 },
					}),
				);
			}
		}
	}

	// Education
	if (data.educations.length > 0) {
		children.push(
			createSectionHeader("EDUCATION", {
				before:
					!hasProfessionalSummary && !hasWorkExperience && hasEducation
						? 200
						: 200,
				after: 200,
			}),
		);

		for (const edu of data.educations) {
			// Degree and date
			children.push(
				new Paragraph({
					children: [
						new TextRun({
							text: `${edu.degree} in ${edu.fieldOfStudy}`,
							bold: true,
							size: 20, // 10pt
						}),
						new TextRun({
							text: `\t${formatDate(edu.startDate)} - ${formatDate(edu.endDate, edu.isCurrent)}`,
							size: 20,
						}),
					],
					spacing: { after: 100 },
				}),
			);

			// Institution and GPA
			const institutionLine =
				edu.institution + (edu.gpa ? ` • GPA: ${edu.gpa}` : "");
			const isLastEducation =
				edu === data.educations[data.educations.length - 1];
			children.push(
				new Paragraph({
					text: institutionLine,
					spacing: { after: isLastEducation ? 150 : 100 },
				}),
			);
		}
	}

	// Skills
	if (data.skills.length > 0) {
		children.push(
			createSectionHeader("SKILLS", {
				before:
					!hasProfessionalSummary &&
					!hasWorkExperience &&
					!hasEducation &&
					hasSkills
						? 200
						: 200,
				after: 200,
			}),
		);

		const skillsText = data.skills.map((skill) => skill.name).join(" • ");
		children.push(
			new Paragraph({
				text: skillsText,
				spacing: { after: 300 },
			}),
		);
	}

	// Projects
	if (data.projects && data.projects.length > 0) {
		children.push(
			createSectionHeader("PROJECTS", {
				before:
					!hasProfessionalSummary &&
					!hasWorkExperience &&
					!hasEducation &&
					!hasSkills &&
					hasProjects
						? 200
						: 200,
				after: 200,
			}),
		);

		for (const project of data.projects) {
			// Project name and link
			const projectNameChildren: (TextRun | ExternalHyperlink)[] = [
				new TextRun({
					text: project.name,
					bold: true,
					size: 20, // 10pt
				}),
			];

			if (project.url) {
				projectNameChildren.push(
					new TextRun("\t"),
					new ExternalHyperlink({
						children: [
							new TextRun({
								text: "Link",
								style: "Hyperlink",
								size: 20,
							}),
						],
						link: project.url,
					}),
				);
			}

			children.push(
				new Paragraph({
					children: projectNameChildren,
					spacing: { after: 100 },
				}),
			);

			// Technologies
			const isLastProject = project === data.projects[data.projects.length - 1];
			if (project.technologies.length > 0) {
				const hasBulletPoints =
					project.bulletPoints && project.bulletPoints.length > 0;
				children.push(
					new Paragraph({
						text: project.technologies.join(", "),
						children: [
							new TextRun({
								text: project.technologies.join(", "),
								italics: true,
							}),
						],
						spacing: {
							after: hasBulletPoints ? 100 : isLastProject ? 150 : 100,
						},
					}),
				);
			}

			// Bullet points
			if (project.bulletPoints && project.bulletPoints.length > 0) {
				for (let i = 0; i < project.bulletPoints.length; i++) {
					const bullet = project.bulletPoints[i];
					const isLast = i === project.bulletPoints.length - 1;
					children.push(
						new Paragraph({
							text: `• ${bullet}`,
							indent: { left: 567 }, // 0.5 inch
							spacing: { after: isLast ? (isLastProject ? 150 : 100) : 100 },
						}),
					);
				}
			}
		}
	}

	// Achievements
	if (data.achievements && data.achievements.length > 0) {
		children.push(
			createSectionHeader("ACHIEVEMENTS", {
				before:
					!hasProfessionalSummary &&
					!hasWorkExperience &&
					!hasEducation &&
					!hasSkills &&
					!hasProjects &&
					hasAchievements
						? 200
						: 200,
				after: 200,
			}),
		);

		for (const achievement of data.achievements) {
			// Title and date
			const titleChildren: TextRun[] = [
				new TextRun({
					text: `${achievement.title} (${achievement.category})`,
					bold: true,
					size: 20, // 10pt
				}),
			];

			if (achievement.date) {
				titleChildren.push(
					new TextRun({
						text: `\t${formatDate(achievement.date)}`,
						size: 20,
					}),
				);
			}

			children.push(
				new Paragraph({
					children: titleChildren,
					spacing: { after: 100 },
				}),
			);

			// Description
			const isLastAchievement =
				achievement === data.achievements[data.achievements.length - 1];
			children.push(
				new Paragraph({
					text: achievement.description,
					spacing: { after: isLastAchievement ? 150 : 100 },
				}),
			);
		}
	}

	return new Document({
		sections: [
			{
				properties: {
					page: {
						size: {
							orientation: "portrait",
							width: 11906, // A4 width in twips (8.27 inches)
							height: 16838, // A4 height in twips (11.69 inches)
						},
						margin: {
							top: 720, // 0.5 inch (1440 twips = 1 inch, so 720 = 0.5 inch)
							right: 720,
							bottom: 720,
							left: 720,
						},
					},
				},
				children,
			},
		],
	});
};
