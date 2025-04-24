// @ts-expect-error - no types, but it's a tiny function
import sortBy from "sort-by";

import { type Exhibition, contacts, createDb, exhibition } from "@no-notes/db";
import { eq, ilike, like } from "drizzle-orm";

// Type definitions
type ExhibitionMutation = {
	id?: number;
	name?: string;
	description?: string;
	url?: string;
	gallery_id?: number;
	recommended?: boolean;
};

export type ExhibitionRecord = ExhibitionMutation & {
	id: number;
	created_at: string;
};

// Initialize the database
const db = createDb();

// Exhibition API functions
export async function getExhibitions(query?: string | null) {
	let exhibitionList: Exhibition[] = [];

	console.log("query", query);

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
	const result = await db
		.select()
		.from(exhibition)
		.where(eq(exhibition.id, id))
		.limit(1);

	if (!result.length) return null;

	const exhibit = result[0];

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
}

// Contact API functions - keeping these for backward compatibility
export async function getDrizzleContacts(query?: string | null) {
	let contactList: (typeof contacts.$inferSelect)[] = [];

	if (query) {
		contactList = await db
			.select()
			.from(contacts)
			.where(like(contacts.name, `%${query}%`));
	} else {
		contactList = await db.select().from(contacts);
	}

	// Transform the data to match the expected format
	const transformedContacts: ExhibitionRecord[] = contactList.map((contact) => {
		const [first, ...lastParts] = contact.name.split(" ");
		const last = lastParts.join(" ");

		return {
			id: contact.id,
			created_at: new Date(contact.created_at).toISOString(),
			first,
			last,
			avatar: contact.avatar || undefined,
			twitter: contact.twitter || undefined,
			notes: contact.notes || undefined,
			favorite: contact.favorite || false,
		};
	});

	return transformedContacts.sort(sortBy("last", "createdAt"));
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
	// const exhibition = await getDrizzleExhibition(id);
	// if (!exhibition) {
	// 	throw new Error(`No exhibition found for ${id}`);
	// }

	const updateData: Record<string, string | boolean | number> = {};

	if (updates.name !== undefined) updateData.name = updates.name;
	if (updates.description !== undefined)
		updateData.description = updates.description;
	if (updates.url !== undefined) updateData.url = updates.url;
	if (updates.gallery_id !== undefined)
		updateData.gallery_id = updates.gallery_id;
	if (updates.recommended !== undefined)
		updateData.recommended = updates.recommended;

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
export const getContacts = getDrizzleContacts;
export const getExhibition = getDrizzleExhibition;
export const createEmptyContact = createDrizzleEmptyContact;
export const updateExhibition = updateDrizzleExhibition;
export const deleteExhibition = deleteDrizzleExhibition;
