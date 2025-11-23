import { unstable_cache } from "next/cache";
import { db } from "~/server/db";

export const getAllSkills = unstable_cache(
	async () => {
		return db.skill.findMany({
			select: { id: true, name: true, category: true },
			orderBy: { name: "asc" },
		});
	},
	["all-skills"],
	{ revalidate: 3600, tags: ["skills"] },
);

export type CachedSkill = Awaited<ReturnType<typeof getAllSkills>>[number];
