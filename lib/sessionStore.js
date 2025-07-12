const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = 'GAMER-XMD';
const collection = 'baileys_sessions';

async function connect() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    return { db, client };
}

async function saveSession(phone, userId) {
    const { db, client } = await connect();
    await db.collection(collection).updateOne(
        { phone },
        { $set: { phone, userId, createdAt: new Date() } },
        { upsert: true }
    );
    client.close();
}

async function getSessions() {
    const { db, client } = await connect();
    const data = await db.collection(collection).find().toArray();
    client.close();
    return data;
}

async function deleteSession(phone) {
    const { db, client } = await connect();
    await db.collection(collection).deleteOne({ phone });
    client.close();
}

module.exports = {
    saveSession,
    getSessions,
    deleteSession
};
