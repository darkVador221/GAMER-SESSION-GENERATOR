const { MongoClient } = require('mongodb');
const crypto = require('crypto');
require('dotenv').config();

class SessionManager {
  constructor() {
    if (!process.env.SESSION_KEY || process.env.SESSION_KEY.length !== 64) {
      throw new Error("SESSION_KEY invalide (64 hex)");
    }
    this.client = new MongoClient(process.env.MONGODB_URI);
    this.db = null;
  }
  async connect() {
    await this.client.connect();
    this.db = this.client.db('GAMER-XMD').collection('sessions');
  }
  async saveSession(data) {
    const id = crypto.randomBytes(16).toString('hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.SESSION_KEY, 'hex'), iv);
    let enc = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    enc += cipher.final('hex');
    await this.db.insertOne({ _id: id, data: iv.toString('hex') + ':' + enc, createdAt: new Date() });
    return id;
  }
}
module.exports = new SessionManager();