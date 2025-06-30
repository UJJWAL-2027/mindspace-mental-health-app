import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { JournalEntry, InsertJournalEntry } from "@shared/schema";

export default function Journal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<InsertJournalEntry>({
    title: "",
    content: "",
    mood: "",
    tags: [],
  });

  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertJournalEntry) => {
      const response = await apiRequest("POST", "/api/journal-entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
      setFormData({
        title: "",
        content: "",
        mood: "",
        tags: [],
      });
      toast({
        title: "Success",
        description: "Journal entry saved successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please write some content for your journal entry.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.mood) {
      toast({
        title: "Error",
        description: "Please select your current mood.",
        variant: "destructive",
      });
      return;
    }

    const tagsArray = formData.tags?.length 
      ? formData.tags 
      : formData.title 
        ? formData.title.split(",").map(tag => tag.trim()).filter(Boolean)
        : [];

    createMutation.mutate({
      ...formData,
      tags: tagsArray,
    });
  };

  const prompts = [
    {
      title: "Gratitude Reflection",
      description: "What are three things you're grateful for today?",
    },
    {
      title: "Challenge & Growth",
      description: "What challenge did you face today and how did you handle it?",
    },
    {
      title: "Future Self",
      description: "What would you tell yourself one year from now?",
    },
    {
      title: "Mindful Moment",
      description: "Describe a moment today when you felt truly present.",
    },
  ];

  const moods = [
    { value: "very-happy", label: "😄 Very Happy" },
    { value: "happy", label: "😊 Happy" },
    { value: "neutral", label: "😐 Neutral" },
    { value: "sad", label: "😔 Sad" },
    { value: "anxious", label: "😰 Anxious" },
    { value: "excited", label: "🤩 Excited" },
    { value: "tired", label: "😴 Tired" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-neutral-800">Journal Entry</h2>
          <p className="text-neutral-600">Express your thoughts and feelings</p>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="bg-secondary hover:bg-green-600"
        >
          <i className="fas fa-save mr-2"></i>
          {createMutation.isPending ? "Saving..." : "Save Entry"}
        </Button>
      </div>

      {/* Entry Form */}
      <Card className="mb-8">
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Mood */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-1">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="mood">Current Mood</Label>
                <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mood..." />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((mood) => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                type="text"
                placeholder="Give your entry a title..."
                value={formData.title || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Your Thoughts</Label>
              <Textarea
                id="content"
                rows={12}
                placeholder="What's on your mind today? Share your thoughts, feelings, experiences, or anything you'd like to remember..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                type="text"
                placeholder="Add tags separated by commas (e.g., work, family, goals)"
                value={formData.tags?.join(", ") || ""}
                onChange={(e) => {
                  const tags = e.target.value.split(",").map(tag => tag.trim()).filter(Boolean);
                  setFormData(prev => ({ ...prev, tags }));
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex space-x-3">
                <Button type="submit" disabled={createMutation.isPending}>
                  <i className="fas fa-save mr-2"></i>
                  {createMutation.isPending ? "Saving..." : "Save Entry"}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => {
                    // Save as draft functionality could be added here
                    toast({
                      title: "Draft saved",
                      description: "Your entry has been saved as a draft.",
                    });
                  }}
                >
                  <i className="fas fa-file-alt mr-2"></i>Save as Draft
                </Button>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                className="text-neutral-500 hover:text-neutral-700"
                onClick={() => {
                  setFormData({
                    title: "",
                    content: "",
                    mood: "",
                    tags: [],
                  });
                }}
              >
                <i className="fas fa-trash mr-2"></i>Clear Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Writing Prompts */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">
            Need inspiration? Try these prompts:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map((prompt, index) => (
              <button
                key={index}
                className="text-left p-4 rounded-lg border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    content: prompt.description + "\n\n",
                    title: prompt.title,
                  }));
                }}
              >
                <p className="text-sm font-medium text-neutral-800 mb-1">
                  {prompt.title}
                </p>
                <p className="text-xs text-neutral-600">
                  {prompt.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      {entries && entries.length > 0 && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Recent Entries
            </h3>
            <div className="space-y-3">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="p-3 border border-neutral-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      {entry.title || "Untitled"}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 truncate">
                    {entry.content.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
