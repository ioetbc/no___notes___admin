import { sql } from "drizzle-orm";
import postgres from "postgres";
import { contacts, gallery, exhibition, createDb } from "./index.js";

// PostgreSQL connection configuration
const connectionString =
	process.env.DATABASE_URL ||
	`postgres://${process.env.DB_USER || "postgres"}:${process.env.DB_PASSWORD || "postgres"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "no_notes_admin"}`;

// Use a direct connection for migrations
const migrationClient = postgres(connectionString, { max: 1 });

async function seed() {
	console.log("Seeding database with contacts...");

	// Get the regular DB connection for data operations
	const db = createDb();

	try {
		// Ensure contacts table exists with proper schema
		await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(36) PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        name TEXT NOT NULL,
        avatar TEXT,
        twitter TEXT,
        notes TEXT,
        favorite BOOLEAN DEFAULT FALSE
      )
    `);

		// Ensure gallery table exists with proper schema
		await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gallery (
        id VARCHAR(36) PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        recommended BOOLEAN DEFAULT FALSE
      )
    `);

		// Ensure exhibition table exists with proper schema
		await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exhibition (
        id VARCHAR(36) PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        private_view_start_date DATE,
        private_view_end_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        gallery_id VARCHAR(36) REFERENCES gallery(id),
        url TEXT,
        recommended BOOLEAN DEFAULT FALSE
      )
    `);

		// Clear existing data
		await db.delete(exhibition);
		await db.delete(gallery);
		await db.delete(contacts);
		console.log("Cleared existing contacts, gallery, and exhibition data");
	} catch (error) {
		console.error("Error setting up tables:", error);
	}

	// Original contact data from data.ts
	const contactsData = [
		{
			avatar:
				"https://sessionize.com/image/124e-400o400o2-wHVdAuNaxi8KJrgtN3ZKci.jpg",
			first: "Shruti",
			last: "Kapoor",
			twitter: "@shrutikapoor08",
		},
		{
			avatar:
				"https://sessionize.com/image/1940-400o400o2-Enh9dnYmrLYhJSTTPSw3MH.jpg",
			first: "Glenn",
			last: "Reyes",
			twitter: "@glnnrys",
		},
		{
			avatar:
				"https://sessionize.com/image/9273-400o400o2-3tyrUE3HjsCHJLU5aUJCja.jpg",
			first: "Ryan",
			last: "Florence",
		},
		{
			avatar:
				"https://sessionize.com/image/d14d-400o400o2-pyB229HyFPCnUcZhHf3kWS.png",
			first: "Oscar",
			last: "Newman",
			twitter: "@__oscarnewman",
		},
		{
			avatar:
				"https://sessionize.com/image/fd45-400o400o2-fw91uCdGU9hFP334dnyVCr.jpg",
			first: "Michael",
			last: "Jackson",
		},
		{
			avatar:
				"https://sessionize.com/image/b07e-400o400o2-KgNRF3S9sD5ZR4UsG7hG4g.jpg",
			first: "Christopher",
			last: "Chedeau",
			twitter: "@Vjeux",
		},
		{
			avatar:
				"https://sessionize.com/image/262f-400o400o2-UBPQueK3fayaCmsyUc1Ljf.jpg",
			first: "Cameron",
			last: "Matheson",
			twitter: "@cmatheson",
		},
		{
			avatar:
				"https://sessionize.com/image/820b-400o400o2-Ja1KDrBAu5NzYTPLSC3GW8.jpg",
			first: "Brooks",
			last: "Lybrand",
			twitter: "@BrooksLybrand",
		},
		{
			avatar:
				"https://sessionize.com/image/df38-400o400o2-JwbChVUj6V7DwZMc9vJEHc.jpg",
			first: "Alex",
			last: "Anderson",
			twitter: "@ralex1993",
		},
		{
			avatar:
				"https://sessionize.com/image/5578-400o400o2-BMT43t5kd2U1XstaNnM6Ax.jpg",
			first: "Kent C.",
			last: "Dodds",
			twitter: "@kentcdodds",
		},
	];

	try {
		// Insert contacts
		for (const contact of contactsData) {
			const id = `${contact.first.toLowerCase().split(" ").join("_")}-${contact.last.toLowerCase()}`;

			await db.insert(contacts).values({
				id,
				createdAt: new Date(),
				name: `${contact.first} ${contact.last}`,
				avatar: contact.avatar,
				twitter: contact.twitter,
				favorite: false,
			});

			console.log(`Added contact: ${contact.first} ${contact.last}`);
		}

		// Sample gallery data
		const galleryData = [
			{
				id: "gallery-1",
				name: "Nature Collection",
				url: "https://example.com/gallery/nature",
				description: "Beautiful nature photographs from around the world",
				recommended: true
			},
			{
				id: "gallery-2",
				name: "Urban Landscapes",
				url: "https://example.com/gallery/urban",
				description: "City scenes and architecture",
				recommended: false
			},
			{
				id: "gallery-3",
				name: "Abstract Art",
				url: "https://example.com/gallery/abstract",
				description: "Modern abstract art pieces",
				recommended: true
			}
		];

		// Insert gallery items
		for (const item of galleryData) {
			await db.insert(gallery).values({
				id: item.id,
				createdAt: new Date(),
				name: item.name,
				url: item.url,
				description: item.description,
				recommended: item.recommended
			});

			console.log(`Added gallery item: ${item.name}`);
		}

		// Sample exhibition data
		const exhibitionData = [
			{
				id: "exhibition-1",
				name: "Modern Masters",
				description: "A collection of works by contemporary masters",
				startDate: "2025-05-01",
				endDate: "2025-06-30",
				privateViewStartDate: "2025-04-28",
				privateViewEndDate: "2025-04-30",
				galleryId: "gallery-1",
				url: "https://example.com/exhibitions/modern-masters",
				recommended: true
			},
			{
				id: "exhibition-2",
				name: "Urban Perspectives",
				description: "Exploring city life through various art forms",
				startDate: "2025-07-15",
				endDate: "2025-09-10",
				privateViewStartDate: "2025-07-12",
				privateViewEndDate: "2025-07-14",
				galleryId: "gallery-2",
				url: "https://example.com/exhibitions/urban-perspectives",
				recommended: false
			},
			{
				id: "exhibition-3",
				name: "Abstract Expressions",
				description: "A journey through abstract expressionism",
				startDate: "2025-10-01",
				endDate: "2025-11-30",
				privateViewStartDate: "2025-09-28",
				privateViewEndDate: "2025-09-30",
				galleryId: "gallery-3",
				url: "https://example.com/exhibitions/abstract-expressions",
				recommended: true
			}
		];

		// Insert exhibition items
		for (const item of exhibitionData) {
			await db.insert(exhibition).values({
				id: item.id,
				name: item.name,
				description: item.description,
				startDate: new Date(item.startDate),
				endDate: new Date(item.endDate),
				privateViewStartDate: new Date(item.privateViewStartDate),
				privateViewEndDate: new Date(item.privateViewEndDate),
				createdAt: new Date(),
				updatedAt: new Date(),
				galleryId: item.galleryId,
				url: item.url,
				recommended: item.recommended
			});

			console.log(`Added exhibition: ${item.name}`);
		}

		console.log("Database seeded successfully!");
	} catch (error) {
		console.error("Error inserting data:", error);
		throw error;
	} finally {
		// Close the client
		if (migrationClient) {
			await migrationClient.end();
		}
		// Exit the process
		process.exit(0);
	}
}

// Run the seed function
seed().catch((e) => {
	console.error("Error seeding database:", e);
	process.exit(1);
});
