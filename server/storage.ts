import { 
  users, 
  journalEntries, 
  moodEntries, 
  chatMessages,
  type User, 
  type InsertUser,
  type UpdateProfile,
  type JournalEntry,
  type InsertJournalEntry,
  type MoodEntry,
  type InsertMoodEntry,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, profile: UpdateProfile): Promise<User | undefined>;

  // Journal entry methods
  getJournalEntries(userId: number): Promise<JournalEntry[]>;
  getJournalEntry(id: number, userId: number): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry & { userId: number }): Promise<JournalEntry>;
  updateJournalEntry(id: number, userId: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number, userId: number): Promise<boolean>;
  searchJournalEntries(userId: number, query: string, filters?: {
    mood?: string;
    dateRange?: string;
    tags?: string[];
  }): Promise<JournalEntry[]>;

  // Mood entry methods
  getMoodEntries(userId: number): Promise<MoodEntry[]>;
  createMoodEntry(entry: InsertMoodEntry & { userId: number }): Promise<MoodEntry>;
  getRecentMoodEntries(userId: number, limit: number): Promise<MoodEntry[]>;
  getMoodStats(userId: number): Promise<{
    averageScore: number;
    streak: number;
    totalEntries: number;
  }>;

  // Chat message methods
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage & { userId: number }): Promise<ChatMessage>;
  clearChatHistory(userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private journalEntries: Map<number, JournalEntry>;
  private moodEntries: Map<number, MoodEntry>;
  private chatMessages: Map<number, ChatMessage>;
  private currentUserId: number;
  private currentJournalId: number;
  private currentMoodId: number;
  private currentChatId: number;

  constructor() {
    this.users = new Map();
    this.journalEntries = new Map();
    this.moodEntries = new Map();
    this.chatMessages = new Map();
    this.currentUserId = 1;
    this.currentJournalId = 1;
    this.currentMoodId = 1;
    this.currentChatId = 1;

    // Create a default user for simplicity
    this.createUser({ username: "demo", password: "demo" });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      name: null,
      dateOfBirth: null,
      weight: null,
      height: null,
      family: null,
      relationshipStatus: null,
      ambition: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProfile(id: number, profile: UpdateProfile): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }

    const updatedUser: User = {
      ...user,
      ...profile,
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getJournalEntry(id: number, userId: number): Promise<JournalEntry | undefined> {
    const entry = this.journalEntries.get(id);
    return entry && entry.userId === userId ? entry : undefined;
  }

  async createJournalEntry(entry: InsertJournalEntry & { userId: number }): Promise<JournalEntry> {
    const id = this.currentJournalId++;
    const now = new Date();
    const journalEntry: JournalEntry = {
      id,
      userId: entry.userId,
      title: entry.title || null,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags || null,
      createdAt: now,
      updatedAt: now,
    };
    this.journalEntries.set(id, journalEntry);
    return journalEntry;
  }

  async updateJournalEntry(id: number, userId: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const existing = this.journalEntries.get(id);
    if (!existing || existing.userId !== userId) {
      return undefined;
    }

    const updated: JournalEntry = {
      ...existing,
      ...entry,
      updatedAt: new Date(),
    };
    this.journalEntries.set(id, updated);
    return updated;
  }

  async deleteJournalEntry(id: number, userId: number): Promise<boolean> {
    const entry = this.journalEntries.get(id);
    if (!entry || entry.userId !== userId) {
      return false;
    }
    return this.journalEntries.delete(id);
  }

  async searchJournalEntries(userId: number, query: string, filters?: {
    mood?: string;
    dateRange?: string;
    tags?: string[];
  }): Promise<JournalEntry[]> {
    const entries = await this.getJournalEntries(userId);
    
    return entries.filter(entry => {
      // Text search
      const matchesQuery = query === "" || 
        entry.content.toLowerCase().includes(query.toLowerCase()) ||
        (entry.title && entry.title.toLowerCase().includes(query.toLowerCase()));

      // Mood filter
      const matchesMood = !filters?.mood || entry.mood === filters.mood;

      // Tags filter
      const matchesTags = !filters?.tags?.length || 
        filters.tags.some(tag => entry.tags?.includes(tag));

      // Date range filter
      let matchesDate = true;
      if (filters?.dateRange) {
        const entryDate = new Date(entry.createdAt);
        const now = new Date();
        
        switch (filters.dateRange) {
          case "today":
            matchesDate = entryDate.toDateString() === now.toDateString();
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = entryDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            matchesDate = entryDate >= monthAgo;
            break;
          case "year":
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            matchesDate = entryDate >= yearAgo;
            break;
        }
      }

      return matchesQuery && matchesMood && matchesTags && matchesDate;
    });
  }

  async getMoodEntries(userId: number): Promise<MoodEntry[]> {
    return Array.from(this.moodEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createMoodEntry(entry: InsertMoodEntry & { userId: number }): Promise<MoodEntry> {
    const id = this.currentMoodId++;
    const moodEntry: MoodEntry = {
      id,
      userId: entry.userId,
      mood: entry.mood,
      score: entry.score,
      notes: entry.notes || null,
      createdAt: new Date(),
    };
    this.moodEntries.set(id, moodEntry);
    return moodEntry;
  }

  async getRecentMoodEntries(userId: number, limit: number): Promise<MoodEntry[]> {
    const entries = await this.getMoodEntries(userId);
    return entries.slice(0, limit);
  }

  async getMoodStats(userId: number): Promise<{
    averageScore: number;
    streak: number;
    totalEntries: number;
  }> {
    const entries = await this.getMoodEntries(userId);
    
    if (entries.length === 0) {
      return { averageScore: 0, streak: 0, totalEntries: 0 };
    }

    const averageScore = entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length;
    
    // Calculate streak (consecutive days with mood entries)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      streak,
      totalEntries: entries.length,
    };
  }

  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createChatMessage(message: InsertChatMessage & { userId: number }): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const chatMessage: ChatMessage = {
      ...message,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async clearChatHistory(userId: number): Promise<boolean> {
    const messagesToDelete = Array.from(this.chatMessages.entries())
      .filter(([_, message]) => message.userId === userId)
      .map(([id, _]) => id);
    
    messagesToDelete.forEach(id => this.chatMessages.delete(id));
    return true;
  }
}

export const storage = new MemStorage();
