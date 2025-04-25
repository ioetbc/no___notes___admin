// @ts-expect-error - no types, but it's a tiny function
import sortBy from "sort-by";

import {
	type Exhibition,
	contacts,
	createDb,
	exhibition,
	images,
} from "@no-notes/db";
import { eq, ilike } from "drizzle-orm";

// Type definitions
type ExhibitionMutation = {
	id?: number;
	name?: string;
	description?: string;
	url?: string;
	gallery_id?: number;
	recommended?: boolean;
	start_date?: string;
	end_date?: string;
	private_view_start_date?: string;
	private_view_end_date?: string;
};

export type ExhibitionRecord = ExhibitionMutation & {
	id: number;
	created_at: string;
	images?: ImageRecord[];
	featured_artists?: ArtistRecord[];
};

// Initialize the database
const db = createDb();

// Exhibition API functions
export async function getExhibitions(query?: string | null) {
	let exhibitionList: Exhibition[] = [];

	if (query) {
		exhibitionList = await db
			.select()
			.from(exhibition)
			.where(ilike(exhibition.name, `%${query}%`));
	} else {
		exhibitionList = await db.select().from(exhibition);
	}

	// Transform the data to match the expected format
	const transformedExhibitions: ExhibitionRecord[] = exhibitionList.map(
		(exhibit) => {
			return {
				id: exhibit.id,
				name: exhibit.name,
				description: exhibit.description || undefined,
				start_date: exhibit.start_date
					? new Date(exhibit.start_date).toISOString()
					: undefined,
				end_date: exhibit.end_date
					? new Date(exhibit.end_date).toISOString()
					: undefined,
				private_view_start_date: exhibit.private_view_start_date
					? new Date(exhibit.private_view_start_date).toISOString()
					: undefined,
				private_view_end_date: exhibit.private_view_end_date
					? new Date(exhibit.private_view_end_date).toISOString()
					: undefined,
				created_at: new Date(exhibit.created_at).toISOString(),
				updated_at: new Date(exhibit.updated_at).toISOString(),
				gallery_id: exhibit.gallery_id || undefined,
				url: exhibit.url || undefined,
				recommended: exhibit.recommended || false,
			};
		},
	);

	console.log("transformedExhibitions", transformedExhibitions);

	return transformedExhibitions.sort(sortBy("name", "start_date"));
}

export async function getDrizzleExhibition(id: number) {
	// Use the query builder with relations support
	const result = await db.query.exhibition.findFirst({
		where: eq(exhibition.id, id),
		with: {
			images: true,
			artists: {
				with: {
					artist: true,
				},
			},
		},
	});

	if (!result) return null;

	console.log("result wtf", JSON.stringify(result.artists, null, 2));

	return {
		id: result.id,
		name: result.name,
		description: result.description || undefined,
		start_date: result.start_date
			? new Date(result.start_date).toISOString()
			: undefined,
		end_date: result.end_date
			? new Date(result.end_date).toISOString()
			: undefined,
		private_view_start_date: result.private_view_start_date
			? new Date(result.private_view_start_date).toISOString()
			: undefined,
		private_view_end_date: result.private_view_end_date
			? new Date(result.private_view_end_date).toISOString()
			: undefined,
		created_at: new Date(result.created_at).toISOString(),
		updated_at: new Date(result.updated_at).toISOString(),
		gallery_id: result.gallery_id || undefined,
		url: result.url || undefined,
		recommended: result.recommended || false,
		images: result.images,
		featured_artists: result.artists,
	};
}

export async function createDrizzleEmptyContact() {
	const newContact = await db
		.insert(contacts)
		.values({
			created_at: new Date(),
			name: "",
			favorite: false,
		})
		.returning();

	return {
		id: newContact[0].id,
		createdAt: new Date(newContact[0].created_at).toISOString(),
		first: "",
		last: "",
		avatar: newContact[0].avatar || undefined,
		twitter: newContact[0].twitter || undefined,
		notes: newContact[0].notes || undefined,
		favorite: newContact[0].favorite || false,
	};
}

