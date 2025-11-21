"use client";

import { Menu, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

export function LandingHeader() {
	return (
		<header className="fixed top-0 z-50 w-full border-white/10 border-b bg-slate-950/80 backdrop-blur-xl">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				{/* Logo */}
				<Link className="group flex items-center gap-3" href="/">
					<div className="relative flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-cyan-500 shadow-cyan-500/25 shadow-lg">
						<Image
							alt="TRS Logo"
							className="brightness-0 invert"
							height={24}
							src="/trs-logo.svg"
							width={24}
						/>
						<div className="absolute inset-0 rounded-xl bg-linear-to-br from-emerald-300 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
					</div>
					<div className="flex flex-col">
						<span className="bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text font-bold text-lg text-transparent leading-tight">
							TRS
						</span>
						<span className="text-slate-400 text-xs">
							Tailored Resume Solutions
						</span>
					</div>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden items-center gap-8 md:flex">
					{navLinks.map((link) => (
						<Link
							className="relative font-medium text-slate-300 text-sm transition-colors hover:text-white"
							href={link.href}
							key={link.href}
						>
							{link.label}
							<span className="-bottom-1 absolute left-0 h-0.5 w-0 bg-linear-to-r from-violet-500 to-fuchsia-500 transition-all duration-300 hover:w-full" />
						</Link>
					))}
				</nav>

				{/* Desktop Auth Buttons */}
				<div className="hidden items-center gap-3 md:flex">
					<Button
						asChild
						className="text-slate-300 hover:bg-white/5 hover:text-white"
						variant="ghost"
					>
						<Link href="/sign-in">Sign In</Link>
					</Button>
					<Button
						asChild
						className="bg-linear-to-r from-emerald-500 to-cyan-500 text-white shadow-cyan-500/25 shadow-lg transition-all duration-300 hover:from-emerald-400 hover:to-cyan-400 hover:shadow-cyan-500/40"
					>
						<Link className="flex items-center gap-2" href="/sign-in">
							<Sparkles className="size-4" />
							Get Started
						</Link>
					</Button>
				</div>

				{/* Mobile Menu */}
				<Sheet>
					<SheetTrigger asChild className="md:hidden">
						<Button
							className="text-white hover:bg-white/10"
							size="icon"
							variant="ghost"
						>
							<Menu className="size-5" />
							<span className="sr-only">Toggle menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent className="border-white/10 bg-slate-950" side="right">
						<SheetHeader>
							<SheetTitle className="flex items-center gap-3 text-white">
								<div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-cyan-500">
									<Image
										alt="TRS Logo"
										className="brightness-0 invert"
										height={24}
										src="/trs-logo.svg"
										width={24}
									/>
								</div>
								<div className="flex flex-col items-start">
									<span className="bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text font-bold text-lg text-transparent">
										TRS
									</span>
									<span className="text-slate-400 text-xs">
										Tailored Resume Solutions
									</span>
								</div>
							</SheetTitle>
						</SheetHeader>
						<nav className="mt-8 flex flex-col gap-4">
							{navLinks.map((link) => (
								<Link
									className="font-medium text-lg text-slate-300 transition-colors hover:text-white"
									href={link.href}
									key={link.href}
								>
									{link.label}
								</Link>
							))}
							<div className="mt-6 flex flex-col gap-3">
								<Button
									asChild
									className="w-full border-white/20 text-white hover:bg-white/10"
									variant="outline"
								>
									<Link href="/sign-in">Sign In</Link>
								</Button>
								<Button
									asChild
									className="w-full bg-linear-to-r from-emerald-500 to-cyan-500 text-white"
								>
									<Link className="flex items-center gap-2" href="/sign-in">
										<Sparkles className="size-4" />
										Get Started
									</Link>
								</Button>
							</div>
						</nav>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
