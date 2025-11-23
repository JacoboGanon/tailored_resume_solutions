"use client";

import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

interface Recommendation {
	category: string;
	suggestion: string;
	priority: "high" | "medium" | "low";
	itemId?: string;
}

interface RecommendationsListProps {
	recommendations: Recommendation[];
	priorityKeywords?: string[];
	missingSkills?: string[];
}

export function RecommendationsList({
	recommendations,
	priorityKeywords = [],
	missingSkills = [],
}: RecommendationsListProps) {
	const getPriorityIcon = (priority: string) => {
		switch (priority) {
			case "high":
				return <AlertCircle className="h-4 w-4 text-red-600" />;
			case "medium":
				return <XCircle className="h-4 w-4 text-yellow-600" />;
			default:
				return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
		}
	};

	const getPriorityBadgeVariant = (
		priority: string,
	): "destructive" | "default" | "secondary" => {
		switch (priority) {
			case "high":
				return "destructive";
			case "medium":
				return "default";
			default:
				return "secondary";
		}
	};

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Improvement Recommendations</CardTitle>
					<CardDescription>
						Actionable suggestions to improve your ATS score
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{recommendations.length === 0 ? (
						<p className="py-4 text-center text-muted-foreground text-sm">
							No recommendations at this time. Your resume looks great!
						</p>
					) : (
						recommendations.map((rec) => (
							<div
								className="flex items-start gap-3 rounded-lg border p-3"
								key={rec.suggestion}
							>
								<div className="mt-0.5">{getPriorityIcon(rec.priority)}</div>
								<div className="flex-1 space-y-1">
									<div className="flex items-center gap-2">
										<Badge variant={getPriorityBadgeVariant(rec.priority)}>
											{rec.priority.toUpperCase()}
										</Badge>
										{rec.category && (
											<Badge className="text-xs" variant="outline">
												{rec.category.replace("_", " ")}
											</Badge>
										)}
									</div>
									<p className="text-sm">{rec.suggestion}</p>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>

			{priorityKeywords.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Priority Keywords</CardTitle>
						<CardDescription>
							Keywords to incorporate into your resume
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{priorityKeywords.map((keyword) => (
								<Badge key={keyword} variant="outline">
									{keyword}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{missingSkills.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Missing Skills</CardTitle>
						<CardDescription>
							Skills mentioned in the job posting that you may want to add
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{missingSkills.map((skill) => (
								<Badge key={skill} variant="secondary">
									{skill}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
