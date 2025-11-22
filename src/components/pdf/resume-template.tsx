import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// Define styles for the PDF
const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontSize: 10,
		fontFamily: "Helvetica",
		lineHeight: 1.5,
	},
	header: {
		marginBottom: 20,
	},
	name: {
		fontSize: 24,
		fontFamily: "Helvetica-Bold",
		marginBottom: 5,
	},
	contactInfo: {
		fontSize: 9,
		color: "#333",
		marginBottom: 3,
	},
	section: {
		marginBottom: 15,
	},
	sectionTitle: {
		fontSize: 12,
		fontFamily: "Helvetica-Bold",
		marginBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#000",
		paddingBottom: 2,
	},
	experienceItem: {
		marginBottom: 10,
	},
	experienceHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 3,
	},
	jobTitle: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
	},
	company: {
		fontSize: 10,
		fontFamily: "Helvetica-Oblique",
	},
	location: {
		fontSize: 9,
		color: "#555",
	},
	dates: {
		fontSize: 9,
		color: "#555",
	},
	bulletPoints: {
		marginTop: 3,
		marginLeft: 15,
	},
	bullet: {
		fontSize: 10,
		marginBottom: 2,
		flexDirection: "row",
	},
	bulletSymbol: {
		width: 10,
	},
	bulletText: {
		flex: 1,
	},
	skillsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 5,
	},
	skill: {
		fontSize: 10,
		marginRight: 8,
		marginBottom: 4,
	},
	educationItem: {
		marginBottom: 8,
	},
	degree: {
		fontSize: 10,
		fontFamily: "Helvetica-Bold",
	},
	institution: {
		fontSize: 10,
	},
	projectItem: {
		marginBottom: 8,
	},
	projectName: {
		fontSize: 10,
		fontFamily: "Helvetica-Bold",
	},
	projectDescription: {
		fontSize: 9,
		marginTop: 2,
	},
	projectTech: {
		fontSize: 9,
		fontFamily: "Helvetica-Oblique",
		marginTop: 2,
		color: "#555",
	},
	achievementItem: {
		marginBottom: 6,
	},
	achievementTitle: {
		fontSize: 10,
		fontFamily: "Helvetica-Bold",
	},
});

interface ResumeData {
	contactInfo: {
		name: string;
		email?: string | null;
		phone?: string | null;
		linkedin?: string | null;
		github?: string | null;
		website?: string | null;
	};
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
		description: string;
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

export const ResumeDocument = ({ data }: { data: ResumeData }) => (
	<Document>
		<Page size="A4" style={styles.page}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.name}>{data.contactInfo.name}</Text>
				{data.contactInfo.email && (
					<Text style={styles.contactInfo}>{data.contactInfo.email}</Text>
				)}
				{data.contactInfo.phone && (
					<Text style={styles.contactInfo}>{data.contactInfo.phone}</Text>
				)}
				<View style={{ flexDirection: "row", gap: 10 }}>
					{data.contactInfo.linkedin && (
						<Text style={styles.contactInfo}>{data.contactInfo.linkedin}</Text>
					)}
					{data.contactInfo.github && (
						<Text style={styles.contactInfo}>{data.contactInfo.github}</Text>
					)}
					{data.contactInfo.website && (
						<Text style={styles.contactInfo}>{data.contactInfo.website}</Text>
					)}
				</View>
			</View>

			{/* Work Experience */}
			{data.workExperiences.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>EXPERIENCE</Text>
					{data.workExperiences.map((exp) => (
						<View key={exp.id} style={styles.experienceItem}>
							<View style={styles.experienceHeader}>
								<View style={{ flex: 1 }}>
									<Text style={styles.jobTitle}>{exp.jobTitle}</Text>
									<Text style={styles.company}>
										{exp.company}
										{exp.location && ` • ${exp.location}`}
									</Text>
								</View>
								<Text style={styles.dates}>
									{formatDate(exp.startDate)} -{" "}
									{formatDate(exp.endDate, exp.isCurrent)}
								</Text>
							</View>
							<View style={styles.bulletPoints}>
								{exp.bulletPoints.map((bullet) => (
									<View key={bullet} style={styles.bullet}>
										<Text style={styles.bulletSymbol}>•</Text>
										<Text style={styles.bulletText}>{bullet}</Text>
									</View>
								))}
							</View>
						</View>
					))}
				</View>
			)}

			{/* Education */}
			{data.educations.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>EDUCATION</Text>
					{data.educations.map((edu) => (
						<View key={edu.id} style={styles.educationItem}>
							<View style={styles.experienceHeader}>
								<View style={{ flex: 1 }}>
									<Text style={styles.degree}>
										{edu.degree} in {edu.fieldOfStudy}
									</Text>
									<Text style={styles.institution}>{edu.institution}</Text>
								</View>
								<View>
									<Text style={styles.dates}>
										{formatDate(edu.startDate)} -{" "}
										{formatDate(edu.endDate, edu.isCurrent)}
									</Text>
									{edu.gpa && <Text style={styles.dates}>GPA: {edu.gpa}</Text>}
								</View>
							</View>
						</View>
					))}
				</View>
			)}

			{/* Skills */}
			{data.skills.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>SKILLS</Text>
					<View style={styles.skillsContainer}>
						{data.skills.map((skill, index) => (
							<Text key={skill.id} style={styles.skill}>
								{skill.name}
								{index < data.skills.length - 1 ? " •" : ""}
							</Text>
						))}
					</View>
				</View>
			)}

			{/* Projects */}
			{data.projects && data.projects.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>PROJECTS</Text>
					{data.projects.map((project) => (
						<View key={project.id} style={styles.projectItem}>
							<Text style={styles.projectName}>{project.name}</Text>
							<Text style={styles.projectDescription}>
								{project.description}
							</Text>
							<Text style={styles.projectTech}>
								Technologies: {project.technologies.join(", ")}
							</Text>
							{project.url && (
								<Text style={styles.projectTech}>{project.url}</Text>
							)}
						</View>
					))}
				</View>
			)}

			{/* Achievements */}
			{data.achievements && data.achievements.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
					{data.achievements.map((achievement) => (
						<View key={achievement.id} style={styles.achievementItem}>
							<Text style={styles.achievementTitle}>
								{achievement.title} ({achievement.category})
							</Text>
							<Text style={styles.projectDescription}>
								{achievement.description}
							</Text>
							{achievement.date && (
								<Text style={styles.dates}>{formatDate(achievement.date)}</Text>
							)}
						</View>
					))}
				</View>
			)}
		</Page>
	</Document>
);
