import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatTime } from "@/lib/utils";
import type { ChatMessage } from "@shared/schema";

export default function Chat() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat-messages"],
  });

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message });
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
      setMessage("");
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/chat-messages");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-messages"] });
      toast({
        title: "Success",
        description: "Chat history cleared successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message.trim());
  };

  const handleQuickMessage = (quickMessage: string) => {
    const quickMessages: Record<string, string> = {
      breathing: "Can you guide me through a breathing exercise?",
      anxiety: "I'm feeling anxious right now. Can you help me?",
      sleep: "I'm having trouble sleeping. Do you have any tips?",
      motivation: "I'm feeling unmotivated today. Can you help me?",
    };
    
    const messageText = quickMessages[quickMessage];
    if (messageText) {
      sendMutation.mutate(messageText);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      }
    };

    const textarea = document.querySelector('textarea[data-message-input]');
    textarea?.addEventListener('keypress', handleKeyPress);
    
    return () => {
      textarea?.removeEventListener('keypress', handleKeyPress);
    };
  }, [message]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-neutral-800">AI Companion</h2>
          <p className="text-neutral-600">Your supportive mental health companion</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => clearMutation.mutate()}
          disabled={clearMutation.isPending}
        >
          <i className="fas fa-broom mr-2"></i>
          {clearMutation.isPending ? "Clearing..." : "Clear Chat"}
        </Button>
      </div>

      {/* Chat Container */}
      <Card className="flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <i className="fas fa-robot text-white text-lg"></i>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800">MindSpace AI</h3>
              <p className="text-sm text-green-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Online & Ready to Help
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <div className="bg-neutral-100 rounded-xl rounded-tl-none p-4 max-w-md">
                <p className="text-neutral-800 text-sm">
                  Hello! I'm your AI companion here to support your mental wellness journey. 
                  Feel free to share what's on your mind or ask me anything about managing stress, 
                  anxiety, or general wellness tips.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex space-x-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
              )}
              <div className={`rounded-xl p-4 max-w-md ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-neutral-100 rounded-tl-none'
              }`}>
                <p className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-neutral-800'}`}>
                  {msg.content}
                </p>
                <p className={`text-xs mt-2 opacity-70 ${msg.role === 'user' ? 'text-white' : 'text-neutral-500'}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-neutral-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-neutral-600 text-sm font-medium">You</span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <div className="bg-neutral-100 rounded-xl rounded-tl-none p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-neutral-200">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1">
              <Textarea
                data-message-input
                rows={2}
                placeholder="Type your message... Press Enter to send"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
              />
            </div>
            <Button 
              type="submit" 
              disabled={sendMutation.isPending || !message.trim()}
              className="flex items-center justify-center px-6"
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </form>
          
          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => handleQuickMessage("breathing")}
              disabled={sendMutation.isPending}
            >
              🫁 Breathing Exercise
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => handleQuickMessage("anxiety")}
              disabled={sendMutation.isPending}
            >
              😰 Managing Anxiety
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => handleQuickMessage("sleep")}
              disabled={sendMutation.isPending}
            >
              😴 Sleep Tips
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => handleQuickMessage("motivation")}
              disabled={sendMutation.isPending}
            >
              💪 Motivation Boost
            </Button>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <i className="fas fa-info-circle text-amber-500 mt-1"></i>
          <div>
            <p className="text-sm text-amber-800 font-medium mb-1">Important Notice</p>
            <p className="text-sm text-amber-700">
              This AI companion provides general wellness support and is not a replacement for 
              professional mental health care. If you're experiencing a crisis, please contact 
              a mental health professional or crisis hotline immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
