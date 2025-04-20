import { MongoClient, ServerApiVersion, Db } from "mongodb";

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

const uri = process.env.MONGO_URI
const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
}

let client: MongoClient | null = null;
let db: Db | null = null;

if (process.env.NODE_ENV === "development") {
    let globalWithMongo = global as typeof globalThis & {
        _mongoClient?: MongoClient
    }

    if (!globalWithMongo._mongoClient) {
        globalWithMongo._mongoClient = new MongoClient(MONGO_URI, options);
    }
    client = globalWithMongo._mongoClient;
} else {
    client = new MongoClient(MONGO_URI, options);
}

export default client;

// async function connect(): Promise<Db> {
//     if (!client) {
//         client = new MongoClient(MONGO_URI);
//         await client.connect();
//     }
//     return client.db(DB_NAME);
// }

export async function getClient(): Promise<MongoClient> {
    if (!client) {
        client = new MongoClient(MONGO_URI);
        await client.connect();
    }
    return client;
}

// export default async function getCollection(collectionName: string) {
//     if (!db) {
//         db = await connect();
//     }
//     return db.collection(collectionName);
// }

// export { client, db };