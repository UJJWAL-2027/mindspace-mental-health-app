import mongoose from 'mongoose';

// MongoDB connection
const connectDB = async () => {
  try {
    // Simple connection for development - you can add your MongoDB connection string here
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindspace';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('MongoDB connection failed:', error);
    // Don't exit process, continue with in-memory storage
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

// Journal Entry Schema
const journalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: null },
  content: { type: String, required: true },
  mood: { type: String, required: true },
  tags: [String],
}, { timestamps: true });

// Mood Entry Schema
const moodEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, required: true },
  score: { type: Number, required: true },
  notes: { type: String, default: null },
}, { timestamps: true });

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true, enum: ['user', 'assistant'] },
  content: { type: String, required: true },
}, { timestamps: true });

// Create models
export const User = mongoose.model('User', userSchema);
export const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
export const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema);
export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default connectDB;