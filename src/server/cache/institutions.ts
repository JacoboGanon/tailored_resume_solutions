import { unstable_cache } from "next/cache";
import { db } from "~/server/db";

export const getAllInstitutions = unstable_cache(
	async () => {
		return db.commonInstitution.findMany({
			select: { id: true, name: true, type: true },
			orderBy: { name: "asc" },
		});
	},
	["all-institutions"],
	{ revalidate: 3600, tags: ["institutions"] },
);

export type CachedInstitution = Awaited<
	ReturnType<typeof getAllInstitutions>
>[number];
