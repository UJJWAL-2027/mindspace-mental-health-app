import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbOperations } from "@/lib/db";
import { generateAIResponse, analyzeMessageSentiment } from "@/lib/ai-responses";

interface ChatMessage {
  content: string;
  isUser: boolean;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, sessionId } = await req.json();

    let chatSession;
    let previousMessages: ChatMessage[] = [];
    
    if (sessionId) {
      const sessions = await dbOperations.getChatSessionsByUserId(session.user.id);
      chatSession = sessions.find((s: any) => s.id === sessionId);
      if (chatSession) {
        previousMessages = await dbOperations.getChatMessages(chatSession.id);
      }
    } else {
      chatSession = await dbOperations.createChatSession(session.user.id);
    }

    // Store user message
    await dbOperations.createChatMessage({
      content: message,
      isUser: true,
      chatSessionId: chatSession.id
    });

    // Prepare context for AI response
    const context = {
      previousMessages: previousMessages
        .filter((msg: ChatMessage) => msg.isUser)
        .map((msg: ChatMessage) => msg.content)
        .slice(-5), // Last 5 user messages for context
      timeOfDay: new Date().toLocaleTimeString(),
      conversationLength: previousMessages.length + 1
    };

    // Generate intelligent AI response
    const aiResponseData = generateAIResponse(message, context);
    const sentiment = analyzeMessageSentiment(message);

    // Store AI response
    await dbOperations.createChatMessage({
      content: aiResponseData.message,
      isUser: false,
      chatSessionId: chatSession.id
    });

    return NextResponse.json({
      message: aiResponseData.message,
      sessionId: chatSession.id,
      sentiment,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}