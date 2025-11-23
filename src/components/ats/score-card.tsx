"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

interface ScoreCardProps {
	overallScore: number;
	cosineSimilarity: number;
	keywordMatchPercent: number;
	skillOverlapPercent: number;
	experienceRelevance: number;
}

export function ScoreCard({
	overallScore,
	cosineSimilarity,
	keywordMatchPercent,
	skillOverlapPercent,
	experienceRelevance,
}: ScoreCardProps) {
	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-green-600";
		if (score >= 60) return "text-yellow-600";
		return "text-red-600";
	};

	const getScoreLabel = (score: number) => {
		if (score >= 80) return "Excellent";
		if (score >= 60) return "Good";
		if (score >= 40) return "Fair";
		return "Needs Improvement";
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>ATS Score</CardTitle>
				<CardDescription>
					Overall compatibility score with the job posting
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Overall Score */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="font-semibold text-sm">Overall Score</span>
						<span
							className={`font-bold text-2xl ${getScoreColor(overallScore)}`}
						>
							{Math.round(overallScore)}%
						</span>
					</div>
					<Progress className="h-3" value={overallScore} />
					<p className={`text-sm ${getScoreColor(overallScore)}`}>
						{getScoreLabel(overallScore)}
					</p>
				</div>

				{/* Detailed Metrics */}
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm">Keyword Match</span>
							<span className="font-medium text-sm">
								{Math.round(keywordMatchPercent)}%
							</span>
						</div>
						<Progress className="h-2" value={keywordMatchPercent} />
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm">Skill Overlap</span>
							<span className="font-medium text-sm">
								{Math.round(skillOverlapPercent)}%
							</span>
						</div>
						<Progress className="h-2" value={skillOverlapPercent} />
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm">Experience Relevance</span>
							<span className="font-medium text-sm">
								{Math.round(experienceRelevance)}%
							</span>
						</div>
						<Progress className="h-2" value={experienceRelevance} />
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm">Cosine Similarity</span>
							<span className="font-medium text-sm">
								{cosineSimilarity.toFixed(3)}
							</span>
						</div>
						<Progress className="h-2" value={cosineSimilarity * 100} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