export async function updateDrizzleExhibition(
	id: number,
	updates: ExhibitionMutation,
) {
	const updateData: Record<string, string | boolean | number | Date | null> =
		{};

	if (updates.name !== undefined) updateData.name = updates.name;
	if (updates.description !== undefined)
		updateData.description = updates.description;
	if (updates.url !== undefined) updateData.url = updates.url;
	if (updates.gallery_id !== undefined)
		updateData.gallery_id = updates.gallery_id;
	if (updates.recommended !== undefined)
		updateData.recommended = updates.recommended;
	if (updates.start_date !== undefined)
		updateData.start_date = updates.start_date
			? new Date(updates.start_date)
			: null;
	if (updates.end_date !== undefined)
		updateData.end_date = updates.end_date ? new Date(updates.end_date) : null;
	if (updates.private_view_start_date !== undefined)
		updateData.private_view_start_date = updates.private_view_start_date
			? new Date(updates.private_view_start_date)
			: null;
	if (updates.private_view_end_date !== undefined)
		updateData.private_view_end_date = updates.private_view_end_date
			? new Date(updates.private_view_end_date)
			: null;

	console.log("updateData", updateData);

	await db.update(exhibition).set(updateData).where(eq(exhibition.id, id));

	return getDrizzleExhibition(id);
}

export async function deleteDrizzleExhibition(id: number) {
	await db.delete(contacts).where(eq(contacts.id, id));
	return null;
}

// Initialize the database with sample data
async function initializeDrizzleData() {
	const existingContacts = await db
		.select({ count: contacts.id })
		.from(contacts);

	if (existingContacts.length === 0) {
		const sampleContacts = [
			{
				avatar:
					"https://sessionize.com/image/124e-400o400o2-wHVdAuNaxi8KJrgtN3ZKci.jpg",
				name: "Shruti Kapoor",
				twitter: "@shrutikapoor08",
			},
			{
				avatar:
					"https://sessionize.com/image/1940-400o400o2-Enh9dnYmrLYhJSTTPSw3MH.jpg",
				name: "Glenn Reyes",
				twitter: "@glnnrys",
			},
			{
				avatar:
					"https://sessionize.com/image/9273-400o400o2-3tyrUE3HjsCHJLU5aUJCja.jpg",
				name: "Ryan Florence",
			},
		];

		for (const contact of sampleContacts) {
			await db.insert(contacts).values({
				created_at: new Date(),
				name: contact.name,
				avatar: contact.avatar,
				twitter: contact.twitter,
				favorite: false,
			});
		}
	}
}

// Init database (keep for backward compatibility)
initializeDrizzleData().catch(console.error);

// Export renamed functions to match the original API
// Image API functions
export type ImageRecord = {
	id: number;
	exhibition_id: number;
	image_url: string;
	caption?: string;
	created_at: string;
};

export type ArtistRecord = {
	id: number;
	name: string;
	instagram_handle?: string;
	created_at: string;
};

export type ImageMutation = {
	exhibition_id: number;
	image_url: string;
	caption?: string;
};

export async function getImagesForExhibition(
	exhibitionId: number,
): Promise<ImageRecord[]> {
	const imageList = await db
		.select()
		.from(images)
		.where(eq(images.exhibition_id, exhibitionId));

	return imageList.map((image) => ({
		id: image.id,
		exhibition_id: image.exhibition_id,
		image_url: image.image_url,
		caption: image.caption || undefined,
		created_at: new Date(image.created_at).toISOString(),
	}));
}

export async function createImage(data: ImageMutation): Promise<ImageRecord> {
	const newImage = await db
		.insert(images)
		.values({
			exhibition_id: data.exhibition_id,
			image_url: data.image_url,
			caption: data.caption || null,
			created_at: new Date(),
		})
		.returning();

	return {
		id: newImage[0].id,
		exhibition_id: newImage[0].exhibition_id,
		image_url: newImage[0].image_url,
		caption: newImage[0].caption || undefined,
		created_at: new Date(newImage[0].created_at).toISOString(),
	};
}

export async function updateImage(
	id: number,
	updates: Partial<ImageMutation>,
): Promise<ImageRecord | null> {
	const updateData: Record<string, string | number | null> = {};

	if (updates.image_url !== undefined) updateData.image_url = updates.image_url;
	if (updates.caption !== undefined)
		updateData.caption = updates.caption || null;

	await db.update(images).set(updateData).where(eq(images.id, id));

	const result = await db
		.select()
		.from(images)
		.where(eq(images.id, id))
		.limit(1);

	if (!result.length) return null;

	const image = result[0];
	return {
		id: image.id,
		exhibition_id: image.exhibition_id,
		image_url: image.image_url,
		caption: image.caption || undefined,
		created_at: new Date(image.created_at).toISOString(),
	};
}

export async function deleteImage(id: number): Promise<null> {
	await db.delete(images).where(eq(images.id, id));
	return null;
}

export const getExhibition = getDrizzleExhibition;
export const createEmptyContact = createDrizzleEmptyContact;
export const updateExhibition = updateDrizzleExhibition;
export const deleteExhibition = deleteDrizzleExhibition;
