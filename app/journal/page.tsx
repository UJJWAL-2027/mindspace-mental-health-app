'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, BookOpen, Heart, Calendar } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from 'date-fns';
import Navbar from "@/components/navbar";
import { toast } from "sonner";

const writingPrompts = [
  "What are three things you're grateful for today?",
  "Describe a moment when you felt truly peaceful.",
  "What challenge are you facing, and how might you overcome it?",
  "Write about someone who made you smile today.",
  "What's something you learned about yourself recently?",
  "Describe your ideal day from start to finish.",
  "What's weighing on your mind right now?",
  "Write about a goal you're working towards.",
  "What's something you're looking forward to?",
  "Describe a place that makes you feel calm.",
];

export default function Journal() {
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("3");
  const [selectedPrompt, setSelectedPrompt] = useState("");

  const queryClient = useQueryClient();

  const { data: journals, isLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: async () => {
      const res = await fetch('/api/journals');
      return res.json();
    },
  });

  const createJournal = useMutation({
    mutationFn: async (data: { title: string; content: string; mood: number }) => {
      const res = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      setIsWriting(false);
      setTitle("");
      setContent("");
      setMood("3");
      setSelectedPrompt("");
      toast.success("Journal entry saved!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    createJournal.mutate({
      title: title.trim(),
      content: content.trim(),
      mood: parseInt(mood),
    });
  };

  const getMoodColor = (moodValue: number) => {
    if (moodValue >= 4) return "text-green-600";
    if (moodValue >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getMoodLabel = (moodValue: number) => {
    const labels = ["Very Sad", "Sad", "Neutral", "Happy", "Very Happy"];
    return labels[moodValue - 1];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Journal</h1>
          <p className="text-gray-600">Express your thoughts and track your emotional journey.</p>
        </div>

        {!isWriting ? (
          <div className="space-y-6">
            {/* New Entry Button */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Ready to write?</h3>
                    <p className="text-gray-600">Capture your thoughts and feelings in a new journal entry.</p>
                  </div>
                  <Button onClick={() => setIsWriting(true)} className="ml-4">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Entry
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Writing Prompts */}
            <Card>
              <CardHeader>
                <CardTitle>Writing Prompts</CardTitle>
                <CardDescription>Need inspiration? Try one of these prompts.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {writingPrompts.slice(0, 6).map((prompt, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedPrompt(prompt);
                        setIsWriting(true);
                      }}
                    >
                      <p className="text-sm text-gray-700">{prompt}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Entries</CardTitle>
                <CardDescription>Your latest journal entries</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : journals?.length > 0 ? (
                  <div className="space-y-6">
                    {journals.map((journal: any) => (
                      <div key={journal.id} className="border-l-4 border-indigo-500 pl-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-medium">{journal.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className={`flex items-center ${getMoodColor(journal.mood)}`}>
                              <Heart className="h-4 w-4 mr-1" />
                              {getMoodLabel(journal.mood)}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {format(new Date(journal.createdAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{journal.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No journal entries yet. Start writing your first entry!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>New Journal Entry</CardTitle>
              <CardDescription>
                {selectedPrompt ? `Prompt: ${selectedPrompt}` : "Write about your day, thoughts, and feelings"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your entry a title..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Your thoughts</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={selectedPrompt || "Write about your day, thoughts, and feelings..."}
                    className="min-h-[300px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mood">How are you feeling?</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">😢 Very Sad</SelectItem>
                      <SelectItem value="2">😔 Sad</SelectItem>
                      <SelectItem value="3">😐 Neutral</SelectItem>
                      <SelectItem value="4">😊 Happy</SelectItem>
                      <SelectItem value="5">😄 Very Happy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={createJournal.isPending}>
                    {createJournal.isPending ? "Saving..." : "Save Entry"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsWriting(false);
                      setTitle("");
                      setContent("");
                      setMood("3");
                      setSelectedPrompt("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}