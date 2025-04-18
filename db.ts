
import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI as string;
if (!MONGO_URI) {
    throw new Error("MongoDB URI is not defined in environment variables.");
}

const DB_NAME = "attendance-app";
export const USER_COLLECTION = "user-collection";
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