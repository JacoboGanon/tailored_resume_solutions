import {
	ArrowRight,
	Brain,
	CheckCircle2,
	Download,
	FileText,
	History,
	Layers,
	Sparkles,
	Target,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LandingHeader } from "~/components/landing-header";
import { Button } from "~/components/ui/button";
import { getSession } from "~/server/better-auth/server";

const features = [
	{
		icon: Brain,
		title: "AI-Powered Matching",
		description:
			"Our AI analyzes job descriptions and automatically tailors your resume to highlight the most relevant experience and skills.",
		gradient: "from-violet-500 to-purple-500",
		shadowColor: "shadow-violet-500/20",
	},
	{
		icon: Target,
		title: "ATS-Optimized",
		description:
			"Generate resumes that pass Applicant Tracking Systems with proper formatting and keyword optimization.",
		gradient: "from-cyan-500 to-blue-500",
		shadowColor: "shadow-cyan-500/20",
	},
	{
		icon: Download,
		title: "One-Click PDF Export",
		description:
			"Download professionally formatted PDF resumes ready to submit to any employer.",
		gradient: "from-emerald-500 to-teal-500",
		shadowColor: "shadow-emerald-500/20",
	},
	{
		icon: History,
		title: "Resume History",
		description:
			"Keep track of all your tailored resumes. Easily access and reuse previous versions for similar positions.",
		gradient: "from-orange-500 to-amber-500",
		shadowColor: "shadow-orange-500/20",
	},
];

const steps = [
	{
		step: "1",
		title: "Build Your Portfolio",
		description:
			"Enter your work experience, education, skills, and achievements once. Your portfolio becomes the foundation for all future resumes.",
		gradient: "from-violet-600 to-fuchsia-600",
	},
	{
		step: "2",
		title: "Paste Job Description",
		description:
			"Copy and paste any job description. Our AI will analyze the requirements and identify the best matches from your portfolio.",
		gradient: "from-cyan-500 to-blue-600",
	},
	{
		step: "3",
		title: "Download & Apply",
		description:
			"Review your AI-tailored resume, make any adjustments, and download a professional PDF ready for submission.",
		gradient: "from-emerald-500 to-teal-600",
	},
];

