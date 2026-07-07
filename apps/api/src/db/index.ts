import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import path from 'path';

// Forces the app to look directly inside apps/api/.env 
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); 

const connectionString = process.env.DATABASE_URL;

// Throw an early error if the env file wasn't found or loaded
if (!connectionString) {
  throw new Error("❌ DATABASE_URL is not defined. Please check your .env file.");
}

// Create the connection query client
const client = postgres(connectionString);

// Explicitly bind the schema object so db.query.[table].findFirst works!
export const db = drizzle(client, { schema });