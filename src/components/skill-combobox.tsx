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
import { api } from "~/trpc/react";

interface SkillComboboxProps {
	onSkillSelect: (skillName: string, skillId?: string) => void;
	placeholder?: string;
	className?: string;
}

export function SkillCombobox({
	onSkillSelect,
	placeholder = "Add a skill...",
	className,
}: SkillComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");

	const { data: commonSkills } = api.portfolio.getCommonSkills.useQuery({
		search: search || undefined,
	});

	const handleSelect = (skillName: string) => {
		const skill = commonSkills?.find((s) => s.name === skillName);
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
						<CommandEmpty>
							<div className="flex flex-col items-center gap-2 py-4">
								<p className="text-muted-foreground text-sm">
									No skills found.
								</p>
								{search.trim() && (
									<Button className="gap-2" onClick={handleAddCustom} size="sm">
										<Plus className="h-4 w-4" />
										Add "{search.trim()}"
									</Button>
								)}
							</div>
						</CommandEmpty>
						<CommandGroup>
							{commonSkills?.map((skill) => (
								<CommandItem
									key={skill.id}
									onSelect={handleSelect}
									value={skill.name}
								>
									<Check className="mr-2 h-4 w-4 opacity-0" />
									{skill.name}
									{skill.category && (
										<span className="ml-auto text-muted-foreground text-xs">
											{skill.category}
										</span>
									)}
								</CommandItem>
							))}
							{search.trim() &&
								!commonSkills?.find(
									(s) => s.name.toLowerCase() === search.toLowerCase(),
								) && (
									<CommandItem
										className="gap-2"
										onSelect={handleAddCustom}
										value={search}
									>
										<Plus className="h-4 w-4" />
										Add "{search.trim()}"
									</CommandItem>
								)}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
