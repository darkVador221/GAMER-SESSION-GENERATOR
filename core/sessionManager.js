const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectToDB() {
    if (!db) {
        await client.connect();
        db = client.db(process.env.DB_NAME);
        console.log('✅ Connecté à MongoDB');
    }
    return db;
}

async function saveSession(userId, sessionId) {
    const db = await connectToDB();
    const sessions = db.collection('sessions');

    await sessions.updateOne(
        { userId },
        { $set: { sessionId, updatedAt: new Date() } },
        { upsert: true }
    );

    console.log(`💾 Session sauvegardée pour ${userId}`);
}

async function getSessions() {
    const db = await connectToDB();
    return db.collection('sessions').find({}).toArray();
}

module.exports = {
    connectToDB,
    saveSession,
    getSessions
};