"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { OptimizedResume } from "~/app/api/ats/optimize/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { formatOptimizedResumeToMarkdown } from "~/lib/resume-formatter";

interface ResumeDiffViewerProps {
	originalResume: string;
	optimizedResume: string;
	optimizedResumeObject?: Partial<OptimizedResume> | null;
	modifications?: Array<{
		section: string;
		change: string;
		reason: string;
	}>;
	isStreaming?: boolean;
}

export function ResumeDiffViewer({
	originalResume,
	optimizedResume,
	optimizedResumeObject,
	modifications = [],
	isStreaming = false,
}: ResumeDiffViewerProps) {
	const [activeTab, setActiveTab] = useState<
		"side-by-side" | "optimized" | "changes"
	>("side-by-side");

	// Use structured object if available, otherwise use markdown string
	const displayResume =
		optimizedResumeObject && Object.keys(optimizedResumeObject).length > 0
			? formatOptimizedResumeToMarkdown(optimizedResumeObject)
			: optimizedResume;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					Resume Comparison
					{isStreaming && (
						<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
					)}
				</CardTitle>
				<CardDescription>
					{isStreaming
						? "Optimized resume is being generated..."
						: "Compare your original resume with the optimized version"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-4 flex gap-2 border-b">
					<button
						className={`px-4 py-2 font-medium text-sm transition-colors ${
							activeTab === "side-by-side"
								? "border-primary border-b-2 text-primary"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={() => setActiveTab("side-by-side")}
						type="button"
					>
						Side by Side
					</button>
					<button
						className={`px-4 py-2 font-medium text-sm transition-colors ${
							activeTab === "optimized"
								? "border-primary border-b-2 text-primary"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={() => setActiveTab("optimized")}
						type="button"
					>
						Optimized
					</button>
					<button
						className={`px-4 py-2 font-medium text-sm transition-colors ${
							activeTab === "changes"
								? "border-primary border-b-2 text-primary"
								: "text-muted-foreground hover:text-foreground"
						}`}
						onClick={() => setActiveTab("changes")}
						type="button"
					>
						Changes
					</button>
				</div>

				{activeTab === "side-by-side" && (
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<h3 className="font-semibold text-sm">Original Resume</h3>
							<div className="rounded-lg border bg-muted/50 p-4">
								<pre className="whitespace-pre-wrap text-sm">
									{originalResume}
								</pre>
							</div>
						</div>
						<div className="space-y-2">
							<h3 className="flex items-center gap-2 font-semibold text-sm">
								Optimized Resume
								{isStreaming && (
									<span className="text-muted-foreground text-xs">
										(Streaming...)
									</span>
								)}
							</h3>
							<div className="rounded-lg border bg-muted/50 p-4">
								{isStreaming && !displayResume ? (
									<div className="space-y-2">
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-4 w-full" />
									</div>
								) : (
									<pre className="whitespace-pre-wrap text-sm">
										{displayResume || "Generating..."}
									</pre>
								)}
							</div>
						</div>
					</div>
				)}

				{activeTab === "optimized" && (
					<div className="rounded-lg border bg-muted/50 p-4">
						{isStreaming && !displayResume ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-5/6" />
							</div>
						) : (
							<pre className="whitespace-pre-wrap text-sm">
								{displayResume || "Generating..."}
							</pre>
						)}
					</div>
				)}

				{activeTab === "changes" && (
					<div>
						{modifications.length === 0 ? (
							<p className="py-4 text-center text-muted-foreground text-sm">
								No modifications tracked
							</p>
						) : (
							<div className="space-y-3">
								{modifications.map((mod) => (
									<div className="rounded-lg border p-3" key={mod.section}>
										<div className="flex items-center justify-between">
											<span className="font-medium text-sm">{mod.section}</span>
										</div>
										<p className="mt-1 text-sm">{mod.change}</p>
										<p className="mt-1 text-muted-foreground text-xs">
											{mod.reason}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
