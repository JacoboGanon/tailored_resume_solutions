"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import {
	AlertCircle,
	Check,
	Download,
	Save,
	Sparkles,
	Wand2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RecommendationsList } from "~/components/ats/recommendations-list";
import { ResumeDiffViewer } from "~/components/ats/resume-diff-viewer";
import { ScoreCard } from "~/components/ats/score-card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { jobMatchSchema } from "~/server/ai/openai";
import { api } from "~/trpc/react";

export default function PersonalizePage() {
	const [jobDescription, setJobDescription] = useState("");
	const [hasAnalyzed, setHasAnalyzed] = useState(false);
	const [resumeName, setResumeName] = useState("");
	const [savedResumeId, setSavedResumeId] = useState<string | null>(null);

	const { data: portfolio } = api.portfolio.getOrCreate.useQuery();

	const { object, submit, isLoading, error } = useObject({
		api: "/api/match-job",
		schema: jobMatchSchema,
	});

	// Get ATS analysis
	const { data: atsAnalysis, refetch: refetchATSAnalysis } =
		api.ats.getATSAnalysis.useQuery(
			{ resumeId: savedResumeId ?? "" },
			{ enabled: !!savedResumeId },
		);

	// Get optimized resume
	const { data: optimizedResume } = api.ats.getModifiedResumes.useQuery(
		{ resumeId: savedResumeId ?? undefined },
		{ enabled: !!savedResumeId },
	);

	// ATS analysis mutation
	const analyzeATSMutation = api.ats.analyzeResume.useMutation({
		onSuccess: (_data) => {
			toast.success("ATS analysis completed");
			void refetchATSAnalysis();
		},
		onError: (error) => {
			toast.error(`ATS analysis failed: ${error.message}`);
		},
	});

	// Optimize resume mutation
	const optimizeResumeMutation = api.ats.optimizeResume.useMutation({
		onSuccess: (_data) => {
			toast.success("Resume optimized successfully");
		},
		onError: (error) => {
			toast.error(`Optimization failed: ${error.message}`);
		},
	});

	const saveResumeMutation = api.resume.saveResume.useMutation({
		onSuccess: (data) => {
			toast.success("Resume saved to history");
			setSavedResumeId(data.id);
			analyzeATSMutation.mutate({ resumeId: data.id });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	// Auto-fill resume name when AI generates a title
	const [hasAutoFilled, setHasAutoFilled] = useState(false);
	if (object?.resumeTitle && !hasAutoFilled && !resumeName) {
		setResumeName(object.resumeTitle);
		setHasAutoFilled(true);
	}

	const handleAnalyze = () => {
		if (!jobDescription.trim()) {
			toast.error("Please enter a job description");
			return;
		}

		setHasAnalyzed(true);
		setHasAutoFilled(false);
		submit({ jobDescription });
	};

	const handleSaveResume = () => {
		if (!object) {
			toast.error("No analysis results to save");
			return;
		}

		const name =
			resumeName.trim() || `Resume - ${new Date().toLocaleDateString()}`;

		saveResumeMutation.mutate({
			name,
			jobDescription,
			selectedItemIds: {
				workExperienceIds:
					object.workExperienceIds?.filter(
						(id): id is string => id !== undefined,
					) || [],
				educationIds:
					object.educationIds?.filter((id): id is string => id !== undefined) ||
					[],
				projectIds:
					object.projectIds?.filter((id): id is string => id !== undefined) ||
					[],
				achievementIds:
					object.achievementIds?.filter(
						(id): id is string => id !== undefined,
					) || [],
				skillIds:
					object.skillIds?.filter((id): id is string => id !== undefined) || [],
			},
		});
	};

	const handleDownload = async () => {
		if (!savedResumeId) {
			toast.error("Please save the resume first");
			return;
		}

		try {
			const response = await fetch("/api/resume/download", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ resumeId: savedResumeId }),
			});

			if (!response.ok) {
				throw new Error("Failed to download PDF");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `resume_${Date.now()}.pdf`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			toast.success("Resume downloaded");
		} catch (error) {
			toast.error("Failed to download resume");
			console.error(error);
		}
	};

	const getSelectedWorkExperiences = () => {
		if (!object?.workExperienceIds || !portfolio?.workExperiences) return [];
		return portfolio.workExperiences.filter(
			(exp) => object.workExperienceIds?.includes(exp.id) || false,
		);
	};

	const getSelectedEducations = () => {
		if (!object?.educationIds || !portfolio?.educations) return [];
		return portfolio.educations.filter(
			(edu) => object.educationIds?.includes(edu.id) || false,
		);
	};

	const getSelectedProjects = () => {
		if (!object?.projectIds || !portfolio?.projects) return [];
		return portfolio.projects.filter(
			(proj) => object.projectIds?.includes(proj.id) || false,
		);
	};

	const getSelectedSkills = () => {
		if (!object?.skillIds || !portfolio?.skills) return [];
		return portfolio.skills.filter(
			(ps) => object.skillIds?.includes(ps.skill.id) || false,
		);
	};

	const getSelectedAchievements = () => {
		if (!object?.achievementIds || !portfolio?.achievements) return [];
		return portfolio.achievements.filter(
			(ach) => object.achievementIds?.includes(ach.id) || false,
		);
	};

	// Generate resume markdown from selected items
	const generateResumeMarkdown = () => {
		if (!portfolio || !object) return "";

		const formatDate = (date: Date | null | undefined, isCurrent = false) => {
			if (isCurrent) return "Present";
			if (!date) return "";
			const d = new Date(date);
			return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
		};

		let markdown = "";

		// Header
		if (portfolio.name) {
			markdown += `# ${portfolio.name}\n\n`;
		}

		// Contact Info
		const contactParts: string[] = [];
		if (portfolio.email) contactParts.push(portfolio.email);
		if (portfolio.phone) contactParts.push(portfolio.phone);
		if (portfolio.linkedin)
			contactParts.push(`LinkedIn: ${portfolio.linkedin}`);
		if (portfolio.github) contactParts.push(`GitHub: ${portfolio.github}`);
		if (portfolio.website) contactParts.push(`Website: ${portfolio.website}`);
		if (contactParts.length > 0) {
			markdown += `${contactParts.join(" | ")}\n\n`;
		}

		// Work Experience
		const selectedExps = getSelectedWorkExperiences();
		if (selectedExps.length > 0) {
			markdown += "## Work Experience\n\n";
			for (const exp of selectedExps) {
				markdown += `### ${exp.jobTitle} at ${exp.company}\n`;
				markdown += `${exp.location || ""} | ${formatDate(exp.startDate)} - ${formatDate(exp.endDate, exp.isCurrent)}\n\n`;
				for (const bullet of exp.bulletPoints) {
					markdown += `- ${bullet}\n`;
				}
				markdown += "\n";
			}
		}

		// Education
		const selectedEdu = getSelectedEducations();
		if (selectedEdu.length > 0) {
			markdown += "## Education\n\n";
			for (const edu of selectedEdu) {
				markdown += `### ${edu.degree} in ${edu.fieldOfStudy}\n`;
				markdown += `${edu.institution} | ${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}\n`;
				if (edu.gpa) markdown += `GPA: ${edu.gpa}\n`;
				markdown += "\n";
			}
		}

		// Skills
		const selectedSkills = getSelectedSkills();
		if (selectedSkills.length > 0) {
			markdown += "## Skills\n\n";
			const skillsByCategory = selectedSkills.reduce(
				(acc, s) => {
					const category = s.skill.category || "Other";
					if (!acc[category]) acc[category] = [];
					acc[category].push(s.skill.name);
					return acc;
				},
				{} as Record<string, string[]>,
			);
			for (const [category, skills] of Object.entries(skillsByCategory)) {
				markdown += `**${category}**: ${skills.join(", ")}\n\n`;
			}
		}

		// Projects
		const selectedProjs = getSelectedProjects();
		if (selectedProjs.length > 0) {
			markdown += "## Projects\n\n";
			for (const proj of selectedProjs) {
				markdown += `### ${proj.name}\n`;
				if (proj.description) markdown += `${proj.description}\n\n`;
				if (proj.technologies.length > 0) {
					markdown += `**Technologies**: ${proj.technologies.join(", ")}\n\n`;
				}
				if (proj.url) markdown += `**Link**: ${proj.url}\n\n`;
				for (const bullet of proj.bulletPoints) {
					markdown += `- ${bullet}\n`;
				}
				markdown += "\n";
			}
		}

		// Achievements
		const selectedAchs = getSelectedAchievements();
		if (selectedAchs.length > 0) {
			markdown += "## Achievements\n\n";
			for (const ach of selectedAchs) {
				markdown += `### ${ach.title} (${ach.category})\n`;
				if (ach.date) markdown += `${formatDate(ach.date)}\n\n`;
				markdown += `${ach.description}\n\n`;
			}
		}

		return markdown;
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl">Job Personalization</h1>
				<p className="text-muted-foreground">
					Match your portfolio to specific job descriptions using AI
				</p>
			</div>

			{/* Job Description Input */}
			<Card>
				<CardHeader>
					<CardTitle>Job Description</CardTitle>
					<CardDescription>
						Paste the job description you want to tailor your resume for
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="job-description">Job Posting</Label>
						<Textarea
							className="font-mono text-sm"
							id="job-description"
							onChange={(e) => setJobDescription(e.target.value)}
							placeholder="Paste the full job description here including requirements, responsibilities, and qualifications..."
							rows={12}
							value={jobDescription}
						/>
					</div>
					<Button
						className="w-full"
						disabled={isLoading || !jobDescription.trim()}
						onClick={handleAnalyze}
					>
						{isLoading ? (
							<>
								<Sparkles className="mr-2 h-4 w-4 animate-spin" />
								Analyzing...
							</>
						) : (
							<>
								<Sparkles className="mr-2 h-4 w-4" />
								Analyze & Match
							</>
						)}
					</Button>
					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Error analyzing job: {error.message}
							</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>

			{/* Results */}
			{(isLoading || hasAnalyzed) && (
				<>
					{/* AI Reasoning */}
					{object?.reasoning && (
						<Card>
							<CardHeader>
								<CardTitle>AI Analysis</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-sm">
									{object.reasoning}
								</p>
							</CardContent>
						</Card>
					)}

					{/* Selected Work Experiences */}
					<Card>
						<CardHeader>
							<CardTitle>Selected Work Experiences</CardTitle>
							<CardDescription>
								Experiences that best match this job
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading && !object?.workExperienceIds ? (
								<div className="space-y-2">
									<Skeleton className="h-20 w-full" />
									<Skeleton className="h-20 w-full" />
								</div>
							) : getSelectedWorkExperiences().length === 0 ? (
								<p className="py-4 text-center text-muted-foreground text-sm">
									No work experiences selected
								</p>
							) : (
								<div className="space-y-3">
									{getSelectedWorkExperiences().map((exp) => {
										return (
											<div className="rounded-lg border p-4" key={exp.id}>
												<div className="flex items-start justify-between">
													<div>
														<h4 className="flex items-center gap-2 font-semibold">
															{exp.jobTitle}
															<Check className="h-4 w-4 text-green-600" />
														</h4>
														<p className="text-muted-foreground text-sm">
															{exp.company} • {exp.location}
														</p>
														<p className="mt-1 text-muted-foreground text-xs">
															{new Date(exp.startDate).toLocaleDateString(
																"en-US",
																{ month: "short", year: "numeric" },
															)}{" "}
															-{" "}
															{exp.isCurrent
																? "Present"
																: new Date(
																		exp.endDate || new Date(),
																	).toLocaleDateString("en-US", {
																		month: "short",
																		year: "numeric",
																	})}
														</p>
														<ul className="mt-2 space-y-1 text-sm">
															{exp.bulletPoints
																.slice(0, 2)
																.map((bullet: string) => (
																	<li
																		className="text-muted-foreground"
																		key={bullet}
																	>
																		• {bullet}
																	</li>
																))}
															{exp.bulletPoints.length > 2 && (
																<li className="text-muted-foreground text-xs">
																	+ {exp.bulletPoints.length - 2} more
																</li>
															)}
														</ul>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Selected Education */}
					<Card>
						<CardHeader>
							<CardTitle>Selected Education</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoading && !object?.educationIds ? (
								<Skeleton className="h-16 w-full" />
							) : getSelectedEducations().length === 0 ? (
								<p className="py-4 text-center text-muted-foreground text-sm">
									No education selected
								</p>
							) : (
								<div className="space-y-3">
									{getSelectedEducations().map((edu) => (
										<div className="rounded-lg border p-3" key={edu.id}>
											<h4 className="flex items-center gap-2 font-semibold">
												{edu.degree} in {edu.fieldOfStudy}
												<Check className="h-4 w-4 text-green-600" />
											</h4>
											<p className="text-muted-foreground text-sm">
												{edu.institution}
											</p>
											{edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Selected Skills */}
					<Card>
						<CardHeader>
							<CardTitle>Selected Skills</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoading && !object?.skillIds ? (
								<div className="flex flex-wrap gap-2">
									<Skeleton className="h-6 w-20" />
									<Skeleton className="h-6 w-24" />
									<Skeleton className="h-6 w-16" />
								</div>
							) : getSelectedSkills().length === 0 ? (
								<p className="py-4 text-center text-muted-foreground text-sm">
									No skills selected
								</p>
							) : (
								<div className="flex flex-wrap gap-2">
									{getSelectedSkills().map((ps) => (
										<Badge className="gap-1" key={ps.id} variant="secondary">
											<Check className="h-3 w-3 text-green-600" />
											{ps.skill.name}
										</Badge>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Selected Projects */}
					{getSelectedProjects().length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Selected Projects</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{getSelectedProjects().map((proj) => {
										return (
											<div className="rounded-lg border p-3" key={proj.id}>
												<h4 className="flex items-center gap-2 font-semibold">
													{proj.name}
													<Check className="h-4 w-4 text-green-600" />
												</h4>
												<p className="mt-1 text-muted-foreground text-sm">
													{proj.description}
												</p>
												<div className="mt-2 flex flex-wrap gap-1">
													{proj.technologies.map((tech: string) => (
														<Badge
															className="text-xs"
															key={tech}
															variant="outline"
														>
															{tech}
														</Badge>
													))}
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Selected Achievements */}
					{getSelectedAchievements().length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Selected Achievements</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{getSelectedAchievements().map((ach) => (
										<div className="rounded-lg border p-3" key={ach.id}>
											<div className="flex items-center gap-2">
												<h4 className="font-semibold">{ach.title}</h4>
												<Badge className="text-xs" variant="secondary">
													{ach.category}
												</Badge>
												<Check className="ml-auto h-4 w-4 text-green-600" />
											</div>
											<p className="mt-1 text-muted-foreground text-sm">
												{ach.description}
											</p>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Actions */}
					{object && !isLoading && (
						<Card>
							<CardHeader>
								<CardTitle>Save Resume</CardTitle>
								<CardDescription>
									Save this customized resume to your history
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="resume-name">
										Resume Name{" "}
										{object.resumeTitle && (
											<span className="font-normal text-muted-foreground text-xs">
												(AI-generated, editable)
											</span>
										)}
									</Label>
									<input
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
										id="resume-name"
										onChange={(e) => setResumeName(e.target.value)}
										placeholder="e.g., Software Engineer at TechCorp"
										type="text"
										value={resumeName}
									/>
									{object.resumeTitle && resumeName === object.resumeTitle && (
										<p className="text-muted-foreground text-xs">
											✨ This name was auto-generated based on the job
											description
										</p>
									)}
								</div>
								<div className="flex gap-2">
									<Button
										className="flex-1"
										disabled={saveResumeMutation.isPending}
										onClick={handleSaveResume}
									>
										<Save className="mr-2 h-4 w-4" />
										{saveResumeMutation.isPending
											? "Saving..."
											: "Save to History"}
									</Button>
									<Button
										className="flex-1"
										disabled={!savedResumeId}
										onClick={handleDownload}
										variant="outline"
									>
										<Download className="mr-2 h-4 w-4" />
										Download PDF
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* ATS Analysis Section */}
					{savedResumeId && (
						<>
							{analyzeATSMutation.isPending && (
								<Card>
									<CardHeader>
										<CardTitle>ATS Analysis</CardTitle>
										<CardDescription>
											Analyzing your resume against ATS requirements...
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<Skeleton className="h-32 w-full" />
										</div>
									</CardContent>
								</Card>
							)}

							{atsAnalysis && !analyzeATSMutation.isPending && (
								<>
									<ScoreCard
										cosineSimilarity={atsAnalysis.cosineSimilarity}
										experienceRelevance={atsAnalysis.experienceRelevance}
										keywordMatchPercent={atsAnalysis.keywordMatchPercent}
										overallScore={atsAnalysis.overallScore}
										skillOverlapPercent={atsAnalysis.skillOverlapPercent}
									/>

									<RecommendationsList
										missingSkills={atsAnalysis.missingSkills}
										priorityKeywords={atsAnalysis.priorityKeywords}
										recommendations={
											(atsAnalysis.recommendations as Array<{
												category: string;
												suggestion: string;
												priority: "high" | "medium" | "low";
											}>) || []
										}
									/>

									<Card>
										<CardHeader>
											<CardTitle>Optimize Resume</CardTitle>
											<CardDescription>
												Use AI to automatically improve your resume based on ATS
												recommendations
											</CardDescription>
										</CardHeader>
										<CardContent>
											<Button
												className="w-full"
												disabled={optimizeResumeMutation.isPending}
												onClick={() => {
													optimizeResumeMutation.mutate({
														resumeId: savedResumeId,
														analysisId: atsAnalysis.id,
													});
												}}
											>
												<Wand2 className="mr-2 h-4 w-4" />
												{optimizeResumeMutation.isPending
													? "Optimizing..."
													: "Optimize Resume for Me"}
											</Button>
										</CardContent>
									</Card>
								</>
							)}

							{optimizedResume && optimizedResume.length > 0 && (
								<ResumeDiffViewer
									modifications={
										(optimizedResume[0]?.modifications as Array<{
											section: string;
											change: string;
											reason: string;
										}>) || []
									}
									optimizedResume={
										(
											optimizedResume[0]?.modifiedContent as {
												markdown: string;
											}
										)?.markdown || ""
									}
									originalResume={generateResumeMarkdown()}
								/>
							)}
						</>
					)}
				</>
			)}
		</div>
	);
}
