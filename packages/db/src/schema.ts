import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Define the contacts table
export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  twitter: text('twitter'),
  notes: text('notes'),
  favorite: integer('favorite', { mode: 'boolean' }).default(false),
});

// Define types based on the schema
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;