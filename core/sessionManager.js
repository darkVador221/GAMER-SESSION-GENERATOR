const { MongoClient } = require('mongodb');
const crypto = require('crypto');
require('dotenv').config();

class SessionManager {
  constructor() {
    if (!process.env.SESSION_KEY || process.env.SESSION_KEY.length !== 64) {
      throw new Error("SESSION_KEY invalide (64 hex chars requis)");
    }
    this.uri = process.env.MONGODB_URI;
    this.client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    this.dbName = 'GAMER-XMD';
    this.collectionName = 'sessions';
    this.db = null;
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    console.log(`✅ MongoDB connecté à ${this.dbName}`);
  }

  async saveSession(sessionData) {
    if (!this.db) throw new Error("DB non initialisée");
    const id = crypto.randomBytes(16).toString('hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.SESSION_KEY, 'hex'), iv);
    let encrypted = cipher.update(JSON.stringify(sessionData), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    await this.db.collection(this.collectionName).insertOne({
      _id: id,
      data: iv.toString('hex') + ':' + encrypted,
      createdAt: new Date()
    });
    return id;
  }
}

module.exports = new SessionManager();