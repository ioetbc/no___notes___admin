import { sql } from 'drizzle-orm';
import { createDb, contacts } from './index.js';

const db = createDb();

async function seed() {
  console.log('Seeding database with contacts...');
  
  // First, create the contacts table if it doesn't exist
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      twitter TEXT,
      notes TEXT,
      favorite INTEGER DEFAULT 0
    )
  `);
  
  // Clear existing data
  await db.delete(contacts);
  
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
}

seed().catch(e => {
  console.error('Error seeding database:', e);
  process.exit(1);
});