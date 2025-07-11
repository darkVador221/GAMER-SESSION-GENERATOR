const { MongoClient } = require('mongodb');
const crypto = require('crypto');
require('dotenv').config();

class SessionManager {
    constructor() {
        // Validation de la clé de session (32 octets = 64 caractères hex)
        if (!process.env.SESSION_KEY || process.env.SESSION_KEY.length !== 64) {
            throw new Error("❌ SESSION_KEY invalide – 32 octets requis (64 caractères hexadécimaux)");
        }

        this.uri = process.env.MONGODB_URI;
        this.dbName = 'GAMER-XMD';
        this.collectionName = 'sessions';
        this.client = new MongoClient(this.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        this.db = null;
    }

    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            console.log(`✅ Connexion MongoDB établie [DB: ${this.dbName}]`);
        } catch (err) {
            console.error("❌ Erreur de connexion MongoDB :", err.message);
            throw err;
        }
    }

    async saveSession(sessionData) {
        if (!this.db) throw new Error("❌ Database non connectée");

        const sessionId = crypto.randomBytes(16).toString('hex');
        const encrypted = this.encrypt(sessionData);

        await this.db.collection(this.collectionName).insertOne({
            _id: sessionId,
            data: encrypted,
            createdAt: new Date(),
            user: "vador2899",
            status: "active",
            bot: process.env.BOT_NAME || "GAMER-XMD"
        });

        console.log(`💾 Session sauvegardée : ${sessionId}`);
        return sessionId;
    }

    encrypt(data) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(
                'aes-256-cbc',
                Buffer.from(process.env.SESSION_KEY, 'hex'),
                iv
            );
            let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return iv.toString('hex') + ':' + encrypted;
        } catch (err) {
            console.error("❌ Erreur de chiffrement :", err.message);
            throw new Error("Échec du chiffrement de session");
        }
    }
}

module.exports = new SessionManager();