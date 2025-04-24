import {
	boolean,
	date,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

// Define the contacts table
export const contacts = pgTable("contacts", {
	id: varchar("id", { length: 36 }).primaryKey(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	name: text("name").notNull(),
	avatar: text("avatar"),
	twitter: text("twitter"),
	notes: text("notes"),
	favorite: boolean("favorite").default(false),
});

// Define the gallery table
export const gallery = pgTable("gallery", {
	id: varchar("id").primaryKey(),
	created_at: timestamp("created_at").notNull().defaultNow(),
	name: text("name").notNull(),
	url: text("url").notNull(),
	description: text("description"),
	recommended: boolean("recommended").default(false),
});

// Define the exhibition table
export const exhibition = pgTable("exhibition", {
	id: varchar("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	start_date: date("start_date"),
	end_date: date("end_date"),
	private_view_start_date: date("private_view_start_date"),
	private_view_end_date: date("private_view_end_date"),
	created_at: timestamp("created_at").notNull().defaultNow(),
	updated_at: timestamp("updated_at").notNull().defaultNow(),
	gallery_id: varchar("gallery_id").references(() => gallery.id),
	url: text("url"),
	recommended: boolean("recommended").default(false),
});

// Define types based on the schema
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type Gallery = typeof gallery.$inferSelect;
export type NewGallery = typeof gallery.$inferInsert;
export type Exhibition = typeof exhibition.$inferSelect;
export type NewExhibition = typeof exhibition.$inferInsert;
