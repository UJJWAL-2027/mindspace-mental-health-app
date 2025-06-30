import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema, insertMoodEntrySchema, insertChatMessageSchema, updateProfileSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = 1; // Using default user for simplicity

  // User profile routes
  app.get("/api/profile", async (req, res) => {
    try {
      const user = await storage.getUser(DEFAULT_USER_ID);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", async (req, res) => {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile(DEFAULT_USER_ID, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  // Journal entries routes
  app.get("/api/journal-entries", async (req, res) => {
    try {
      const entries = await storage.getJournalEntries(DEFAULT_USER_ID);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal-entries", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry({
        ...validatedData,
        userId: DEFAULT_USER_ID,
      });
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid journal entry data" });
    }
  });

  app.put("/api/journal-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertJournalEntrySchema.partial().parse(req.body);
      const entry = await storage.updateJournalEntry(id, DEFAULT_USER_ID, validatedData);
      
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid journal entry data" });
    }
  });

  app.delete("/api/journal-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteJournalEntry(id, DEFAULT_USER_ID);
      
      if (!deleted) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete journal entry" });
    }
  });

  app.get("/api/search-entries", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const mood = req.query.mood as string;
      const dateRange = req.query.dateRange as string;
      const tags = req.query.tags ? (req.query.tags as string).split(",") : undefined;

      const results = await storage.searchJournalEntries(DEFAULT_USER_ID, query, {
        mood,
        dateRange,
        tags,
      });

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to search journal entries" });
    }
  });

  // Mood entries routes
  app.get("/api/mood-entries", async (req, res) => {
    try {
      const entries = await storage.getMoodEntries(DEFAULT_USER_ID);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mood entries" });
    }
  });

  app.post("/api/mood-entries", async (req, res) => {
    try {
      const validatedData = insertMoodEntrySchema.parse(req.body);
      const entry = await storage.createMoodEntry({
        ...validatedData,
        userId: DEFAULT_USER_ID,
      });
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid mood entry data" });
    }
  });

  app.get("/api/mood-stats", async (req, res) => {
    try {
      const stats = await storage.getMoodStats(DEFAULT_USER_ID);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mood stats" });
    }
  });

  // Chat routes
  app.get("/api/chat-messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(DEFAULT_USER_ID);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Save user message
      await storage.createChatMessage({
        role: "user",
        content: message,
        userId: DEFAULT_USER_ID,
      });

      // Generate supportive AI response
      let aiMessage = "I'm here to listen and support you.";
      
      // Simple rule-based responses for mental health support
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes("anxious") || lowerMessage.includes("anxiety")) {
        aiMessage = "I understand you're feeling anxious. Try taking slow, deep breaths - inhale for 4 counts, hold for 4, exhale for 6. Remember that anxiety is temporary, and you've gotten through difficult moments before. Would you like to talk about what's making you feel this way?";
      } else if (lowerMessage.includes("sad") || lowerMessage.includes("depressed") || lowerMessage.includes("down")) {
        aiMessage = "I hear that you're feeling sad, and that's okay. Your feelings are valid. Sometimes it helps to acknowledge these emotions rather than fighting them. Consider doing something small that usually brings you comfort, or reach out to someone you trust. You don't have to go through this alone.";
      } else if (lowerMessage.includes("stressed") || lowerMessage.includes("overwhelmed")) {
        aiMessage = "Feeling overwhelmed is really tough. Let's break things down - what's the most important thing you need to focus on right now? Sometimes writing down your thoughts or taking a 5-minute walk can help clear your mind. Remember, you don't have to handle everything at once.";
      } else if (lowerMessage.includes("sleep") || lowerMessage.includes("tired") || lowerMessage.includes("insomnia")) {
        aiMessage = "Sleep troubles can really affect how we feel. Try creating a calming bedtime routine - maybe some light reading, gentle stretches, or listening to calm music. Avoid screens for an hour before bed if possible. If sleep problems persist, consider talking to a healthcare professional.";
      } else if (lowerMessage.includes("breathing") || lowerMessage.includes("breathe")) {
        aiMessage = "Let's do a simple breathing exercise together: Breathe in slowly through your nose for 4 counts... hold for 4 counts... and breathe out through your mouth for 6 counts. Repeat this 4-5 times. This can help activate your body's relaxation response. How are you feeling now?";
      } else if (lowerMessage.includes("grateful") || lowerMessage.includes("thankful")) {
        aiMessage = "It's wonderful that you're thinking about gratitude. Focusing on what we're thankful for can really shift our perspective. Even small things count - maybe the taste of your morning coffee, a kind message from a friend, or simply having a moment of peace. What else are you grateful for today?";
      } else if (lowerMessage.includes("angry") || lowerMessage.includes("frustrated") || lowerMessage.includes("mad")) {
        aiMessage = "It sounds like you're dealing with some difficult emotions. Anger often tells us that something important to us feels threatened or violated. It's okay to feel this way. Try taking some deep breaths or doing some physical movement to help process these feelings. What's behind this frustration?";
      } else if (lowerMessage.includes("motivation") || lowerMessage.includes("unmotivated")) {
        aiMessage = "Feeling unmotivated happens to everyone. Start with something very small - even just making your bed or taking a shower can give you a sense of accomplishment. Break bigger tasks into tiny steps. Remember, motivation often comes after we start, not before. What's one small thing you could do right now?";
      } else if (lowerMessage.includes("lonely") || lowerMessage.includes("alone")) {
        aiMessage = "Feeling lonely can be really painful. Remember that feeling alone doesn't mean you are alone - there are people who care about you. Consider reaching out to a friend, family member, or even engaging in online communities. Sometimes even a brief interaction with a neighbor or store clerk can help. You matter, and your feelings are valid.";
      } else if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
        aiMessage = "I'm glad you're reaching out for support - that takes courage. While I can offer some general guidance and a listening ear, please remember that if you're dealing with serious mental health concerns, it's important to speak with a mental health professional. In the meantime, I'm here to listen. What's on your mind?";
      } else {
        // General supportive responses
        const responses = [
          "Thank you for sharing that with me. It sounds like you're going through something important. How are you feeling about everything right now?",
          "I appreciate you opening up. Your thoughts and feelings matter. Is there anything specific you'd like to explore or talk through?",
          "It sounds like you have a lot on your mind. Sometimes just talking about things can help us process them better. What feels most important to you right now?",
          "I'm here to listen and support you. Take your time - there's no rush. What would be most helpful for you in this moment?",
          "Thank you for trusting me with your thoughts. Everyone's journey is unique, and it's okay to feel however you're feeling right now. What's been on your mind lately?"
        ];
        aiMessage = responses[Math.floor(Math.random() * responses.length)];
      }

      // Save AI response
      const savedMessage = await storage.createChatMessage({
        role: "assistant",
        content: aiMessage,
        userId: DEFAULT_USER_ID,
      });

      res.json(savedMessage);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  app.delete("/api/chat-messages", async (req, res) => {
    try {
      await storage.clearChatHistory(DEFAULT_USER_ID);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear chat history" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard-stats", async (req, res) => {
    try {
      const journalEntries = await storage.getJournalEntries(DEFAULT_USER_ID);
      const moodStats = await storage.getMoodStats(DEFAULT_USER_ID);
      const chatMessages = await storage.getChatMessages(DEFAULT_USER_ID);
      
      // Calculate journal streak (consecutive days with entries)
      let journalStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sortedEntries = journalEntries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      for (let i = 0; i < sortedEntries.length; i++) {
        const entryDate = new Date(sortedEntries[i].createdAt);
        entryDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === journalStreak) {
          journalStreak++;
        } else {
          break;
        }
      }

      const aiChatsThisMonth = chatMessages.filter(msg => {
        const msgDate = new Date(msg.createdAt);
        const now = new Date();
        return msgDate.getMonth() === now.getMonth() && msgDate.getFullYear() === now.getFullYear();
      }).length;

      res.json({
        journalStreak,
        totalEntries: journalEntries.length,
        aiChats: Math.floor(aiChatsThisMonth / 2), // Divide by 2 since we store both user and AI messages
        avgMood: moodStats.averageScore,
        recentEntries: journalEntries.slice(0, 3),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
