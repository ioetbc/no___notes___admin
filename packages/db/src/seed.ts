import { createDb, contacts } from './index.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

// PostgreSQL connection configuration
const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'no_notes_admin'}`;

// Use a direct connection for migrations
const migrationClient = postgres(connectionString, { max: 1 });
const migrationDb = drizzle(migrationClient);

async function seed() {
  console.log('Seeding database with contacts...');

  // Get the regular DB connection for data operations
  const db = createDb();
  
  try {
    // Ensure table exists with proper schema
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
    
    // Clear existing data
    await db.delete(contacts);
    console.log('Cleared existing contacts data');
  } catch (error) {
    console.error('Error setting up table:', error);
  }
  
  // Original contact data from data.ts
  const contactsData = [
    {
      avatar: "https://sessionize.com/image/124e-400o400o2-wHVdAuNaxi8KJrgtN3ZKci.jpg",
      first: "Shruti",
      last: "Kapoor",
      twitter: "@shrutikapoor08",
    },
    {
      avatar: "https://sessionize.com/image/1940-400o400o2-Enh9dnYmrLYhJSTTPSw3MH.jpg",
      first: "Glenn",
      last: "Reyes",
      twitter: "@glnnrys",
    },
    {
      avatar: "https://sessionize.com/image/9273-400o400o2-3tyrUE3HjsCHJLU5aUJCja.jpg",
      first: "Ryan",
      last: "Florence",
    },
    {
      avatar: "https://sessionize.com/image/d14d-400o400o2-pyB229HyFPCnUcZhHf3kWS.png",
      first: "Oscar",
      last: "Newman",
      twitter: "@__oscarnewman",
    },
    {
      avatar: "https://sessionize.com/image/fd45-400o400o2-fw91uCdGU9hFP334dnyVCr.jpg",
      first: "Michael",
      last: "Jackson",
    },
    {
      avatar: "https://sessionize.com/image/b07e-400o400o2-KgNRF3S9sD5ZR4UsG7hG4g.jpg",
      first: "Christopher",
      last: "Chedeau",
      twitter: "@Vjeux",
    },
    {
      avatar: "https://sessionize.com/image/262f-400o400o2-UBPQueK3fayaCmsyUc1Ljf.jpg",
      first: "Cameron",
      last: "Matheson",
      twitter: "@cmatheson",
    },
    {
      avatar: "https://sessionize.com/image/820b-400o400o2-Ja1KDrBAu5NzYTPLSC3GW8.jpg",
      first: "Brooks",
      last: "Lybrand",
      twitter: "@BrooksLybrand",
    },
    {
      avatar: "https://sessionize.com/image/df38-400o400o2-JwbChVUj6V7DwZMc9vJEHc.jpg",
      first: "Alex",
      last: "Anderson",
      twitter: "@ralex1993",
    },
    {
      avatar: "https://sessionize.com/image/5578-400o400o2-BMT43t5kd2U1XstaNnM6Ax.jpg",
      first: "Kent C.",
      last: "Dodds",
      twitter: "@kentcdodds",
    }
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
        favorite: false
      });
      
      console.log(`Added contact: ${contact.first} ${contact.last}`);
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error inserting data:', error);
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
seed().catch(e => {
  console.error('Error seeding database:', e);
  process.exit(1);
});