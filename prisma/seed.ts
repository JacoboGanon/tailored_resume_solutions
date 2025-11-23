import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const commonSkills = [
	// Programming Languages
	{ name: "javascript", category: "Programming Languages", isCommon: true },
	{ name: "typescript", category: "Programming Languages", isCommon: true },
	{ name: "python", category: "Programming Languages", isCommon: true },
	{ name: "java", category: "Programming Languages", isCommon: true },
	{ name: "c++", category: "Programming Languages", isCommon: true },
	{ name: "c#", category: "Programming Languages", isCommon: true },
	{ name: "go", category: "Programming Languages", isCommon: true },
	{ name: "rust", category: "Programming Languages", isCommon: true },
	{ name: "php", category: "Programming Languages", isCommon: true },
	{ name: "ruby", category: "Programming Languages", isCommon: true },
	{ name: "swift", category: "Programming Languages", isCommon: true },
	{ name: "kotlin", category: "Programming Languages", isCommon: true },
	{ name: "sql", category: "Programming Languages", isCommon: true },

	// Frontend Frameworks/Libraries
	{ name: "react", category: "Frontend", isCommon: true },
	{ name: "vue.js", category: "Frontend", isCommon: true },
	{ name: "angular", category: "Frontend", isCommon: true },
	{ name: "next.js", category: "Frontend", isCommon: true },
	{ name: "svelte", category: "Frontend", isCommon: true },
	{ name: "html", category: "Frontend", isCommon: true },
	{ name: "css", category: "Frontend", isCommon: true },
	{ name: "tailwind css", category: "Frontend", isCommon: true },
	{ name: "redux", category: "Frontend", isCommon: true },

	// Backend Frameworks
	{ name: "node.js", category: "Backend", isCommon: true },
	{ name: "express", category: "Backend", isCommon: true },
	{ name: "django", category: "Backend", isCommon: true },
	{ name: "flask", category: "Backend", isCommon: true },
	{ name: "spring boot", category: "Backend", isCommon: true },
	{ name: "fastapi", category: "Backend", isCommon: true },
	{ name: "ruby on rails", category: "Backend", isCommon: true },
	{ name: "asp.net", category: "Backend", isCommon: true },

	// Databases
	{ name: "postgresql", category: "Databases", isCommon: true },
	{ name: "mysql", category: "Databases", isCommon: true },
	{ name: "mongodb", category: "Databases", isCommon: true },
	{ name: "redis", category: "Databases", isCommon: true },
	{ name: "sqlite", category: "Databases", isCommon: true },
	{ name: "elasticsearch", category: "Databases", isCommon: true },
	{ name: "dynamodb", category: "Databases", isCommon: true },

	// Cloud & DevOps
	{ name: "aws", category: "Cloud", isCommon: true },
	{ name: "azure", category: "Cloud", isCommon: true },
	{ name: "google cloud platform", category: "Cloud", isCommon: true },
	{ name: "docker", category: "DevOps", isCommon: true },
	{ name: "kubernetes", category: "DevOps", isCommon: true },
	{ name: "ci/cd", category: "DevOps", isCommon: true },
	{ name: "jenkins", category: "DevOps", isCommon: true },
	{ name: "github actions", category: "DevOps", isCommon: true },
	{ name: "terraform", category: "DevOps", isCommon: true },

	// Tools & Other
	{ name: "git", category: "Tools", isCommon: true },
	{ name: "linux", category: "Tools", isCommon: true },
	{ name: "rest api", category: "Tools", isCommon: true },
	{ name: "graphql", category: "Tools", isCommon: true },
	{ name: "microservices", category: "Architecture", isCommon: true },
	{ name: "agile", category: "Methodology", isCommon: true },
	{ name: "scrum", category: "Methodology", isCommon: true },
	{ name: "test-driven development", category: "Methodology", isCommon: true },

	// Data Science & ML
	{ name: "machine learning", category: "Data Science", isCommon: true },
	{ name: "tensorflow", category: "Data Science", isCommon: true },
	{ name: "pytorch", category: "Data Science", isCommon: true },
	{ name: "pandas", category: "Data Science", isCommon: true },
	{ name: "numpy", category: "Data Science", isCommon: true },
	{ name: "scikit-learn", category: "Data Science", isCommon: true },
];

const commonInstitutions = [
	// Top US Universities
	{ name: "massachusetts institute of technology", type: "university" },
	{ name: "stanford university", type: "university" },
	{ name: "harvard university", type: "university" },
	{ name: "california institute of technology", type: "university" },
	{ name: "university of california, berkeley", type: "university" },
	{ name: "carnegie mellon university", type: "university" },
	{ name: "university of michigan", type: "university" },
	{ name: "georgia institute of technology", type: "university" },
	{ name: "university of illinois urbana-champaign", type: "university" },
	{ name: "cornell university", type: "university" },
	{ name: "university of washington", type: "university" },
	{ name: "princeton university", type: "university" },
	{ name: "yale university", type: "university" },
	{ name: "columbia university", type: "university" },
	{ name: "university of pennsylvania", type: "university" },
	{ name: "university of california, los angeles", type: "university" },
	{ name: "university of california, san diego", type: "university" },
	{ name: "university of texas at austin", type: "university" },
	{ name: "university of wisconsin-madison", type: "university" },
	{ name: "new york university", type: "university" },
	{ name: "duke university", type: "university" },
	{ name: "northwestern university", type: "university" },
	{ name: "university of southern california", type: "university" },
	{ name: "brown university", type: "university" },
	{ name: "boston university", type: "university" },

	// Coding Bootcamps
	{ name: "app academy", type: "bootcamp" },
	{ name: "hack reactor", type: "bootcamp" },
	{ name: "general assembly", type: "bootcamp" },
	{ name: "flatiron school", type: "bootcamp" },
	{ name: "le wagon", type: "bootcamp" },
	{ name: "lambda school", type: "bootcamp" },
	{ name: "coding dojo", type: "bootcamp" },

	// Community Colleges (examples)
	{ name: "santa monica college", type: "college" },
	{ name: "de anza college", type: "college" },
	{ name: "foothill college", type: "college" },
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
