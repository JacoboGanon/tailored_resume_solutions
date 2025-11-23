"use client";

import { X } from "lucide-react";
import { toast } from "sonner";
import { SkillCombobox } from "~/components/skill-combobox";
import { Badge } from "~/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import type { CachedSkill } from "~/server/cache/skills";
import { api, type RouterOutputs } from "~/trpc/react";

type portfolio = RouterOutputs["portfolio"]["getOrCreate"];

interface SkillsSectionProps {
	portfolio: portfolio | undefined;
	allSkills: CachedSkill[];
}

export function SkillsSection({ portfolio, allSkills }: SkillsSectionProps) {
	const utils = api.useUtils();

	const addSkillMutation = api.portfolio.addSkill.useMutation({
		onSuccess: () => {
			toast.success("Skill added");
			void utils.portfolio.getOrCreate.invalidate();
		},
	});

	const removeSkillMutation = api.portfolio.removeSkill.useMutation({
		onSuccess: () => {
			toast.success("Skill removed");
			void utils.portfolio.getOrCreate.invalidate();
		},
	});

	const handleAddSkill = (skillName: string) => {
		addSkillMutation.mutate({ name: skillName });
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Skills</CardTitle>
				<CardDescription>
					Your technical and professional skills
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2">
					<SkillCombobox allSkills={allSkills} onSkillSelect={handleAddSkill} />
				</div>
				{portfolio?.skills?.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground">
						No skills added yet
					</p>
				) : (
					<div className="flex flex-wrap gap-2">
						{portfolio?.skills?.map((ps) => (
							<Badge className="gap-2 capitalize" key={ps.id} variant="secondary">
								{ps.skill.name}
								<button
									className="ml-1 hover:text-destructive"
									onClick={() =>
										removeSkillMutation.mutate({ skillId: ps.skill.id })
									}
									type="button"
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
