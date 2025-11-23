"use client";

import { Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import type { CachedInstitution } from "~/server/cache/institutions";
import type { CachedSkill } from "~/server/cache/skills";
import { AchievementsSection } from "./achievements-section";
import { ContactInfoSection } from "./contact-info-section";
import { EducationSection } from "./education-section";
import { ProjectsSection } from "./projects-section";
import { SkillsSection } from "./skills-section";
import { WorkExperienceSection } from "./work-experience-section";

interface ProfileContentProps {
	allSkills: CachedSkill[];
	allInstitutions: CachedInstitution[];
}

export function ProfileContent({
	allSkills,
	allInstitutions,
}: ProfileContentProps) {
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
			<SkillsSection allSkills={allSkills} portfolio={portfolio} />

			{/* Education */}
			<EducationSection
				allInstitutions={allInstitutions}
				portfolio={portfolio}
			/>

			{/* Projects */}
			<ProjectsSection portfolio={portfolio} />

			{/* Achievements */}
			<AchievementsSection portfolio={portfolio} />
		</div>
	);
}
