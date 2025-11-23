"use client";

import { Check, ChevronsUpDown } from "lucide-react";
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
import type { CachedInstitution } from "~/server/cache/institutions";

interface InstitutionComboboxProps {
	allInstitutions: CachedInstitution[];
	value?: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function InstitutionCombobox({
	allInstitutions,
	value,
	onValueChange,
	placeholder = "Select institution...",
	className,
}: InstitutionComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");

	// Filter institutions client-side - only show results after 2+ characters
	const filteredInstitutions = React.useMemo(() => {
		if (search.length < 2) return [];
		const searchLower = search.toLowerCase();
		return allInstitutions.filter((institution) =>
			institution.name.toLowerCase().includes(searchLower),
		);
	}, [allInstitutions, search]);

	const showUseCustomOption =
		search.trim().length >= 2 &&
		!allInstitutions.find((i) => i.name.toLowerCase() === search.toLowerCase());

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<Button
					aria-expanded={open}
					className={cn("w-full justify-between", className)}
					role="combobox"
					variant="outline"
				>
					<span className="capitalize">{value || placeholder}</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command shouldFilter={false}>
					<CommandInput
						onValueChange={setSearch}
						placeholder="Search institutions..."
						value={search}
					/>
					<CommandList>
						{search.length < 2 ? (
							<div className="py-6 text-center text-muted-foreground text-sm">
								Type at least 2 characters to search...
							</div>
						) : filteredInstitutions.length === 0 && !showUseCustomOption ? (
							<CommandEmpty>
								<div className="py-4 text-center">
									<p className="text-muted-foreground text-sm">
										No institutions found.
									</p>
								</div>
							</CommandEmpty>
						) : (
							<CommandGroup>
								{filteredInstitutions.map((institution) => (
									<CommandItem
										key={institution.id}
										onSelect={(currentValue) => {
											onValueChange(currentValue);
											setOpen(false);
										}}
										value={institution.name}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === institution.name
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										<span className="capitalize">{institution.name}</span>
										<span className="ml-auto text-muted-foreground text-xs">
											{institution.type}
										</span>
									</CommandItem>
								))}
								{showUseCustomOption && (
									<CommandItem
										onSelect={() => {
											onValueChange(search.trim());
											setOpen(false);
											setSearch("");
										}}
										value={search}
									>
										<Check className="mr-2 h-4 w-4 opacity-0" />
										Use "<span className="capitalize">{search.trim()}</span>"
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
