const { MongoClient } = require('mongodb');
const crypto = require('crypto');

class SessionManager {
    constructor() {
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
            console.log("✅ Connecté à MongoDB Atlas");
            console.log(`📊 Cluster: cluster0.qdylypu.mongodb.net`);
            console.log(`👤 Utilisateur: vador2899`);
            return true;
        } catch (err) {
            console.error("❌ Erreur connexion MongoDB:", err.message);
            throw err;
        }
    }

    async saveSession(sessionData) {
        if (!this.db) throw new Error("Database non initialisée");
        
        const sessionId = crypto.randomBytes(16).toString('hex');
        const encrypted = this.encrypt(sessionData);
        
        await this.db.collection(this.collectionName).insertOne({
            _id: sessionId,
            data: encrypted,
            createdAt: new Date(),
            user: "vador2899",
            status: "active"
        });

        return sessionId;
    }

    encrypt(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            Buffer.from(process.env.SESSION_KEY, 'hex'),
            iv
        );
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
}

module.exports = new SessionManager();