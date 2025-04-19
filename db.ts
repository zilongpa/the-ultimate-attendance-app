
import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI as string;
if (!MONGO_URI) {
    throw new Error("MongoDB URI is not defined in environment variables.");
}

const DB_NAME = "attendance-app";
// User collection: contains user name, email, and role.
export const USER_COLLECTION = "user-collection";
// Attendance collection: contains attendance records for each user.
// Each record contains user email and date.
export const ATTENDANCE_COLLECTION = "attendance-collection";

let client: MongoClient | null = null;
let db: Db | null = null;

async function connect(): Promise<Db> {
    if (!client) {
        client = new MongoClient(MONGO_URI)
        await client.connect();
    }
    return client.db(DB_NAME);
}

export default async function getCollection(collectionName: string) {
    if (!db) {
        db = await connect();
    }
    return db.collection(collectionName);
}