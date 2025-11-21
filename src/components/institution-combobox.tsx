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
import { api } from "~/trpc/react";

interface InstitutionComboboxProps {
	value?: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function InstitutionCombobox({
	value,
	onValueChange,
	placeholder = "Select institution...",
	className,
}: InstitutionComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");

	const { data: institutions } = api.portfolio.getCommonInstitutions.useQuery({
		search: search || undefined,
	});

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<Button
					aria-expanded={open}
					className={cn("w-full justify-between", className)}
					role="combobox"
					variant="outline"
				>
					{value || placeholder}
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
						<CommandEmpty>
							<div className="py-4 text-center">
								<p className="text-muted-foreground text-sm">
									No institutions found.
								</p>
								{search.trim() && (
									<Button
										className="mt-2"
										onClick={() => {
											onValueChange(search.trim());
											setOpen(false);
											setSearch("");
										}}
										size="sm"
										variant="ghost"
									>
										Use "{search.trim()}"
									</Button>
								)}
							</div>
						</CommandEmpty>
						<CommandGroup>
							{institutions?.map((institution) => (
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
											value === institution.name ? "opacity-100" : "opacity-0",
										)}
									/>
									{institution.name}
									<span className="ml-auto text-muted-foreground text-xs">
										{institution.type}
									</span>
								</CommandItem>
							))}
							{search.trim() &&
								!institutions?.find(
									(i) => i.name.toLowerCase() === search.toLowerCase(),
								) && (
									<CommandItem
										onSelect={() => {
											onValueChange(search.trim());
											setOpen(false);
											setSearch("");
										}}
										value={search}
									>
										<Check className="mr-2 h-4 w-4 opacity-0" />
										Use "{search.trim()}"
									</CommandItem>
								)}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
