"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import type { CachedSkill } from "~/server/cache/skills";

interface SkillComboboxProps {
	allSkills: CachedSkill[];
	onSkillSelect: (skillName: string, skillId?: string) => void;
	placeholder?: string;
	className?: string;
}

export function SkillCombobox({
	allSkills,
	onSkillSelect,
	placeholder = "Add a skill...",
	className,
}: SkillComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");

	// Filter skills client-side - only show results after 2+ characters
	const filteredSkills = React.useMemo(() => {
		if (search.length < 2) return [];
		const searchLower = search.toLowerCase();
		return allSkills.filter((skill) =>
			skill.name.toLowerCase().includes(searchLower)
		);
	}, [allSkills, search]);

	const handleSelect = (skillName: string) => {
		const skill = allSkills.find(
			(s) => s.name.toLowerCase() === skillName.toLowerCase()
		);
		onSkillSelect(skillName, skill?.id);
		setSearch("");
		setOpen(false);
	};

	const handleAddCustom = () => {
		if (search.trim()) {
			onSkillSelect(search.trim());
			setSearch("");
			setOpen(false);
		}
	};

	const showAddCustomOption =
		search.trim().length >= 2 &&
		!allSkills.find((s) => s.name.toLowerCase() === search.toLowerCase());

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<Button
					aria-expanded={open}
					className={cn("w-full justify-between", className)}
					role="combobox"
					variant="outline"
				>
					{placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command shouldFilter={false}>
					<CommandInput
						onValueChange={setSearch}
						placeholder="Search skills..."
						value={search}
					/>
					<CommandList>
						{search.length < 2 ? (
							<div className="py-6 text-center text-muted-foreground text-sm">
								Type at least 2 characters to search...
							</div>
						) : filteredSkills.length === 0 && !showAddCustomOption ? (
							<CommandEmpty>
								<div className="flex flex-col items-center gap-2 py-4">
									<p className="text-muted-foreground text-sm">
										No skills found.
									</p>
								</div>
							</CommandEmpty>
						) : (
							<CommandGroup>
								{filteredSkills.map((skill) => (
									<CommandItem
										key={skill.id}
										onSelect={handleSelect}
										value={skill.name}
									>
										<Check className="mr-2 h-4 w-4 opacity-0" />
										<span className="capitalize">{skill.name}</span>
										{skill.category && (
											<span className="ml-auto text-muted-foreground text-xs">
												{skill.category}
											</span>
										)}
									</CommandItem>
								))}
								{showAddCustomOption && (
									<CommandItem
										className="gap-2"
										onSelect={handleAddCustom}
										value={search}
									>
										<Plus className="h-4 w-4" />
										Add "<span className="capitalize">{search.trim()}</span>"
									</CommandItem>
								)}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
