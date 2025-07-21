import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

let db: any = null;
let SQL: any = null;
let dbInitialized = false;
let dbLock: Promise<void> = Promise.resolve();

// Database locking mechanism to prevent race conditions
function withDbLock<T>(operation: () => Promise<T>): Promise<T> {
  dbLock = dbLock.then(async () => {
    try {
      return await operation();
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  });
  return dbLock as Promise<T>;
}

// Initialize SQL.js database with proper locking
async function initDB() {
  if (dbInitialized && db) {
    return db;
  }

  if (!SQL) {
    SQL = await initSqlJs();
  }
  
  const dbPath = join(process.cwd(), 'data.db');
  
  try {
    if (existsSync(dbPath)) {
      const filebuffer = readFileSync(dbPath);
      db = new SQL.Database(filebuffer);
    } else {
      db = new SQL.Database();
      createTables();
      saveDatabase();
    }
    dbInitialized = true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Fallback to in-memory database
    db = new SQL.Database();
    createTables();
    dbInitialized = true;
  }
  
  return db;
}

function saveDatabase() {
  if (db) {
    try {
      const dbPath = join(process.cwd(), 'data.db');
      const data = db.export();
      const buffer = Buffer.from(data);
      writeFileSync(dbPath, buffer);
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }
}

function createTables() {
  if (!db) return;
  
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        providerAccountId TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        UNIQUE(provider, providerAccountId)
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        sessionToken TEXT UNIQUE NOT NULL,
        userId TEXT NOT NULL,
        expires DATETIME NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        emailVerified DATETIME,
        image TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires DATETIME NOT NULL,
        UNIQUE(identifier, token)
      );

      CREATE TABLE IF NOT EXISTS journals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        mood INTEGER NOT NULL,
        userId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS moods (
        id TEXT PRIMARY KEY,
        value INTEGER NOT NULL,
        note TEXT,
        userId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        isUser BOOLEAN NOT NULL,
        chatSessionId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (error) {
    console.error('Failed to create tables:', error);
  }
}

// Helper function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Database operations with proper locking
export const dbOperations = {
  // User operations
  createUser: async (user: { name?: string; email: string; image?: string }) => {
    return withDbLock(async () => {
      await initDB();
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO users (id, name, email, image)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run([id, user.name || null, user.email, user.image || null]);
      saveDatabase();
      return { id, ...user };
    });
  },

  getUserByEmail: async (email: string) => {
    return withDbLock(async () => {
      await initDB();
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const result = stmt.getAsObject([email]);
      return Object.keys(result).length > 0 ? result : null;
    });
  },

  getUserById: async (id: string) => {
    return withDbLock(async () => {
      await initDB();
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      const result = stmt.getAsObject([id]);
      return Object.keys(result).length > 0 ? result : null;
    });
  },

  // Account operations
  createAccount: async (account: any) => {
    return withDbLock(async () => {
      await initDB();
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO accounts (id, userId, type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([
        id,
        account.userId,
        account.type,
        account.provider,
        account.providerAccountId,
        account.refresh_token || null,
        account.access_token || null,
        account.expires_at || null,
        account.token_type || null,
        account.scope || null,
        account.id_token || null,
        account.session_state || null
      ]);
      saveDatabase();
      return { id, ...account };
    });
  },

  getAccountByProviderAndProviderAccountId: async (provider: string, providerAccountId: string) => {
    return withDbLock(async () => {
      await initDB();
      const stmt = db.prepare('SELECT * FROM accounts WHERE provider = ? AND providerAccountId = ?');
      const result = stmt.getAsObject([provider, providerAccountId]);
      return Object.keys(result).length > 0 ? result : null;
    });
  },

  // Session operations
  createSession: async (session: { sessionToken: string; userId: string; expires: Date }) => {
    return withDbLock(async () => {
      await initDB();
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO sessions (id, sessionToken, userId, expires)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run([id, session.sessionToken, session.userId, session.expires.toISOString()]);
      saveDatabase();
      return { id, ...session };
    });
  },

  getSessionAndUser: async (sessionToken: string) => {
    return withDbLock(async () => {
      await initDB();
      const stmt = db.prepare(`
        SELECT s.*, u.* FROM sessions s
        JOIN users u ON s.userId = u.id
        WHERE s.sessionToken = ? AND s.expires > datetime('now')
      `);
      const result = stmt.getAsObject([sessionToken]);
      return Object.keys(result).length > 0 ? result : null;
    });
  },

  updateSession: async (sessionToken: string, session: { expires: Date }) => {
    return withDbLock(async () => {
      await initDB();
      const stmt = db.prepare(`
        UPDATE sessions SET expires = ? WHERE sessionToken = ?
      `);
      stmt.run([session.expires.toISOString(), sessionToken]);
      saveDatabase();
      return session;
    });
  },

  deleteSession: async (sessionToken: string) => {
    return withDbLock(async () => {
      await initDB();
      const stmt = db.prepare('DELETE FROM sessions WHERE sessionToken = ?');
      stmt.run([sessionToken]);
      saveDatabase();
    });
  },

  // Journal operations
  createJournal: async (journal: { title: string; content: string; mood: number; userId: string }) => {
    return withDbLock(async () => {
      await initDB();
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO journals (id, title, content, mood, userId)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run([id, journal.title, journal.content, journal.mood, journal.userId]);
      saveDatabase();
      return { id, ...journal, createdAt: new Date(), updatedAt: new Date() };
    });
  },

  getJournalsByUserId: async (userId: string) => {
    return withDbLock(async () => {
      await initDB();
      const stmt = db.prepare(`
        SELECT * FROM journals WHERE userId = ? ORDER BY createdAt DESC
      `);
      stmt.bind([userId]);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      return results;
    });
  },

  // Mood operations
  createMood: async (mood: { value: number; note?: string; userId: string }) => {
    return withDbLock(async () => {
      await initDB();
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO moods (id, value, note, userId)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run([id, mood.value, mood.note || null, mood.userId]);
      saveDatabase();
      return { id, ...mood, createdAt: new Date() };
    });
  },

  getMoodsByUserId: async (userId: string) => {
    return withDbLock(async () => {
      await initDB();
      const stmt = db.prepare(`
        SELECT * FROM moods WHERE userId = ? ORDER BY createdAt DESC
      `);
      stmt.bind([userId]);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      return results;
    });
  },

  // Chat operations
  createChatSession: async (userId: string) => {
    return withDbLock(async () => {
      await initDB();
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO chat_sessions (id, userId)
        VALUES (?, ?)
      `);
      stmt.run([id, userId]);
      saveDatabase();
      return { id, userId, createdAt: new Date(), updatedAt: new Date() };
    });
  },

  createChatMessage: async (message: { content: string; isUser: boolean; chatSessionId: string }) => {
    return withDbLock(async () => {
      await initDB();
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO chat_messages (id, content, isUser, chatSessionId)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run([id, message.content, message.isUser ? 1 : 0, message.chatSessionId]);
      saveDatabase();
      return { id, ...message, createdAt: new Date() };
    });
  },

  getChatMessages: async (chatSessionId: string) => {
    return withDbLock(async () => {
      await initDB();
      const stmt = db.prepare(`
        SELECT * FROM chat_messages WHERE chatSessionId = ? ORDER BY createdAt ASC
      `);
      stmt.bind([chatSessionId]);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      return results;
    });
  },

  getChatSessionsByUserId: async (userId: string) => {
    return withDbLock(async () => {
      await initDB();
      const stmt = db.prepare(`
        SELECT * FROM chat_sessions WHERE userId = ? ORDER BY updatedAt DESC
      `);
      stmt.bind([userId]);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      return results;
    });
  }
};