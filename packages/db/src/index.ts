import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

dotenv.config();

const connection_string = process.env.DATABASE_URL;

if (!connection_string) {
	throw new Error("DATABASE_URL is not set");
}

console.log("connection_string", connection_string);

export const create_db = () => {
	return drizzle(postgres(connection_string), {
		schema,
	});
};

export * from "./schema.js";
