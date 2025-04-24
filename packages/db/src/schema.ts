import {
	boolean,
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

// Define types based on the schema
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
