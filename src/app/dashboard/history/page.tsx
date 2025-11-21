"use client";

import { format } from "date-fns";
import { Download, Eye, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { api, type RouterOutputs } from "~/trpc/react";

type resume = RouterOutputs["resume"]["getResumeHistory"][number];

export default function HistoryPage() {
	const utils = api.useUtils();
	const [selectedResume, setSelectedResume] = useState<resume | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

	const { data: resumes, isLoading } = api.resume.getResumeHistory.useQuery();

	const deleteMutation = api.resume.deleteResume.useMutation({
		onSuccess: () => {
			toast.success("Resume deleted");
			void utils.resume.getResumeHistory.invalidate();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleView = (resume: resume) => {
		setSelectedResume(resume);
		setIsViewDialogOpen(true);
	};

	const handleDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this resume?")) {
			deleteMutation.mutate({ id });
		}
	};

	const handleDownload = async (resumeId: string, resumeName: string) => {
		try {
			const response = await fetch("/api/resume/download", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ resumeId }),
			});

			if (!response.ok) {
				throw new Error("Failed to download PDF");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${resumeName.replace(/[^a-z0-9]/gi, "_")}.pdf`;
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

	const getSelectedItemsCount = (resume: resume) => {
		try {
			const items = JSON.parse(resume.selectedItemIds);
			return (
				(items.workExperienceIds?.length || 0) +
				(items.educationIds?.length || 0) +
				(items.projectIds?.length || 0) +
				(items.achievementIds?.length || 0) +
				(items.skillIds?.length || 0)
			);
		} catch {
			return 0;
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl">Resume History</h1>
				<p className="text-muted-foreground">
					View and manage your saved resumes
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Saved Resumes</CardTitle>
					<CardDescription>
						Resumes you've created and customized for different jobs
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!resumes || resumes.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<FileText className="mb-4 h-12 w-12 text-muted-foreground" />
							<h3 className="mb-2 font-semibold text-lg">No resumes yet</h3>
							<p className="mb-4 text-muted-foreground text-sm">
								Create your first resume by analyzing a job description in the
								Job Personalization page
							</p>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Job Preview</TableHead>
										<TableHead>Items</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{resumes.map((resume) => (
										<TableRow key={resume.id}>
											<TableCell className="font-medium">
												{resume.name}
											</TableCell>
											<TableCell className="max-w-md">
												<p className="truncate text-muted-foreground text-sm">
													{resume.jobDescription.substring(0, 100)}...
												</p>
											</TableCell>
											<TableCell>
												<Badge variant="secondary">
													{getSelectedItemsCount(resume)} items
												</Badge>
											</TableCell>
											<TableCell className="text-muted-foreground text-sm">
												{format(new Date(resume.createdAt), "MMM d, yyyy")}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														onClick={() => handleView(resume)}
														size="sm"
														variant="ghost"
													>
														<Eye className="h-4 w-4" />
													</Button>
													<Button
														onClick={() =>
															handleDownload(resume.id, resume.name)
														}
														size="sm"
														variant="ghost"
													>
														<Download className="h-4 w-4" />
													</Button>
													<Button
														onClick={() => handleDelete(resume.id)}
														size="sm"
														variant="ghost"
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* View Resume Dialog */}
			<Dialog onOpenChange={setIsViewDialogOpen} open={isViewDialogOpen}>
				<DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{selectedResume?.name}</DialogTitle>
						<DialogDescription>
							Created on{" "}
							{selectedResume &&
								format(new Date(selectedResume.createdAt), "MMMM d, yyyy")}
						</DialogDescription>
					</DialogHeader>
					{selectedResume && (
						<div className="space-y-4">
							<div>
								<h3 className="mb-2 font-semibold">Job Description</h3>
								<div className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
									{selectedResume.jobDescription}
								</div>
							</div>
							<div>
								<h3 className="mb-2 font-semibold">Selected Items</h3>
								<div className="space-y-2">
									{(() => {
										try {
											const items = JSON.parse(selectedResume.selectedItemIds);
											return (
												<div className="grid gap-2">
													{items.workExperienceIds?.length > 0 && (
														<div className="rounded-lg border p-3">
															<p className="font-medium text-sm">
																Work Experiences
															</p>
															<p className="text-muted-foreground text-sm">
																{items.workExperienceIds.length} selected
															</p>
														</div>
													)}
													{items.educationIds?.length > 0 && (
														<div className="rounded-lg border p-3">
															<p className="font-medium text-sm">Education</p>
															<p className="text-muted-foreground text-sm">
																{items.educationIds.length} selected
															</p>
														</div>
													)}
													{items.projectIds?.length > 0 && (
														<div className="rounded-lg border p-3">
															<p className="font-medium text-sm">Projects</p>
															<p className="text-muted-foreground text-sm">
																{items.projectIds.length} selected
															</p>
														</div>
													)}
													{items.skillIds?.length > 0 && (
														<div className="rounded-lg border p-3">
															<p className="font-medium text-sm">Skills</p>
															<p className="text-muted-foreground text-sm">
																{items.skillIds.length} selected
															</p>
														</div>
													)}
													{items.achievementIds?.length > 0 && (
														<div className="rounded-lg border p-3">
															<p className="font-medium text-sm">
																Achievements
															</p>
															<p className="text-muted-foreground text-sm">
																{items.achievementIds.length} selected
															</p>
														</div>
													)}
												</div>
											);
										} catch {
											return (
												<p className="text-muted-foreground text-sm">
													Unable to parse selected items
												</p>
											);
										}
									})()}
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
