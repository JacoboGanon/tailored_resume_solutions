"use client";

import { Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { api } from "~/trpc/react";

export default function ATSAnalyzerPage() {
	const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
	const [_optimizedResumeId, setOptimizedResumeId] = useState<string | null>(
		null,
	);

	const { data: resumeHistory, isLoading: isLoadingHistory } =
		api.resume.getResumeHistory.useQuery();

	const { data: atsAnalysis, isLoading: isLoadingAnalysis } =
		api.ats.getATSAnalysis.useQuery(
			{ resumeId: selectedResumeId ?? "" },
			{ enabled: !!selectedResumeId },
		);

	const { data: optimizedResumes } = api.ats.getModifiedResumes.useQuery(
		{ resumeId: selectedResumeId ?? undefined },
		{ enabled: !!selectedResumeId },
	);

	const { data: selectedResumeData } = api.resume.getResume.useQuery(
		{ id: selectedResumeId ?? "" },
		{ enabled: !!selectedResumeId },
	);

	const { data: portfolio } = api.portfolio.getOrCreate.useQuery();

	const utils = api.useUtils();

	const analyzeATSMutation = api.ats.analyzeResume.useMutation({
		onSuccess: () => {
			toast.success("ATS analysis completed");
			void utils.ats.getATSAnalysis.invalidate();
		},
		onError: (error) => {
			toast.error(`ATS analysis failed: ${error.message}`);
		},
	});

	const optimizeResumeMutation = api.ats.optimizeResume.useMutation({
		onSuccess: (data) => {
			setOptimizedResumeId(data.id);
			toast.success("Resume optimized successfully");
			void utils.ats.getModifiedResumes.invalidate();
		},
		onError: (error) => {
			toast.error(`Optimization failed: ${error.message}`);
		},
	});

	const handleAnalyze = () => {
		if (!selectedResumeId) {
			toast.error("Please select a resume first");
			return;
		}
		analyzeATSMutation.mutate({ resumeId: selectedResumeId });
	};

	const handleOptimize = () => {
		if (!selectedResumeId || !atsAnalysis) {
			toast.error("Please run ATS analysis first");
			return;
		}
		optimizeResumeMutation.mutate({
			resumeId: selectedResumeId,
			analysisId: atsAnalysis.id,
		});
	};

	const _selectedResume = resumeHistory?.find((r) => r.id === selectedResumeId);
	const latestOptimizedResume = optimizedResumes?.[0];

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
							}}
							value={selectedResumeId ?? ""}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a resume to analyze" />
							</SelectTrigger>
							<SelectContent>
								{resumeHistory && resumeHistory.length > 0 ? (
									resumeHistory.map((resume) => (
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
						<div className="flex gap-2">
							<Button
								disabled={analyzeATSMutation.isPending || isLoadingAnalysis}
								onClick={handleAnalyze}
							>
								{analyzeATSMutation.isPending || isLoadingAnalysis
									? "Analyzing..."
									: "Run ATS Analysis"}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* ATS Analysis Results */}
			{selectedResumeId && (
				<>
					{isLoadingAnalysis && (
						<Card>
							<CardHeader>
								<CardTitle>ATS Analysis</CardTitle>
								<CardDescription>Analyzing your resume...</CardDescription>
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
								<CardContent>
									<Button
										className="w-full"
										disabled={optimizeResumeMutation.isPending}
										onClick={handleOptimize}
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

					{latestOptimizedResume && (
						<ResumeDiffViewer
							modifications={
								(latestOptimizedResume.modifications as Array<{
									section: string;
									change: string;
									reason: string;
								}>) || []
							}
							optimizedResume={
								(latestOptimizedResume.modifiedContent as { markdown: string })
									?.markdown || ""
							}
							originalResume={generateResumeMarkdown()}
						/>
					)}
				</>
			)}
		</div>
	);
}
