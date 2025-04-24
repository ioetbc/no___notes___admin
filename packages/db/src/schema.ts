import type { SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

// Define the contacts table
export const contacts = pgTable("contacts", {
	id: serial("id").primaryKey(),
	created_at: timestamp("created_at").notNull().defaultNow(),
	name: text("name").notNull(),
	avatar: text("avatar"),
	twitter: text("twitter"),
	notes: text("notes"),
	favorite: boolean("favorite").default(false),
});

// Define the gallery table
export const gallery = pgTable("gallery", {
	id: serial("id").primaryKey(),
	created_at: timestamp("created_at").notNull().defaultNow(),
	name: text("name").notNull(),
	url: text("url").notNull(),
	description: text("description"),
	recommended: boolean("recommended").default(false),
});

// Define the exhibition table
export const exhibition = pgTable("exhibition", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	start_date: timestamp("start_date", { withTimezone: true }),
	end_date: timestamp("end_date", { withTimezone: true }),
	private_view_start_date: timestamp("private_view_start_date", {
		withTimezone: true,
	}),
	private_view_end_date: timestamp("private_view_end_date", {
		withTimezone: true,
	}),
	created_at: timestamp("created_at").notNull().defaultNow(),
	updated_at: timestamp("updated_at").notNull().defaultNow(),
	gallery_id: integer("gallery_id").references(() => gallery.id),
	url: text("url"),
	recommended: boolean("recommended").default(false),
});

// Define the artists table
export const artists = pgTable("artists", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	instagram_handle: text("instagram_handle"),
	created_at: timestamp("created_at").notNull().defaultNow(),
});

// Define the exhibition_artists join table for many-to-many relationship
export const exhibition_artists = pgTable(
	"exhibition_artists",
	{
		exhibition_id: integer("exhibition_id")
			.notNull()
			.references(() => exhibition.id),
		artist_id: integer("artist_id")
			.notNull()
			.references(() => artists.id),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.exhibition_id, table.artist_id] }),
		};
	},
);

// Define types based on the schema
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type Gallery = typeof gallery.$inferSelect;
export type NewGallery = typeof gallery.$inferInsert;
export type Exhibition = typeof exhibition.$inferSelect;
export type NewExhibition = typeof exhibition.$inferInsert;
export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;
export type ExhibitionArtist = typeof exhibition_artists.$inferSelect;
export type NewExhibitionArtist = typeof exhibition_artists.$inferInsert;

export function lower(exhibition: Exhibition): SQL {
	return sql`lower(${exhibition.name})`;
}
