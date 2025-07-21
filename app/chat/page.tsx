'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import Navbar from "@/components/navbar";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI mental wellness companion. I'm here to listen, understand, and provide personalized support for your mental health journey. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: data.message,
          isUser: false,
          timestamp: new Date(),
          sentiment: data.sentiment,
        },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessage.mutate(inputMessage);
    setInputMessage("");
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Support Chat</h1>
          <p className="text-gray-600">Talk with our AI assistant for mental wellness support and guidance.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Mental Wellness Assistant
              </CardTitle>
              <CardDescription>
                Share your thoughts and feelings. This is a safe space for you to express yourself.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
                <div className="space-y-4 pr-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.isUser
                            ? 'bg-indigo-600 text-white ml-auto'
                            : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {message.isUser ? (
                            <User className="h-4 w-4 opacity-70" />
                          ) : (
                            <Bot className="h-4 w-4 text-indigo-600" />
                          )}
                          <span className={`text-xs ${message.isUser ? 'opacity-70' : 'text-gray-500'}`}>
                            {message.isUser ? 'You' : 'Assistant'}
                          </span>
                          {!message.isUser && message.sentiment && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              message.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                              message.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {message.sentiment}
                            </span>
                          )}
                        </div>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 ${message.isUser ? 'opacity-50' : 'text-gray-400'}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {sendMessage.isPending && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg px-4 py-3 bg-white text-gray-900 border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-2 mb-1">
                          <Bot className="h-4 w-4 text-indigo-600" />
                          <span className="text-xs text-gray-500">Assistant</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <span className="text-sm text-gray-500 ml-2">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Share your thoughts and feelings..."
                  disabled={sendMessage.isPending}
                  className="flex-1"
                />
                <Button type="submit" disabled={sendMessage.isPending || !inputMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Support Information */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle>About Your AI Mental Wellness Companion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">What I can help with:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Personalized stress management techniques</li>
                    <li>• Anxiety and depression support</li>
                    <li>• Relationship and social challenges</li>
                    <li>• Self-esteem and confidence building</li>
                    <li>• Sleep and wellness guidance</li>
                    <li>• Mindfulness and breathing exercises</li>
                    <li>• Emotional processing and validation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Important reminders:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• I provide intelligent, contextual responses</li>
                    <li>• I remember our conversation context</li>
                    <li>• I analyze sentiment to better understand you</li>
                    <li>• For crisis situations, please contact a professional</li>
                    <li>• All conversations are private and secure</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}