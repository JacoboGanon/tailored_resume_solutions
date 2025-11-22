"use client";

import { Edit, GraduationCap, Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InstitutionCombobox } from "~/components/institution-combobox";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { api, type RouterOutputs } from "~/trpc/react";

type portfolio = RouterOutputs["portfolio"]["getOrCreate"];

export function EducationSection({
	portfolio,
}: {
	portfolio: portfolio | undefined;
}) {
	const utils = api.useUtils();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingEdu, setEditingEdu] = useState<
		portfolio["educations"][number] | null
	>(null);
	const [formData, setFormData] = useState({
		institution: "",
		degree: "",
		fieldOfStudy: "",
		gpa: "",
		minors: [""],
		startDate: "",
		endDate: "",
		isCurrent: false,
	});

	const addMutation = api.portfolio.addEducation.useMutation({
		onSuccess: () => {
			toast.success("Education added");
			void utils.portfolio.getOrCreate.invalidate();
			setIsDialogOpen(false);
			resetForm();
		},
	});

	const updateMutation = api.portfolio.updateEducation.useMutation({
		onSuccess: () => {
			toast.success("Education updated");
			void utils.portfolio.getOrCreate.invalidate();
			setIsDialogOpen(false);
			resetForm();
		},
	});

	const deleteMutation = api.portfolio.deleteEducation.useMutation({
		onSuccess: () => {
			toast.success("Education deleted");
			void utils.portfolio.getOrCreate.invalidate();
		},
	});

	const resetForm = () => {
		setFormData({
			institution: "",
			degree: "",
			fieldOfStudy: "",
			gpa: "",
			minors: [""],
			startDate: "",
			endDate: "",
			isCurrent: false,
		});
		setEditingEdu(null);
	};

	const handleEdit = (edu: portfolio["educations"][number]) => {
		setEditingEdu(edu);
		setFormData({
			institution: edu.institution,
			degree: edu.degree,
			fieldOfStudy: edu.fieldOfStudy,
			gpa: edu.gpa || "",
			minors: edu.minors.length > 0 ? edu.minors : [""],
			startDate: new Date(edu.startDate).toISOString().slice(0, 7),
			endDate: edu.endDate
				? new Date(edu.endDate).toISOString().slice(0, 7)
				: "",
			isCurrent: edu.isCurrent,
		});
		setIsDialogOpen(true);
	};

	const handleSubmit = () => {
		const data = {
			institution: formData.institution,
			degree: formData.degree,
			fieldOfStudy: formData.fieldOfStudy,
			gpa: formData.gpa || undefined,
			minors: formData.minors.filter((m) => m.trim()),
			startDate: new Date(`${formData.startDate}-01`),
			endDate:
				formData.isCurrent || !formData.endDate
					? null
					: new Date(`${formData.endDate}-01`),
			isCurrent: formData.isCurrent,
		};

		if (editingEdu) {
			updateMutation.mutate({ id: editingEdu.id, data });
		} else {
			addMutation.mutate(data);
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Education</CardTitle>
						<CardDescription>Your academic background</CardDescription>
					</div>
					<Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={resetForm}>
								<Plus className="mr-2 h-4 w-4" />
								Add Education
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
							<DialogHeader>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
										<GraduationCap className="h-5 w-5 text-primary" />
									</div>
									<div>
										<DialogTitle>
											{editingEdu ? "Edit" : "Add"} Education
										</DialogTitle>
										<DialogDescription>
											{editingEdu
												? "Update your educational background"
												: "Add your academic credentials and achievements"}
										</DialogDescription>
									</div>
								</div>
							</DialogHeader>

							<Separator className="my-4" />

							{/* Institution */}
							<div className="space-y-4">
								<h4 className="font-medium text-muted-foreground text-sm">
									Institution
								</h4>
								<div className="space-y-2">
									<Label htmlFor="institution">
										School / University{" "}
										<span className="text-destructive">*</span>
									</Label>
									<InstitutionCombobox
										onValueChange={(value) =>
											setFormData({ ...formData, institution: value })
										}
										value={formData.institution}
									/>
								</div>
							</div>

							<Separator />

							{/* Degree Details */}
							<div className="space-y-4">
								<h4 className="font-medium text-muted-foreground text-sm">
									Degree Details
								</h4>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="degree">
											Degree <span className="text-destructive">*</span>
										</Label>
										<Input
											id="degree"
											onChange={(e) =>
												setFormData({ ...formData, degree: e.target.value })
											}
											placeholder="Bachelor of Science"
											value={formData.degree}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="fieldOfStudy">
											Field of Study <span className="text-destructive">*</span>
										</Label>
										<Input
											id="fieldOfStudy"
											onChange={(e) =>
												setFormData({
													...formData,
													fieldOfStudy: e.target.value,
												})
											}
											placeholder="Computer Science"
											value={formData.fieldOfStudy}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="gpa">GPA</Label>
										<Input
											id="gpa"
											onChange={(e) =>
												setFormData({ ...formData, gpa: e.target.value })
											}
											placeholder="3.8"
											value={formData.gpa}
										/>
									</div>
								</div>
							</div>

							<Separator />

							{/* Duration */}
							<div className="space-y-4">
								<h4 className="font-medium text-muted-foreground text-sm">
									Duration
								</h4>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="edu-startDate">
											Start Date <span className="text-destructive">*</span>
										</Label>
										<Input
											id="edu-startDate"
											onChange={(e) =>
												setFormData({ ...formData, startDate: e.target.value })
											}
											type="month"
											value={formData.startDate}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="edu-endDate">End Date</Label>
										<Input
											disabled={formData.isCurrent}
											id="edu-endDate"
											onChange={(e) =>
												setFormData({ ...formData, endDate: e.target.value })
											}
											type="month"
											value={formData.endDate}
										/>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										checked={formData.isCurrent}
										id="edu-current"
										onCheckedChange={(checked) =>
											setFormData({
												...formData,
												isCurrent: checked as boolean,
											})
										}
									/>
									<Label className="cursor-pointer" htmlFor="edu-current">
										I'm currently enrolled
									</Label>
								</div>
							</div>

							<Separator />

							{/* Minors */}
							<div className="space-y-4">
								<div>
									<h4 className="font-medium text-muted-foreground text-sm">
										Minors / Tracks
									</h4>
									<p className="mt-1 text-muted-foreground text-xs">
										Add any minors, concentrations, or specializations
									</p>
								</div>
								<div className="space-y-3">
									{formData.minors.map((minor, index) => (
										<div
											className="flex items-start gap-3"
											key={`minor-${index}-${minor.slice(0, 20)}`}
										>
											<Input
												className="flex-1"
												onChange={(e) => {
													const newMinors = [...formData.minors];
													newMinors[index] = e.target.value;
													setFormData({ ...formData, minors: newMinors });
												}}
												placeholder="Minor or specialization"
												value={minor}
											/>
											<Button
												className="shrink-0 text-muted-foreground hover:text-destructive"
												onClick={() => {
													const newMinors = formData.minors.filter(
														(_, i) => i !== index,
													);
													setFormData({
														...formData,
														minors: newMinors.length > 0 ? newMinors : [""],
													});
												}}
												size="icon"
												variant="ghost"
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
									<Button
										className="w-full"
										onClick={() =>
											setFormData({
												...formData,
												minors: [...formData.minors, ""],
											})
										}
										size="sm"
										variant="outline"
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Minor
									</Button>
								</div>
							</div>

							<DialogFooter className="gap-2">
								<Button
									onClick={() => setIsDialogOpen(false)}
									variant="outline"
								>
									Cancel
								</Button>
								<Button
									disabled={
										addMutation.isPending ||
										updateMutation.isPending ||
										!formData.institution ||
										!formData.degree ||
										!formData.fieldOfStudy ||
										!formData.startDate
									}
									onClick={handleSubmit}
								>
									{(addMutation.isPending || updateMutation.isPending) && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{editingEdu ? "Save Changes" : "Add Education"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{portfolio?.educations?.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground">
						No education added yet
					</p>
				) : (
					<div className="space-y-4">
						{portfolio?.educations?.map((edu) => {
							return (
								<div className="rounded-lg border p-4" key={edu.id}>
									<div className="flex items-start justify-between">
										<div>
											<h3 className="font-semibold">
												{edu.degree} in {edu.fieldOfStudy}
											</h3>
											<p className="text-muted-foreground text-sm">
												{edu.institution}
											</p>
											<p className="text-muted-foreground text-sm">
												{new Date(edu.startDate).toLocaleDateString("en-US", {
													month: "short",
													year: "numeric",
												})}{" "}
												-{" "}
												{edu.isCurrent
													? "Present"
													: new Date(
															edu.endDate || new Date(),
														).toLocaleDateString("en-US", {
															month: "short",
															year: "numeric",
														})}
											</p>
											{edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
											{edu.minors.length > 0 && (
												<p className="text-sm">
													Minors: {edu.minors.join(", ")}
												</p>
											)}
										</div>
										<div className="flex gap-2">
											<Button
												onClick={() => handleEdit(edu)}
												size="sm"
												variant="outline"
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												onClick={() => deleteMutation.mutate({ id: edu.id })}
												size="sm"
												variant="destructive"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
