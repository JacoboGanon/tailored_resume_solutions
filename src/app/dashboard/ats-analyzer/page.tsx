"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Download, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	type OptimizedResume,
	optimizedResumeSchema,
} from "~/app/api/ats/optimize/utils";
import { RecommendationsList } from "~/components/ats/recommendations-list";
import { ResumeDiffViewer } from "~/components/ats/resume-diff-viewer";
import { ScoreCard } from "~/components/ats/score-card";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { formatOptimizedResumeToMarkdown } from "~/lib/resume-formatter";
import { api } from "~/trpc/react";

export default function ATSAnalyzerPage() {
	const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
	const [optimizedResumeId, setOptimizedResumeId] = useState<string | null>(
		null,
	);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysisProgress, setAnalysisProgress] = useState<string>("");
	const [shouldOptimize, setShouldOptimize] = useState(false);
	const [isRefetchingOptimized, setIsRefetchingOptimized] = useState(false);

	const { data: resumeHistory, isLoading: isLoadingHistory } =
		api.resume.getResumeHistory.useQuery();

	const { data: atsAnalysis, isLoading: isLoadingATSAnalysis } =
		api.ats.getATSAnalysis.useQuery(
			{ resumeId: selectedResumeId ?? "" },
			{ enabled: !!selectedResumeId },
		);

	const { data: optimizedResumes, refetch: refetchOptimizedResumes } =
		api.ats.getModifiedResumes.useQuery(
			{ resumeId: selectedResumeId ?? undefined },
			{ enabled: !!selectedResumeId },
		);

	// Track the count of optimized resumes before optimization starts
	const [
		optimizedResumeCountBeforeOptimize,
		setOptimizedResumeCountBeforeOptimize,
	] = useState<number>(0);

	// Filter out optimized resumes from the dropdown
	const availableResumes = resumeHistory?.filter((resume) => {
		// Exclude optimized resume entries themselves
		if ((resume as { isOptimized?: boolean }).isOptimized) {
			return false;
		}
		// Allow original resumes even if they have been previously optimized
		return true;
	});

	const { data: selectedResumeData } = api.resume.getResume.useQuery(
		{ id: selectedResumeId ?? "" },
		{ enabled: !!selectedResumeId },
	);

	const { data: portfolio } = api.portfolio.getOrCreate.useQuery();

	const utils = api.useUtils();

	// Use useObject hook for streaming optimized resume
	const {
		object: streamingOptimizedResume,
		submit: submitOptimize,
		isLoading: isOptimizing,
		error: optimizeError,
	} = useObject({
		api: "/api/ats/optimize",
		schema: optimizedResumeSchema,
		onFinish: async () => {
			// Wait for refetch to complete and verify database save succeeded
			setIsRefetchingOptimized(true);
			try {
				// Give the server-side onFinish callback time to complete the database save
				// Retry up to 3 times with increasing delays
				let newOptimizedResumes: typeof optimizedResumes | undefined;
				let retries = 0;
				const maxRetries = 3;
				const baseDelay = 500; // Start with 500ms delay

				while (retries <= maxRetries) {
					// Wait a bit before refetching to allow server-side save to complete
					if (retries > 0) {
						await new Promise((resolve) =>
							setTimeout(resolve, baseDelay * retries),
						);
					}

					const result = await refetchOptimizedResumes();
					newOptimizedResumes = result.data;
					const newCount = newOptimizedResumes?.length ?? 0;

					// If we found a new resume, success!
					if (newCount > optimizedResumeCountBeforeOptimize) {
						toast.success("Resume optimized successfully");
						break;
					}

					// If this was the last retry, show error
					if (retries === maxRetries) {
						toast.error(
							"Resume optimization completed but failed to save. Please try again.",
						);
						console.error(
							"Optimization completed but no new resume found in database after retries",
						);
					}

					retries++;
				}
			} catch (error) {
				console.error("Error refetching optimized resumes:", error);
				toast.error(
					"Failed to verify optimized resume was saved. Please refresh the page.",
				);
			} finally {
				setIsRefetchingOptimized(false);
			}
		},
		onError: (error) => {
			setIsRefetchingOptimized(false);
			toast.error(
				`Optimization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		},
	});

	const handleAnalyze = async () => {
		if (!selectedResumeId) {
			toast.error("Please select a resume first");
			return;
		}

		setIsAnalyzing(true);
		setAnalysisProgress("");
		try {
			const response = await fetch("/api/ats/analyze", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ resumeId: selectedResumeId }),
			});

			if (!response.ok) {
				throw new Error("Analysis failed");
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error("No response body");
			}

			let buffer = "";
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? ""; // Keep incomplete line in buffer

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						try {
							const data = JSON.parse(line.slice(6));
							if (data.type === "error") {
								throw new Error(data.error);
							} else if (data.type === "progress") {
								setAnalysisProgress(data.message);
							} else if (data.type === "complete") {
								toast.success("ATS analysis completed");
								setAnalysisProgress("");
								void utils.ats.getATSAnalysis.invalidate();
							}
						} catch (_e) {
							// Ignore JSON parse errors for incomplete chunks
						}
					}
				}
			}
		} catch (error) {
			toast.error(
				`ATS analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleOptimize = () => {
		if (!selectedResumeId || !atsAnalysis) {
			toast.error("Please run ATS analysis first");
			return;
		}

		// Store the current count before optimization starts
		setOptimizedResumeCountBeforeOptimize(optimizedResumes?.length ?? 0);
		setOptimizedResumeId(null);
		setShouldOptimize(true);
		submitOptimize({
			resumeId: selectedResumeId,
			analysisId: atsAnalysis.id,
		});
	};

	const handleDownloadOptimized = async () => {
		const resumeIdToDownload = optimizedResumeId ?? latestOptimizedResume?.id;
		if (!resumeIdToDownload) {
			toast.error("No optimized resume available");
			return;
		}

		try {
			const response = await fetch("/api/resume/download-modified", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ modifiedResumeId: resumeIdToDownload }),
			});

			if (!response.ok) {
				throw new Error("Download failed");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			// Extract filename from Content-Disposition header, or let browser use server-provided filename
			const contentDisposition = response.headers.get("Content-Disposition");
			if (contentDisposition) {
				const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
				if (filenameMatch?.[1]) {
					a.download = filenameMatch[1];
				}
			}
			// If no filename extracted, browser will use the one from Content-Disposition header automatically
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			toast.success("Resume downloaded successfully");
		} catch (error) {
			toast.error(
				`Download failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	};

	const _selectedResume = resumeHistory?.find((r) => r.id === selectedResumeId);
	const latestOptimizedResume = optimizedResumes?.[0];

	// Set optimizedResumeId when a cached optimized resume is loaded
	useEffect(() => {
		if (
			latestOptimizedResume &&
			optimizedResumeId !== latestOptimizedResume.id &&
			!isOptimizing
		) {
			setOptimizedResumeId(latestOptimizedResume.id);
		}
	}, [latestOptimizedResume, optimizedResumeId, isOptimizing]);

	// Reset shouldOptimize when optimization completes and refetch is done
	useEffect(() => {
		if (
			!isOptimizing &&
			!isRefetchingOptimized &&
			shouldOptimize &&
			latestOptimizedResume
		) {
			setOptimizedResumeId(latestOptimizedResume.id);
			setShouldOptimize(false);
		}
	}, [
		isOptimizing,
		isRefetchingOptimized,
		shouldOptimize,
		latestOptimizedResume,
	]);

	// Generate resume markdown from selected items
	const generateResumeMarkdown = () => {
		if (!portfolio || !selectedResumeData) return "";

		const selectedIds = selectedResumeData.selectedItemIds as {
			workExperienceIds?: string[];
			educationIds?: string[];
			projectIds?: string[];
			achievementIds?: string[];
			skillIds?: string[];
		};

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
		const selectedExps = portfolio.workExperiences.filter((exp) =>
			selectedIds.workExperienceIds?.includes(exp.id),
		);
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
		const selectedEdu = portfolio.educations.filter((edu) =>
			selectedIds.educationIds?.includes(edu.id),
		);
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
		const selectedSkills = portfolio.skills.filter((ps) =>
			selectedIds.skillIds?.includes(ps.skill.id),
		);
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
		const selectedProjs = portfolio.projects.filter((proj) =>
			selectedIds.projectIds?.includes(proj.id),
		);
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
		const selectedAchs = portfolio.achievements.filter((ach) =>
			selectedIds.achievementIds?.includes(ach.id),
		);
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
				<h1 className="font-bold text-3xl">ATS Analyzer</h1>
				<p className="text-muted-foreground">
					Analyze your saved resumes against ATS requirements and get
					optimization suggestions
				</p>
			</div>

			{/* Resume Selection */}
			<Card>
				<CardHeader>
					<CardTitle>Select Resume</CardTitle>
					<CardDescription>
						Choose a resume from your history to analyze
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{isLoadingHistory ? (
						<Skeleton className="h-10 w-full" />
					) : (
						<Select
							onValueChange={(value) => {
								setSelectedResumeId(value || null);
								setOptimizedResumeId(null);
								setShouldOptimize(false);
							}}
							value={selectedResumeId ?? ""}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a resume to analyze" />
							</SelectTrigger>
							<SelectContent>
								{availableResumes && availableResumes.length > 0 ? (
									availableResumes.map((resume) => (
										<SelectItem key={resume.id} value={resume.id}>
											{resume.name} -{" "}
											{new Date(resume.createdAt).toLocaleDateString()}
										</SelectItem>
									))
								) : (
									<SelectItem disabled value="none">
										No resumes found
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					)}

					{selectedResumeId && (
						<div className="flex flex-col gap-2">
							<Button
								disabled={isAnalyzing || isLoadingATSAnalysis}
								onClick={handleAnalyze}
							>
								{isAnalyzing ? "Analyzing..." : "Run ATS Analysis"}
							</Button>
							{analysisProgress && (
								<p className="text-muted-foreground text-sm">
									{analysisProgress}
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* ATS Analysis Results */}
			{selectedResumeId && (
				<>
					{isAnalyzing && !atsAnalysis && (
						<Card>
							<CardHeader>
								<CardTitle>ATS Analysis</CardTitle>
								<CardDescription>
									{analysisProgress || "Analyzing your resume..."}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<Skeleton className="h-32 w-full" />
								</div>
							</CardContent>
						</Card>
					)}

					{atsAnalysis && (
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
								<CardContent className="space-y-4">
									<Button
										className="w-full"
										disabled={isOptimizing}
										onClick={handleOptimize}
									>
										<Wand2 className="mr-2 h-4 w-4" />
										{isOptimizing ? "Optimizing..." : "Optimize Resume for Me"}
									</Button>
									{isOptimizing && (
										<p className="text-muted-foreground text-sm">
											Generating optimized resume...
										</p>
									)}
									{optimizeError && (
										<p className="text-destructive text-sm">
											{optimizeError.message}
										</p>
									)}
									{(optimizedResumeId || latestOptimizedResume) && (
										<Button
											className="w-full"
											onClick={handleDownloadOptimized}
											variant="outline"
										>
											<Download className="mr-2 h-4 w-4" />
											Download Optimized Resume
										</Button>
									)}
								</CardContent>
							</Card>
						</>
					)}

					{(latestOptimizedResume ||
						(isOptimizing && streamingOptimizedResume) ||
						streamingOptimizedResume ||
						isRefetchingOptimized) && (
						<ResumeDiffViewer
							isStreaming={isOptimizing || isRefetchingOptimized}
							modifications={
								// Only use modifications from database if not streaming and refetch is complete
								!isOptimizing && !isRefetchingOptimized && latestOptimizedResume
									? (latestOptimizedResume.modifications as Array<{
											section: string;
											change: string;
											reason: string;
										}>) || []
									: []
							}
							optimizedResume={
								streamingOptimizedResume
									? formatOptimizedResumeToMarkdown(
											streamingOptimizedResume as Partial<OptimizedResume>,
										)
									: (
											latestOptimizedResume?.modifiedContent as {
												markdown: string;
											}
										)?.markdown || ""
							}
							optimizedResumeObject={
								streamingOptimizedResume
									? (streamingOptimizedResume as Partial<OptimizedResume>)
									: null
							}
							originalResume={generateResumeMarkdown()}
						/>
					)}
				</>
			)}
		</div>
	);
}
