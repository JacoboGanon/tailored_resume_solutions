import { Briefcase, FileSearch, History, LogOut, User } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ModeToggle } from "~/components/mode_toggle";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarSeparator,
	SidebarTrigger,
} from "~/components/ui/sidebar";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";

const menuItems = [
	{
		title: "Profile",
		url: "/dashboard/profile",
		icon: User,
		description: "Manage your portfolio information",
	},
	{
		title: "Job Personalization",
		url: "/dashboard/personalize",
		icon: Briefcase,
		description: "Match your resume to job descriptions",
	},
	{
		title: "ATS Analyzer",
		url: "/dashboard/ats-analyzer",
		icon: FileSearch,
		description: "Analyze resumes against ATS requirements",
	},
	{
		title: "Resume History",
		url: "/dashboard/history",
		icon: History,
		description: "View your saved resumes",
	},
];

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	if (!session) {
		redirect("/");
	}

	return (
		<SidebarProvider>
			<Sidebar collapsible="offcanvas" variant="floating">
				<SidebarHeader className="p-4">
					<Link className="flex items-center gap-3" href="/dashboard">
						<div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-cyan-500 shadow-cyan-500/25 shadow-lg">
							<Image
								alt="TRS Logo"
								className="brightness-0 invert"
								height={24}
								src="/trs-logo.svg"
								width={24}
							/>
						</div>
						<div className="flex flex-col group-data-[collapsible=icon]:hidden">
							<span className="bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text font-bold text-lg text-transparent">
								TRS
							</span>
							<span className="text-muted-foreground text-xs">
								Tailored Resume Solutions
							</span>
						</div>
					</Link>
				</SidebarHeader>
				<SidebarSeparator className="bg-linear-to-r from-transparent via-sidebar-border to-transparent" />
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							Menu
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{menuItems.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild tooltip={item.description}>
											<Link href={item.url}>
												<item.icon className="h-4 w-4" />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarSeparator className="bg-linear-to-r from-transparent via-sidebar-border to-transparent" />
				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<form>
								<SidebarMenuButton
									className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
									formAction={async () => {
										"use server";
										await auth.api.signOut({
											headers: await headers(),
										});
										redirect("/");
									}}
									type="submit"
								>
									<LogOut className="h-4 w-4" />
									<span>Sign Out</span>
								</SidebarMenuButton>
							</form>
						</SidebarMenuItem>
					</SidebarMenu>
					<div className="px-2 py-1 text-muted-foreground text-xs">
						Signed in as {session.user?.email}
					</div>
				</SidebarFooter>
			</Sidebar>
			<SidebarInset>
				<header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm">
					<SidebarTrigger />
					<div className="flex items-center gap-3">
						<div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-400 to-cyan-500 shadow-cyan-500/20 shadow-md">
							<Image
								alt="TRS Logo"
								className="brightness-0 invert"
								height={18}
								src="/trs-logo.svg"
								width={18}
							/>
						</div>
						<h1 className="font-semibold text-lg">
							<span className="bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
								TRS
							</span>{" "}
							Resume Builder
						</h1>
					</div>
					<div className="ml-auto">
						<ModeToggle />
					</div>
				</header>
				<main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
