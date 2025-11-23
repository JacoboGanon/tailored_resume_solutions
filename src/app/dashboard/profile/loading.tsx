/** biome-ignore-all lint/suspicious/noArrayIndexKey: <loading page so indexes won't change> */

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

function CardSkeleton({ lines = 3 }: { lines?: number }) {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-32" />
				<Skeleton className="h-4 w-48" />
			</CardHeader>
			<CardContent className="space-y-3">
				{Array.from({ length: lines }).map((_, i) => (
					<Skeleton className="h-4 w-full" key={i} />
				))}
			</CardContent>
		</Card>
	);
}

function SkillsSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-16" />
				<Skeleton className="h-4 w-56" />
			</CardHeader>
			<CardContent className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<div className="flex flex-wrap gap-2">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton className="h-6 w-20" key={i} />
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export default function ProfileLoading() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<Skeleton className="h-9 w-48" />
				<Skeleton className="mt-2 h-5 w-80" />
			</div>

			{/* Contact Information */}
			<CardSkeleton lines={4} />

			{/* Work Experience */}
			<CardSkeleton lines={5} />

			{/* Skills */}
			<SkillsSkeleton />

			{/* Education */}
			<CardSkeleton lines={4} />

			{/* Projects */}
			<CardSkeleton lines={4} />

			{/* Achievements */}
			<CardSkeleton lines={3} />
		</div>
	);
}
