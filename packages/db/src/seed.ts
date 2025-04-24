import { sql } from "drizzle-orm";
import postgres from "postgres";
import {
	type NewArtist,
	type NewContact,
	type NewExhibition,
	type NewExhibitionArtist,
	type NewGallery,
	type NewImage,
	artists,
	contacts,
	createDb,
	exhibition,
	exhibition_artists,
	gallery,
	images,
} from "./index.js";

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
        id SERIAL PRIMARY KEY,
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
        id SERIAL PRIMARY KEY,
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
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        private_view_start_date DATE,
        private_view_end_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        gallery_id INT REFERENCES gallery(id),
        url TEXT,
        recommended BOOLEAN DEFAULT FALSE
      )
    `);

		// Ensure artists table exists with proper schema
		await db.execute(sql`
      CREATE TABLE IF NOT EXISTS artists (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        instagram_handle TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

		// Ensure exhibition_artists join table exists with proper schema
		await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exhibition_artists (
        exhibition_id INT NOT NULL REFERENCES exhibition(id),
        artist_id INT NOT NULL REFERENCES artists(id),
        PRIMARY KEY (exhibition_id, artist_id)
      )
    `);

		// Ensure images table exists with proper schema
		await db.execute(sql`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        exhibition_id INT NOT NULL REFERENCES exhibition(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        caption TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

		// Clear existing data in proper order to respect foreign keys
		await db.delete(images);
		await db.delete(exhibition_artists);
		await db.delete(exhibition);
		await db.delete(artists);
		await db.delete(gallery);
		await db.delete(contacts);
		console.log("Cleared existing data from all tables");
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
			await db.insert(contacts).values({
				name: `${contact.first} ${contact.last}`,
				avatar: contact.avatar,
				twitter: contact.twitter,
				favorite: false,
			} satisfies NewContact);

			console.log(`Added contact: ${contact.first} ${contact.last}`);
		}

		// Sample gallery data
		const galleryData = [
			{
				id: "gallery-1",
				name: "Nature Collection",
				url: "https://example.com/gallery/nature",
				description: "Beautiful nature photographs from around the world",
				recommended: true,
			},
			{
				id: "gallery-2",
				name: "Urban Landscapes",
				url: "https://example.com/gallery/urban",
				description: "City scenes and architecture",
				recommended: false,
			},
			{
				id: "gallery-3",
				name: "Abstract Art",
				url: "https://example.com/gallery/abstract",
				description: "Modern abstract art pieces",
				recommended: true,
			},
		];

		// Insert gallery items
		const galleryMap: Record<string, number> = {}; // To track generated IDs

		for (const item of galleryData) {
			const result = await db
				.insert(gallery)
				.values({
					created_at: new Date(),
					name: item.name,
					url: item.url,
					description: item.description,
					recommended: item.recommended,
				} satisfies NewGallery)
				.returning({ id: gallery.id });

			// Store the mapping from the original ID to the generated one
			galleryMap[item.id] = result[0].id;
			console.log(`Mapped ${item.id} to actual ID: ${result[0].id}`);

			console.log(`Added gallery item: ${item.name}`);
		}

		// Sample exhibition data
		const exhibitionData = [
			{
				id: "exhibition-1",
				name: "Modern Masters",
				description: "A collection of works by contemporary masters",
				start_date: "2025-05-01",
				end_date: "2025-06-30",
				private_view_start_date: "2025-04-28",
				private_view_end_date: "2025-04-30",
				gallery_id: "gallery-1",
				url: "https://example.com/exhibitions/modern-masters",
				recommended: true,
			},
			{
				id: "exhibition-2",
				name: "Urban Perspectives",
				description: "Exploring city life through various art forms",
				start_date: "2025-07-15",
				end_date: "2025-09-10",
				private_view_start_date: "2025-07-12",
				private_view_end_date: "2025-07-14",
				gallery_id: "gallery-2",
				url: "https://example.com/exhibitions/urban-perspectives",
				recommended: false,
			},
			{
				id: "exhibition-3",
				name: "Abstract Expressions",
				description: "A journey through abstract expressionism",
				start_date: "2025-10-01",
				end_date: "2025-11-30",
				private_view_start_date: "2025-09-28",
				private_view_end_date: "2025-09-30",
				gallery_id: "gallery-3",
				url: "https://example.com/exhibitions/abstract-expressions",
				recommended: true,
			},
		];

		// Insert exhibition items
		const exhibitionMap: Record<string, number> = {}; // To track generated IDs

		for (const item of exhibitionData) {
			const result = await db
				.insert(exhibition)
				.values({
					name: item.name,
					description: item.description,
					start_date: new Date(item.start_date),
					end_date: new Date(item.end_date),
					private_view_start_date: new Date(item.private_view_start_date),
					private_view_end_date: new Date(item.private_view_end_date),
					created_at: new Date(),
					updated_at: new Date(),
					gallery_id: galleryMap[item.gallery_id],
					url: item.url,
					recommended: item.recommended,
				} satisfies NewExhibition)
				.returning({ id: exhibition.id });

			// Store the mapping from the original ID to the generated one
			exhibitionMap[item.id] = result[0].id;
			console.log(`Mapped ${item.id} to actual ID: ${result[0].id}`);

			console.log(`Added exhibition: ${item.name}`);
		}

		// Sample artists data
		const artistsData = [
			{
				id: "artist-1",
				name: "Jane Smith",
				instagram_handle: "@janesmith_art",
			},
			{
				id: "artist-2",
				name: "John Doe",
				instagram_handle: "@johndoe_creates",
			},
			{
				id: "artist-3",
				name: "Alex Johnson",
				instagram_handle: "@alexj_artist",
			},
			{
				id: "artist-4",
				name: "Maria Garcia",
				instagram_handle: "@maria_garcia_art",
			},
			{
				id: "artist-5",
				name: "David Kim",
				instagram_handle: "@david_kim_studio",
			},
		];

		// Insert artists
		const artistMap: Record<string, number> = {}; // To track generated IDs

		for (const artist of artistsData) {
			const result = await db
				.insert(artists)
				.values({
					name: artist.name,
					instagram_handle: artist.instagram_handle,
					created_at: new Date(),
				} satisfies NewArtist)
				.returning({ id: artists.id });

			// Store the mapping from the original ID to the generated one
			artistMap[artist.id] = result[0].id;
			console.log(`Mapped ${artist.id} to actual ID: ${result[0].id}`);

			console.log(`Added artist: ${artist.name}`);
		}

		// Sample exhibition-artist relationships
		const exhibitionArtistsData = [
			{ exhibition_id: "exhibition-1", artist_id: "artist-1" },
			{ exhibition_id: "exhibition-1", artist_id: "artist-2" },
			{ exhibition_id: "exhibition-2", artist_id: "artist-2" },
			{ exhibition_id: "exhibition-2", artist_id: "artist-3" },
			{ exhibition_id: "exhibition-2", artist_id: "artist-4" },
			{ exhibition_id: "exhibition-3", artist_id: "artist-1" },
			{ exhibition_id: "exhibition-3", artist_id: "artist-3" },
			{ exhibition_id: "exhibition-3", artist_id: "artist-5" },
		];

		// Insert exhibition-artist relationships
		for (const relation of exhibitionArtistsData) {
			await db.insert(exhibition_artists).values({
				exhibition_id: exhibitionMap[relation.exhibition_id],
				artist_id: artistMap[relation.artist_id],
			} satisfies NewExhibitionArtist);

			console.log(
				`Added relationship: Exhibition ${exhibitionMap[relation.exhibition_id]} - Artist ${artistMap[relation.artist_id]}`,
			);
		}

		// Sample images data
		const imagesData = [
			{
				exhibition_id: "exhibition-1",
				image_url:
					"https://sessionize.com/image/5578-400o400o2-BMT43t5kd2U1XstaNnM6Ax.jpg",
				caption: "Opening night at Modern Masters",
			},
			{
				exhibition_id: "exhibition-1",
				image_url:
					"https://sessionize.com/image/df38-400o400o2-JwbChVUj6V7DwZMc9vJEHc.jpg",
				caption: "Featured artwork by Jane Smith",
			},
			{
				exhibition_id: "exhibition-1",
				image_url:
					"https://sessionize.com/image/124e-400o400o2-wHVdAuNaxi8KJrgtN3ZKci.jpg",
				caption: "Gallery view of the main hall",
			},
			{
				exhibition_id: "exhibition-2",
				image_url:
					"https://sessionize.com/image/1940-400o400o2-Enh9dnYmrLYhJSTTPSw3MH.jpg",
				caption: "Urban Perspectives installation view",
			},
			{
				exhibition_id: "exhibition-2",
				image_url:
					"https://sessionize.com/image/9273-400o400o2-3tyrUE3HjsCHJLU5aUJCja.jpg",
				caption: "City skyline artwork by John Doe",
			},
			{
				exhibition_id: "exhibition-3",
				image_url:
					"https://sessionize.com/image/d14d-400o400o2-pyB229HyFPCnUcZhHf3kWS.png",
				caption: "Abstract Expressions - main gallery",
			},
			{
				exhibition_id: "exhibition-3",
				image_url:
					"https://sessionize.com/image/fd45-400o400o2-fw91uCdGU9hFP334dnyVCr.jpg",
				caption: "Featured abstract painting by David Kim",
			},
			{
				exhibition_id: "exhibition-3",
				image_url:
					"https://sessionize.com/image/b07e-400o400o2-KgNRF3S9sD5ZR4UsG7hG4g.jpg",
				caption: "Visitors engaging with interactive installation",
			},
		];

		// Insert images
		for (const image of imagesData) {
			await db.insert(images).values({
				exhibition_id: exhibitionMap[image.exhibition_id],
				image_url: image.image_url,
				caption: image.caption,
				created_at: new Date(),
			} satisfies NewImage);

			console.log(`Added image for exhibition: ${image.exhibition_id}`);
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
