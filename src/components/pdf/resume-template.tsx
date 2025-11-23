import {
	Document,
	Link,
	Page,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";

// Define styles for the PDF - Simple, ATS-friendly formatting
const styles = StyleSheet.create({
	page: {
		padding: 30,
		fontSize: 10,
		fontFamily: "Helvetica",
		lineHeight: 1.0,
	},
	name: {
		fontSize: 20,
		fontFamily: "Helvetica-Bold",
		marginBottom: 12,
		textAlign: "center",
	},
	contactInfo: {
		fontSize: 11,
		textAlign: "center",
		marginBottom: 5,
	},
	sectionTitle: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
		marginTop: 5,
		marginBottom: 3,
		borderBottomWidth: 1,
		borderBottomColor: "#000",
		paddingBottom: 1,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 1,
	},
	textBold: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
	},
	text: {
		fontSize: 11,
	},
	textItalic: {
		fontSize: 11,
		fontFamily: "Helvetica-Oblique",
	},
	textSmall: {
		fontSize: 11,
	},
	bullet: {
		fontSize: 11,
		marginLeft: 15,
		marginBottom: 1,
	},
	link: {
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

export const ResumeDocument = ({ data }: { data: ResumeData }) => {
	// Build contact info as simple string
	const contactParts: string[] = [];

	if (data.contactInfo.email) {
		contactParts.push(data.contactInfo.email);
	}
	if (data.contactInfo.phone) {
		contactParts.push(data.contactInfo.phone);
	}
	if (data.contactInfo.linkedin) {
		contactParts.push("LinkedIn");
	}
	if (data.contactInfo.github) {
		contactParts.push("Github");
	}
	if (data.contactInfo.website) {
		contactParts.push("Website");
	}

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header */}
				<View>
					<Text style={styles.name}>{data.contactInfo.name}</Text>
					<Text style={styles.contactInfo}>
						{data.contactInfo.email && <Text>{data.contactInfo.email}</Text>}
						{data.contactInfo.phone && <Text> • {data.contactInfo.phone}</Text>}
						{data.contactInfo.linkedin && (
							<Text>
								{" • "}
								<Link src={data.contactInfo.linkedin} style={styles.link}>
									LinkedIn
								</Link>
							</Text>
						)}
						{data.contactInfo.github && (
							<Text>
								{" • "}
								<Link src={data.contactInfo.github} style={styles.link}>
									Github
								</Link>
							</Text>
						)}
						{data.contactInfo.website && (
							<Text>
								{" • "}
								<Link src={data.contactInfo.website} style={styles.link}>
									Website
								</Link>
							</Text>
						)}
					</Text>
				</View>

				{/* Work Experience */}
				{data.workExperiences.length > 0 && (
					<View>
						<Text style={styles.sectionTitle}>EXPERIENCE</Text>
						{data.workExperiences.map((exp) => (
							<View key={exp.id} style={{ marginBottom: 4 }}>
								<View style={styles.row}>
									<Text style={styles.textBold}>{exp.jobTitle}</Text>
									<Text style={styles.textSmall}>
										{formatDate(exp.startDate)} -{" "}
										{formatDate(exp.endDate, exp.isCurrent)}
									</Text>
								</View>
								<Text style={styles.textItalic}>
									{exp.company}
									{exp.location && ` • ${exp.location}`}
								</Text>
								{exp.bulletPoints.map((bullet) => (
									<Text key={bullet} style={styles.bullet}>
										• {bullet}
									</Text>
								))}
							</View>
						))}
					</View>
				)}

				{/* Education */}
				{data.educations.length > 0 && (
					<View>
						<Text style={styles.sectionTitle}>EDUCATION</Text>
						{data.educations.map((edu) => (
							<View key={edu.id} style={{ marginBottom: 3 }}>
								<View style={styles.row}>
									<Text style={styles.textBold}>
										{edu.degree} in {edu.fieldOfStudy}
									</Text>
									<Text style={styles.textSmall}>
										{formatDate(edu.startDate)} -{" "}
										{formatDate(edu.endDate, edu.isCurrent)}
									</Text>
								</View>
								<Text style={styles.text}>
									{edu.institution}
									{edu.gpa && ` • GPA: ${edu.gpa}`}
								</Text>
							</View>
						))}
					</View>
				)}

				{/* Skills */}
				{data.skills.length > 0 && (
					<View>
						<Text style={styles.sectionTitle}>SKILLS</Text>
						<Text style={styles.text}>
							{data.skills.map((skill, index) => (
								<Text key={skill.id}>
									{skill.name}
									{index < data.skills.length - 1 ? " • " : ""}
								</Text>
							))}
						</Text>
					</View>
				)}

				{/* Projects */}
				{data.projects && data.projects.length > 0 && (
					<View>
						<Text style={styles.sectionTitle}>PROJECTS</Text>
						{data.projects.map((project) => (
							<View key={project.id} style={{ marginBottom: 4 }}>
								<View style={styles.row}>
									<Text style={styles.textBold}>{project.name}</Text>
									{project.url && (
										<Link src={project.url} style={styles.link}>
											<Text style={styles.textSmall}>Link</Text>
										</Link>
									)}
								</View>
								{project.technologies.length > 0 && (
									<Text style={styles.textItalic}>
										{project.technologies.join(", ")}
									</Text>
								)}
								{project.bulletPoints &&
									project.bulletPoints.length > 0 &&
									project.bulletPoints.map((bullet) => (
										<Text key={bullet} style={styles.bullet}>
											• {bullet}
										</Text>
									))}
							</View>
						))}
					</View>
				)}

				{/* Achievements */}
				{data.achievements && data.achievements.length > 0 && (
					<View>
						<Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
						{data.achievements.map((achievement) => (
							<View key={achievement.id} style={{ marginBottom: 3 }}>
								<View style={styles.row}>
									<Text style={styles.textBold}>
										{achievement.title} ({achievement.category})
									</Text>
									{achievement.date && (
										<Text style={styles.textSmall}>
											{formatDate(achievement.date)}
										</Text>
									)}
								</View>
								<Text style={styles.text}>{achievement.description}</Text>
							</View>
						))}
					</View>
				)}
			</Page>
		</Document>
	);
};
