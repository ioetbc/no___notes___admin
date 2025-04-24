// @ts-expect-error - no types, but it's a tiny function
import sortBy from "sort-by";

type ContactMutation = {
	id?: number;
	first?: string;
	last?: string;
	avatar?: string;
	twitter?: string;
	notes?: string;
	favorite?: boolean;
};

export type ContactRecord = ContactMutation & {
	id: number;
	created_at: string;
};

import { contacts, createDb } from "@no-notes/db";
import { eq, like } from "drizzle-orm";

// Initialize the database
const db = createDb();

// Drizzle implementation of the API functions
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
	const transformedContacts: ContactRecord[] = contactList.map((contact) => {
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

export async function getDrizzleContact(id: number) {
	const contact = await db
		.select()
		.from(contacts)
		.where(eq(contacts.id, id))
		.limit(1);

	if (!contact.length) return null;

	const [first, ...lastParts] = (contact[0].name || "").split(" ");
	const last = lastParts.join(" ");

	return {
		id: contact[0].id,
		createdAt: new Date(contact[0].created_at).toISOString(),
		first,
		last,
		avatar: contact[0].avatar || undefined,
		twitter: contact[0].twitter || undefined,
		notes: contact[0].notes || undefined,
		favorite: contact[0].favorite || false,
	};
}

export async function updateDrizzleContact(
	id: number,
	updates: ContactMutation,
) {
	const contact = await getDrizzleContact(id);
	if (!contact) {
		throw new Error(`No contact found for ${id}`);
	}

	const updateData: Record<string, string | boolean> = {};

	if (updates.first !== undefined || updates.last !== undefined) {
		const firstName =
			updates.first !== undefined ? updates.first : contact.first;
		const lastName = updates.last !== undefined ? updates.last : contact.last;
		updateData.name = `${firstName} ${lastName}`.trim();
	}

	if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
	if (updates.twitter !== undefined) updateData.twitter = updates.twitter;
	if (updates.notes !== undefined) updateData.notes = updates.notes;
	if (updates.favorite !== undefined) updateData.favorite = updates.favorite;

	await db.update(contacts).set(updateData).where(eq(contacts.id, id));

	return getDrizzleContact(id);
}

export async function deleteDrizzleContact(id: number) {
	await db.delete(contacts).where(eq(contacts.id, id));
	return null;
}

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

// Initialize the database with sample data
initializeDrizzleData().catch(console.error);

// Export renamed functions to match the original API
export const getContacts = getDrizzleContacts;
export const getContact = getDrizzleContact;
export const createEmptyContact = createDrizzleEmptyContact;
export const updateContact = updateDrizzleContact;
export const deleteContact = deleteDrizzleContact;
