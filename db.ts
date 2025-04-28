// db.ts
import { MongoClient, ServerApiVersion, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI as string;
if (!MONGO_URI) {
  throw new Error("MongoDB URI is not defined in environment variables.");
}

const DB_NAME = "attendance-app";

// Collection names
export const USER_COLLECTION = "user-collection";
// Attendance collection: contains attendance records for each user.
// Each record contains user email and date.
export const ATTENDANCE_COLLECTION = "attendance-collection";

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient | null = null;
let db: Db | null = null;

// Reuse client across hot reloads in development
if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & { _mongoClient?: MongoClient };
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(MONGO_URI, options);
  }
  client = globalWithMongo._mongoClient;
} else {
  client = new MongoClient(MONGO_URI, options);
}

// Returns a connected MongoClient
export async function getClient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(MONGO_URI, options);
    await client.connect();
  }
  return client;
}

// Returns the Db instance for "attendance-app"
export async function getDb(): Promise<Db> {
  if (!db) {
    const _client = await getClient();
    db = _client.db(DB_NAME);
  }
  return db;
}

// Returns a typed collection reference
export async function getCollection<T>(collectionName: string) {
  const database = await getDb();
  return database.collection<T>(collectionName);
}

// Default export in case you still want raw client
export default client;
