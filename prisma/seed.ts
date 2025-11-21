import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const commonSkills = [
	// Programming Languages
	{ name: "JavaScript", category: "Programming Languages", isCommon: true },
	{ name: "TypeScript", category: "Programming Languages", isCommon: true },
	{ name: "Python", category: "Programming Languages", isCommon: true },
	{ name: "Java", category: "Programming Languages", isCommon: true },
	{ name: "C++", category: "Programming Languages", isCommon: true },
	{ name: "C#", category: "Programming Languages", isCommon: true },
	{ name: "Go", category: "Programming Languages", isCommon: true },
	{ name: "Rust", category: "Programming Languages", isCommon: true },
	{ name: "PHP", category: "Programming Languages", isCommon: true },
	{ name: "Ruby", category: "Programming Languages", isCommon: true },
	{ name: "Swift", category: "Programming Languages", isCommon: true },
	{ name: "Kotlin", category: "Programming Languages", isCommon: true },
	{ name: "SQL", category: "Programming Languages", isCommon: true },

	// Frontend Frameworks/Libraries
	{ name: "React", category: "Frontend", isCommon: true },
	{ name: "Vue.js", category: "Frontend", isCommon: true },
	{ name: "Angular", category: "Frontend", isCommon: true },
	{ name: "Next.js", category: "Frontend", isCommon: true },
	{ name: "Svelte", category: "Frontend", isCommon: true },
	{ name: "HTML", category: "Frontend", isCommon: true },
	{ name: "CSS", category: "Frontend", isCommon: true },
	{ name: "Tailwind CSS", category: "Frontend", isCommon: true },
	{ name: "Redux", category: "Frontend", isCommon: true },

	// Backend Frameworks
	{ name: "Node.js", category: "Backend", isCommon: true },
	{ name: "Express", category: "Backend", isCommon: true },
	{ name: "Django", category: "Backend", isCommon: true },
	{ name: "Flask", category: "Backend", isCommon: true },
	{ name: "Spring Boot", category: "Backend", isCommon: true },
	{ name: "FastAPI", category: "Backend", isCommon: true },
	{ name: "Ruby on Rails", category: "Backend", isCommon: true },
	{ name: "ASP.NET", category: "Backend", isCommon: true },

	// Databases
	{ name: "PostgreSQL", category: "Databases", isCommon: true },
	{ name: "MySQL", category: "Databases", isCommon: true },
	{ name: "MongoDB", category: "Databases", isCommon: true },
	{ name: "Redis", category: "Databases", isCommon: true },
	{ name: "SQLite", category: "Databases", isCommon: true },
	{ name: "Elasticsearch", category: "Databases", isCommon: true },
	{ name: "DynamoDB", category: "Databases", isCommon: true },

	// Cloud & DevOps
	{ name: "AWS", category: "Cloud", isCommon: true },
	{ name: "Azure", category: "Cloud", isCommon: true },
	{ name: "Google Cloud Platform", category: "Cloud", isCommon: true },
	{ name: "Docker", category: "DevOps", isCommon: true },
	{ name: "Kubernetes", category: "DevOps", isCommon: true },
	{ name: "CI/CD", category: "DevOps", isCommon: true },
	{ name: "Jenkins", category: "DevOps", isCommon: true },
	{ name: "GitHub Actions", category: "DevOps", isCommon: true },
	{ name: "Terraform", category: "DevOps", isCommon: true },

	// Tools & Other
	{ name: "Git", category: "Tools", isCommon: true },
	{ name: "Linux", category: "Tools", isCommon: true },
	{ name: "REST API", category: "Tools", isCommon: true },
	{ name: "GraphQL", category: "Tools", isCommon: true },
	{ name: "Microservices", category: "Architecture", isCommon: true },
	{ name: "Agile", category: "Methodology", isCommon: true },
	{ name: "Scrum", category: "Methodology", isCommon: true },
	{ name: "Test-Driven Development", category: "Methodology", isCommon: true },

	// Data Science & ML
	{ name: "Machine Learning", category: "Data Science", isCommon: true },
	{ name: "TensorFlow", category: "Data Science", isCommon: true },
	{ name: "PyTorch", category: "Data Science", isCommon: true },
	{ name: "Pandas", category: "Data Science", isCommon: true },
	{ name: "NumPy", category: "Data Science", isCommon: true },
	{ name: "Scikit-learn", category: "Data Science", isCommon: true },
];

const commonInstitutions = [
	// Top US Universities
	{ name: "Massachusetts Institute of Technology", type: "university" },
	{ name: "Stanford University", type: "university" },
	{ name: "Harvard University", type: "university" },
	{ name: "California Institute of Technology", type: "university" },
	{ name: "University of California, Berkeley", type: "university" },
	{ name: "Carnegie Mellon University", type: "university" },
	{ name: "University of Michigan", type: "university" },
	{ name: "Georgia Institute of Technology", type: "university" },
	{ name: "University of Illinois Urbana-Champaign", type: "university" },
	{ name: "Cornell University", type: "university" },
	{ name: "University of Washington", type: "university" },
	{ name: "Princeton University", type: "university" },
	{ name: "Yale University", type: "university" },
	{ name: "Columbia University", type: "university" },
	{ name: "University of Pennsylvania", type: "university" },
	{ name: "University of California, Los Angeles", type: "university" },
	{ name: "University of California, San Diego", type: "university" },
	{ name: "University of Texas at Austin", type: "university" },
	{ name: "University of Wisconsin-Madison", type: "university" },
	{ name: "New York University", type: "university" },
	{ name: "Duke University", type: "university" },
	{ name: "Northwestern University", type: "university" },
	{ name: "University of Southern California", type: "university" },
	{ name: "Brown University", type: "university" },
	{ name: "Boston University", type: "university" },

	// Coding Bootcamps
	{ name: "App Academy", type: "bootcamp" },
	{ name: "Hack Reactor", type: "bootcamp" },
	{ name: "General Assembly", type: "bootcamp" },
	{ name: "Flatiron School", type: "bootcamp" },
	{ name: "Le Wagon", type: "bootcamp" },
	{ name: "Lambda School", type: "bootcamp" },
	{ name: "Coding Dojo", type: "bootcamp" },

	// Community Colleges (examples)
	{ name: "Santa Monica College", type: "college" },
	{ name: "De Anza College", type: "college" },
	{ name: "Foothill College", type: "college" },
];

async function main() {
	console.log("Starting seed...");

	// Seed skills
	console.log("Seeding common skills...");
	for (const skill of commonSkills) {
		await prisma.skill.upsert({
			where: { name: skill.name },
			update: skill,
			create: skill,
		});
	}
	console.log(`Seeded ${commonSkills.length} skills`);

	// Seed institutions
	console.log("Seeding common institutions...");
	for (const institution of commonInstitutions) {
		await prisma.commonInstitution.upsert({
			where: { name: institution.name },
			update: institution,
			create: institution,
		});
	}
	console.log(`Seeded ${commonInstitutions.length} institutions`);

	console.log("Seed completed!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
