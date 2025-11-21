"use client";

import { FileText, Menu } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "~/components/mode_toggle";
import { Button } from "~/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";

const navLinks = [
	{ href: "#features", label: "Features" },
	{ href: "#how-it-works", label: "How It Works" },
];

export function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				{/* Logo */}
				<Link className="flex items-center gap-2" href="/">
					<FileText className="size-6 text-primary" />
					<span className="font-bold text-xl">ResumeAI</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden items-center gap-6 md:flex">
					{navLinks.map((link) => (
						<Link
							className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
							href={link.href}
							key={link.href}
						>
							{link.label}
						</Link>
					))}
				</nav>

				{/* Desktop Auth Buttons */}
				<div className="hidden items-center gap-3 md:flex">
					<Button asChild variant="ghost">
						<Link href="/sign-in">Sign In</Link>
					</Button>
					<Button asChild>
						<Link href="/sign-in">Get Started</Link>
					</Button>
					<ModeToggle />
				</div>

				{/* Mobile Menu */}
				<Sheet>
					<SheetTrigger asChild className="md:hidden">
						<Button size="icon" variant="ghost">
							<Menu className="size-5" />
							<span className="sr-only">Toggle menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="right">
						<SheetHeader>
							<SheetTitle className="flex items-center gap-2">
								<FileText className="size-5 text-primary" />
								ResumeAI
							</SheetTitle>
						</SheetHeader>
						<nav className="mt-6 flex flex-col gap-4">
							{navLinks.map((link) => (
								<Link
									className="font-medium text-lg text-muted-foreground transition-colors hover:text-foreground"
									href={link.href}
									key={link.href}
								>
									{link.label}
								</Link>
							))}
							<div className="mt-4 flex flex-col gap-3">
								<Button asChild className="w-full" variant="outline">
									<Link href="/sign-in">Sign In</Link>
								</Button>
								<Button asChild className="w-full">
									<Link href="/sign-in">Get Started</Link>
								</Button>
								<div className="flex justify-center pt-2">
									<ModeToggle />
								</div>
							</div>
						</nav>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
