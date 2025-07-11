const { MongoClient } = require('mongodb');
const crypto = require('crypto');

class SessionManager {
    constructor() {
        this.client = new MongoClient(process.env.MONGODB_URI);
        this.dbName = 'GAMER-XMD';
        this.collectionName = 'sessions';
    }

    async connect() {
        await this.client.connect();
        this.db = this.client.db(this.dbName);
    }

    async saveSession(sessionData) {
        const sessionId = crypto.randomBytes(16).toString('hex');
        const encrypted = this.encrypt(sessionData);
        
        await this.db.collection(this.collectionName).insertOne({
            _id: sessionId,
            data: encrypted,
            createdAt: new Date()
        });

        return sessionId;
    }

    encrypt(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            Buffer.from(process.env.SESSION_KEY),
            iv
        );
        let encrypted = cipher.update(JSON.stringify(data));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
}

module.exports = new SessionManager();