export default async function Home() {
	const session = await getSession();

	if (session) {
		redirect("/dashboard");
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-slate-950">
			{/* Animated Background */}
			<div className="pointer-events-none fixed inset-0">
				{/* Main gradient orbs */}
				<div className="-left-40 absolute top-0 size-[500px] animate-pulse rounded-full bg-violet-600/30 blur-[128px]" />
				<div className="-right-40 absolute top-1/3 size-[600px] animate-pulse rounded-full bg-fuchsia-600/20 blur-[128px] [animation-delay:1s]" />
				<div className="absolute bottom-0 left-1/3 size-[500px] animate-pulse rounded-full bg-cyan-600/20 blur-[128px] [animation-delay:2s]" />

				{/* Grid pattern */}
				<div
					className="absolute inset-0 opacity-20"
					style={{
						backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
						backgroundSize: "64px 64px",
					}}
				/>

				{/* Floating particles */}
				<div className="animation-duration-[3s] absolute top-1/4 left-1/4 size-2 animate-bounce rounded-full bg-violet-400/60 [animation-delay:0.5s]" />
				<div className="animation-duration-[4s] absolute top-1/3 right-1/4 size-1.5 animate-bounce rounded-full bg-fuchsia-400/60 [animation-delay:1s]" />
				<div className="animation-duration-[3.5s] absolute top-2/3 left-1/3 size-2 animate-bounce rounded-full bg-cyan-400/60 [animation-delay:1.5s]" />
				<div className="animation-duration-[4.5s] absolute right-1/3 bottom-1/4 size-1 animate-bounce rounded-full bg-emerald-400/60 [animation-delay:2s]" />
			</div>

			<LandingHeader />

			<main className="relative">
				{/* Hero Section */}
				<section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
					<div className="container mx-auto px-4">
						<div className="mx-auto max-w-4xl text-center">
							{/* Badge */}
							<div className="fade-in slide-in-from-bottom-4 mb-8 inline-flex animate-in items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm duration-700">
								<Sparkles className="size-4 text-violet-400" />
								<span className="bg-linear-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
									AI-Powered Resume Builder
								</span>
								<Zap className="size-3 text-amber-400" />
							</div>

							{/* Headline */}
							<h1 className="fade-in slide-in-from-bottom-4 mb-6 animate-in font-bold text-4xl tracking-tight duration-700 [animation-delay:150ms] md:text-6xl lg:text-7xl">
								<span className="text-white">Build ATS-Friendly</span>
								<br />
								<span className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
									Resumes in Minutes
								</span>
							</h1>

							{/* Subheadline */}
							<p className="fade-in slide-in-from-bottom-4 mx-auto mb-10 max-w-2xl animate-in text-lg text-slate-400 duration-700 [animation-delay:300ms] md:text-xl">
								Stop spending hours customizing your resume for each job. Let AI
								match your experience to job requirements and generate tailored,
								professional resumes instantly.
							</p>

							{/* CTA Buttons */}
							<div className="fade-in slide-in-from-bottom-4 flex animate-in flex-col justify-center gap-4 duration-700 [animation-delay:450ms] sm:flex-row">
								<Button
									asChild
									className="group relative overflow-hidden bg-linear-to-r from-violet-600 to-fuchsia-600 px-8 text-white shadow-2xl shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40"
									size="lg"
								>
									<Link href="/sign-in">
										<span className="relative z-10 flex items-center">
											Get Started Free
											<ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
										</span>
										<div className="absolute inset-0 bg-linear-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity group-hover:opacity-100" />
									</Link>
								</Button>
								<Button
									asChild
									className="border-slate-700 bg-slate-900/50 px-8 text-slate-300 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800/50 hover:text-white"
									size="lg"
									variant="outline"
								>
									<Link href="#how-it-works">See How It Works</Link>
								</Button>
							</div>

							{/* Trust indicators */}
							<div className="fade-in slide-in-from-bottom-4 mt-12 flex animate-in flex-wrap items-center justify-center gap-6 text-slate-500 text-sm duration-700 [animation-delay:600ms]">
								<div className="flex items-center gap-2">
									<CheckCircle2 className="size-4 text-emerald-500" />
									<span>No credit card required</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle2 className="size-4 text-emerald-500" />
									<span>Free to start</span>
								</div>
								<div className="flex items-center gap-2">
									<CheckCircle2 className="size-4 text-emerald-500" />
									<span>Export unlimited PDFs</span>
								</div>
							</div>
						</div>

						{/* Hero Visual */}
						<div className="fade-in slide-in-from-bottom-8 relative mx-auto mt-20 max-w-5xl animate-in duration-1000 [animation-delay:700ms]">
							<div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl shadow-violet-500/10 backdrop-blur-sm">
								{/* Browser chrome mockup */}
								<div className="mb-2 flex items-center gap-2 px-2">
									<div className="size-3 rounded-full bg-red-500/80" />
									<div className="size-3 rounded-full bg-amber-500/80" />
									<div className="size-3 rounded-full bg-emerald-500/80" />
									<div className="ml-4 flex-1 rounded-full bg-slate-800 px-4 py-1.5 text-slate-500 text-xs">
										resumeai.app/dashboard
									</div>
								</div>

								{/* App preview content */}
								<div className="relative overflow-hidden rounded-xl bg-linear-to-br from-slate-900 via-slate-900 to-slate-800">
									<div className="grid gap-6 p-6 md:grid-cols-2">
										{/* Left side - Input */}
										<div className="space-y-4">
											<div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
												<div className="mb-3 flex items-center gap-2 text-slate-400 text-sm">
													<FileText className="size-4" />
													Job Description
												</div>
												<div className="space-y-2">
													<div className="h-3 w-full rounded bg-slate-700/50" />
													<div className="h-3 w-4/5 rounded bg-slate-700/50" />
													<div className="h-3 w-3/4 rounded bg-slate-700/50" />
													<div className="h-3 w-5/6 rounded bg-slate-700/50" />
												</div>
											</div>
											<div className="flex items-center gap-3">
												<div className="flex-1 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 py-3 text-center font-medium text-sm text-white">
													<span className="flex items-center justify-center gap-2">
														<Sparkles className="size-4" />
														Generate Resume
													</span>
												</div>
											</div>
										</div>

										{/* Right side - Output preview */}
										<div className="relative rounded-lg border border-slate-700/50 bg-white/5 p-4">
											<div className="-top-2 -right-2 absolute rounded-full bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-1 font-medium text-white text-xs">
												ATS Score: 94%
											</div>
											<div className="space-y-3">
												<div className="h-5 w-1/2 rounded bg-linear-to-r from-violet-500/30 to-transparent" />
												<div className="h-3 w-3/4 rounded bg-slate-600/30" />
												<div className="my-4 h-px bg-slate-700/50" />
												<div className="h-4 w-1/3 rounded bg-cyan-500/30" />
												<div className="h-2 w-full rounded bg-slate-700/30" />
												<div className="h-2 w-5/6 rounded bg-slate-700/30" />
												<div className="h-2 w-4/5 rounded bg-slate-700/30" />
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Glow effect */}
							<div className="-inset-4 -z-10 pointer-events-none absolute rounded-3xl bg-linear-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20 blur-3xl" />
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="relative py-24" id="features">
					{/* Section divider */}
					<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-700 to-transparent" />

					<div className="container mx-auto px-4">
						<div className="mx-auto mb-16 max-w-2xl text-center">
							<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-cyan-400 text-sm">
								<Layers className="size-4" />
								Features
							</div>
							<h2 className="mb-4 font-bold text-3xl text-white tracking-tight md:text-4xl">
								Everything You Need to{" "}
								<span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
									Land Your Dream Job
								</span>
							</h2>
							<p className="text-lg text-slate-400">
								Powerful features designed to give you an edge in your job
								search.
							</p>
						</div>

						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							{features.map((feature, index) => (
								<div
									className={`group fade-in slide-in-from-bottom-4 relative animate-in overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-slate-700 hover:bg-slate-900/80 [animation-delay:${index * 100}ms]`}
									key={feature.title}
									style={{ animationDelay: `${index * 100}ms` }}
								>
									{/* Icon */}
									<div
										className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-linear-to-br ${feature.gradient} shadow-lg ${feature.shadowColor}`}
									>
										<feature.icon className="size-6 text-white" />
									</div>

									<h3 className="mb-2 font-semibold text-lg text-white">
										{feature.title}
									</h3>
									<p className="text-slate-400 text-sm leading-relaxed">
										{feature.description}
									</p>

									{/* Hover glow */}
									<div
										className={`-bottom-24 -right-24 pointer-events-none absolute size-48 rounded-full bg-linear-to-br ${feature.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
									/>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* How It Works Section */}
				<section className="relative py-24" id="how-it-works">
					{/* Section divider */}
					<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-700 to-transparent" />

					{/* Background accent */}
					<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-violet-950/20 to-transparent" />

					<div className="container relative mx-auto px-4">
						<div className="mx-auto mb-16 max-w-2xl text-center">
							<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm text-violet-400">
								<Zap className="size-4" />
								How It Works
							</div>
							<h2 className="mb-4 font-bold text-3xl text-white tracking-tight md:text-4xl">
								Three Simple Steps to{" "}
								<span className="bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
									Perfect Resumes
								</span>
							</h2>
							<p className="text-lg text-slate-400">
								Create perfectly tailored resumes in minutes, not hours.
							</p>
						</div>

						<div className="mx-auto max-w-5xl">
							<div className="relative">
								{/* Connecting line */}
								<div className="absolute top-12 left-0 hidden h-0.5 w-full bg-linear-to-r from-violet-600 via-cyan-500 to-emerald-500 lg:block" />

								<div className="grid gap-8 lg:grid-cols-3">
									{steps.map((item, index) => (
										<div
											className="fade-in slide-in-from-bottom-4 relative animate-in text-center"
											key={item.step}
											style={{ animationDelay: `${index * 150}ms` }}
										>
											{/* Step number */}
											<div className="relative mx-auto mb-6 flex size-24 items-center justify-center">
												<div
													className={`absolute inset-0 rounded-full bg-linear-to-br ${item.gradient} opacity-20 blur-xl`}
												/>
												<div
													className={`relative flex size-16 items-center justify-center rounded-full bg-linear-to-br ${item.gradient} font-bold text-2xl text-white shadow-lg`}
												>
													{item.step}
												</div>
											</div>

											<h3 className="mb-3 font-semibold text-white text-xl">
												{item.title}
											</h3>
											<p className="text-slate-400">{item.description}</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Benefits Section */}
				<section className="relative py-24">
					{/* Section divider */}
					<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-700 to-transparent" />

					<div className="container mx-auto px-4">
						<div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
							{/* Left - Benefits list */}
							<div className="fade-in slide-in-from-left-8 animate-in duration-700">
								<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-400 text-sm">
									<CheckCircle2 className="size-4" />
									Why Choose Us
								</div>
								<h2 className="mb-8 font-bold text-3xl text-white tracking-tight md:text-4xl">
									Why Job Seekers{" "}
									<span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
										Love TRS
									</span>
								</h2>
								<ul className="space-y-5">
									{[
										"Save hours on each job application",
										"Increase your interview callback rate",
										"Never miss important keywords again",
										"Professional formatting every time",
										"Keep all your resumes organized",
									].map((benefit, index) => (
										<li
											className="flex items-center gap-4"
											key={benefit}
											style={{ animationDelay: `${index * 100}ms` }}
										>
											<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-500">
												<CheckCircle2 className="size-4 text-white" />
											</div>
											<span className="text-lg text-slate-300">{benefit}</span>
										</li>
									))}
								</ul>
							</div>

							{/* Right - CTA Card */}
							<div className="fade-in slide-in-from-right-8 animate-in duration-700 [animation-delay:200ms]">
								<div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/50 p-8 shadow-2xl md:p-10">
									{/* Card glow */}
									<div className="-top-24 -right-24 pointer-events-none absolute size-48 rounded-full bg-violet-600/30 blur-3xl" />
									<div className="-bottom-24 -left-24 pointer-events-none absolute size-48 rounded-full bg-fuchsia-600/20 blur-3xl" />

									<div className="relative">
										<div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
											<FileText className="size-8 text-white" />
										</div>
										<h3 className="mb-3 font-bold text-2xl text-white md:text-3xl">
											Start Building Today
										</h3>
										<p className="mb-8 text-slate-400">
											Join thousands of job seekers who have improved their
											application success rate with AI-tailored resumes.
										</p>
										<Button
											asChild
											className="group w-full bg-linear-to-r from-violet-600 to-fuchsia-600 py-6 text-lg text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40"
										>
											<Link href="/sign-in">
												<span className="flex items-center justify-center">
													Create Your First Resume
													<ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
												</span>
											</Link>
										</Button>

										{/* Stats */}
										<div className="mt-8 grid grid-cols-3 gap-4 border-slate-800 border-t pt-8">
											<div className="text-center">
												<div className="bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text font-bold text-2xl text-transparent">
													10k+
												</div>
												<div className="text-slate-500 text-sm">Users</div>
											</div>
											<div className="text-center">
												<div className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text font-bold text-2xl text-transparent">
													50k+
												</div>
												<div className="text-slate-500 text-sm">Resumes</div>
											</div>
											<div className="text-center">
												<div className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text font-bold text-2xl text-transparent">
													94%
												</div>
												<div className="text-slate-500 text-sm">ATS Pass</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Final CTA Section */}
				<section className="relative py-24">
					{/* Section divider */}
					<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-700 to-transparent" />

					{/* Background gradient */}
					<div className="pointer-events-none absolute inset-0 bg-linear-to-t from-violet-950/30 via-transparent to-transparent" />

					<div className="container relative mx-auto px-4">
						<div className="mx-auto max-w-3xl text-center">
							<h2 className="fade-in slide-in-from-bottom-4 mb-4 animate-in font-bold text-3xl text-white tracking-tight duration-700 md:text-5xl">
								Ready to Land Your{" "}
								<span className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
									Dream Job?
								</span>
							</h2>
							<p className="fade-in slide-in-from-bottom-4 mb-10 animate-in text-lg text-slate-400 duration-700 [animation-delay:150ms]">
								Start building AI-powered resumes that get you noticed. No
								credit card required.
							</p>
							<div className="fade-in slide-in-from-bottom-4 flex animate-in flex-col justify-center gap-4 duration-700 [animation-delay:300ms] sm:flex-row">
								<Button
									asChild
									className="group relative overflow-hidden bg-linear-to-r from-violet-600 to-fuchsia-600 px-10 py-6 text-lg text-white shadow-2xl shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40"
									size="lg"
								>
									<Link href="/sign-in">
										<span className="relative z-10 flex items-center">
											Get Started Free
											<ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
										</span>
										<div className="absolute inset-0 bg-linear-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity group-hover:opacity-100" />
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="relative border-slate-800 border-t py-12">
				<div className="container mx-auto px-4">
					<div className="flex flex-col items-center justify-between gap-6 md:flex-row">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-cyan-500 shadow-cyan-500/25 shadow-lg">
								<Image
									alt="TRS Logo"
									className="brightness-0 invert"
									height={24}
									src="/trs-logo.svg"
									width={24}
								/>
							</div>
							<div className="flex flex-col">
								<span className="bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text font-bold text-lg text-transparent">
									TRS
								</span>
								<span className="text-slate-500 text-xs">
									Tailored Resume Solutions
								</span>
							</div>
						</div>
						<div className="flex items-center gap-4 text-slate-500 text-sm">
							<span>© 2025 TRS Tailored Resume Solutions</span>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
