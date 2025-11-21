"use client";

import { Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { AchievementsSection } from "./_components/achievements-section";
import { ContactInfoSection } from "./_components/contact-info-section";
import { EducationSection } from "./_components/education-section";
import { ProjectsSection } from "./_components/projects-section";
import { SkillsSection } from "./_components/skills-section";
import { WorkExperienceSection } from "./_components/work-experience-section";

export default function ProfilePage() {
	const { data: portfolio, isLoading } = api.portfolio.getOrCreate.useQuery();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl">Portfolio Profile</h1>
				<p className="text-muted-foreground">
					Build your professional portfolio to create customized resumes
				</p>
			</div>

			{/* Contact Information */}
			<ContactInfoSection portfolio={portfolio} />

			{/* Work Experience */}
			<WorkExperienceSection portfolio={portfolio} />

			{/* Skills */}
			<SkillsSection portfolio={portfolio} />

			{/* Education */}
			<EducationSection portfolio={portfolio} />

			{/* Projects */}
			<ProjectsSection portfolio={portfolio} />

			{/* Achievements */}
			<AchievementsSection portfolio={portfolio} />
		</div>
	);
}
