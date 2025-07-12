// sessionManager.js
const EventEmitter = require('events');
class SessionManager extends EventEmitter {
  constructor() {
    super();
    this.sessions = {};
  }
  
  save(id, sessionData) {
    this.sessions[id] = sessionData;
    this.emit('saved', id);
  }

  get(id) {
    return this.sessions[id];
  }
}

module.exports = new SessionManager();