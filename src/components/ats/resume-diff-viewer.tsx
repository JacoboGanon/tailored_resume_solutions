"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

interface ResumeDiffViewerProps {
	originalResume: string;
	optimizedResume: string;
	modifications?: Array<{
		section: string;
		change: string;
		reason: string;
	}>;
}

export function ResumeDiffViewer({
	originalResume,
	optimizedResume,
	modifications = [],
}: ResumeDiffViewerProps) {
	const [activeTab, setActiveTab] = useState<
		"side-by-side" | "optimized" | "changes"
	>("side-by-side");

	return (
		<Card>
			<CardHeader>
				<CardTitle>Resume Comparison</CardTitle>
				<CardDescription>
					Compare your original resume with the optimized version
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
							<h3 className="font-semibold text-sm">Optimized Resume</h3>
							<div className="rounded-lg border bg-muted/50 p-4">
								<pre className="whitespace-pre-wrap text-sm">
									{optimizedResume}
								</pre>
							</div>
						</div>
					</div>
				)}

				{activeTab === "optimized" && (
					<div className="rounded-lg border bg-muted/50 p-4">
						<pre className="whitespace-pre-wrap text-sm">{optimizedResume}</pre>
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
