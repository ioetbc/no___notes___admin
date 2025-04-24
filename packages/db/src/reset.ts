import { sql } from "drizzle-orm";
import { createDb } from "./index.js";

/**
 * Reset all tables in the database by dropping all tables and recreating the schema
 * This ensures clean slate for the database while maintaining the schema integrity
 */
export async function resetDatabase() {
	const db = createDb();

	try {
		console.log("Starting database reset...");

		// First disable foreign key constraints (PostgreSQL specific)
		console.log("Temporarily disabling foreign key constraints...");
		await db.execute(sql`SET session_replication_role = 'replica'`);

		// Drop tables in order to respect foreign key constraints
		console.log("Dropping exhibition_artists table...");
		await db.execute(sql`DROP TABLE IF EXISTS exhibition_artists CASCADE`);

		console.log("Dropping exhibition table...");
		await db.execute(sql`DROP TABLE IF EXISTS exhibition CASCADE`);

		console.log("Dropping artists table...");
		await db.execute(sql`DROP TABLE IF EXISTS artists CASCADE`);

		console.log("Dropping gallery table...");
		await db.execute(sql`DROP TABLE IF EXISTS gallery CASCADE`);

		console.log("Dropping contacts table...");
		await db.execute(sql`DROP TABLE IF EXISTS contacts CASCADE`);

		// Re-enable foreign key constraints
		console.log("Re-enabling foreign key constraints...");
		await db.execute(sql`SET session_replication_role = 'origin'`);

		console.log("Database reset complete.");
	} catch (error) {
		// Make sure to re-enable foreign key constraints even if there's an error
		try {
			await db.execute(sql`SET session_replication_role = 'origin'`);
		} catch (e) {
			console.error("Error re-enabling foreign key constraints:", e);
		}
		
		console.error("Error resetting database:", error);
		throw error;
	}
}

// Run immediately when this file is executed directly
resetDatabase()
	.then(() => {
		console.log("Database reset successfully completed");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Failed to reset database:", error);
		process.exit(1);
	});
