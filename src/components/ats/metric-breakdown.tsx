"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

interface MetricBreakdownProps {
	cosineSimilarity: number;
	keywordMatchPercent: number;
	skillOverlapPercent: number;
	experienceRelevance: number;
}

export function MetricBreakdown({
	cosineSimilarity,
	keywordMatchPercent,
	skillOverlapPercent,
	experienceRelevance,
}: MetricBreakdownProps) {
	const metrics = [
		{
			label: "Cosine Similarity",
			value: cosineSimilarity,
			description: "Semantic similarity between job and resume keywords",
			format: (v: number) => v.toFixed(3),
		},
		{
			label: "Keyword Match",
			value: keywordMatchPercent,
			description: "Percentage of job keywords found in resume",
			format: (v: number) => `${Math.round(v)}%`,
		},
		{
			label: "Skill Overlap",
			value: skillOverlapPercent,
			description: "Percentage of required/preferred skills matched",
			format: (v: number) => `${Math.round(v)}%`,
		},
		{
			label: "Experience Relevance",
			value: experienceRelevance,
			description: "How well work experience aligns with job title",
			format: (v: number) => `${Math.round(v)}%`,
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Detailed Metrics</CardTitle>
				<CardDescription>
					Breakdown of individual scoring components
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{metrics.map((metric) => (
					<div className="space-y-2" key={metric.label}>
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-sm">{metric.label}</p>
								<p className="text-muted-foreground text-xs">
									{metric.description}
								</p>
							</div>
							<span className="font-semibold text-sm">
								{metric.format(metric.value)}
							</span>
						</div>
						<Progress
							className="h-2"
							value={metric.value > 1 ? metric.value : metric.value * 100}
						/>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
