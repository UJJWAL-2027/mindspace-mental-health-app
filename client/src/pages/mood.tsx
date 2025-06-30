import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDateTime, getMoodEmoji, getMoodScore } from "@/lib/utils";
import type { MoodEntry } from "@shared/schema";

export default function Mood() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMood, setSelectedMood] = useState("");
  const [notes, setNotes] = useState("");

  const { data: moodEntries = [], isLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/mood-stats"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { mood: string; score: number; notes?: string }) => {
      const response = await apiRequest("POST", "/api/mood-entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mood-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
      setSelectedMood("");
      setNotes("");
      toast({
        title: "Success",
        description: "Mood logged successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log mood. Please try again.",
        variant: "destructive",
      });
    },
  });

  const moods = [
    { value: "very-happy", label: "Very Happy", emoji: "😄" },
    { value: "happy", label: "Happy", emoji: "😊" },
    { value: "excited", label: "Excited", emoji: "🤩" },
    { value: "neutral", label: "Neutral", emoji: "😐" },
    { value: "tired", label: "Tired", emoji: "😴" },
    { value: "sad", label: "Sad", emoji: "😔" },
    { value: "anxious", label: "Anxious", emoji: "😰" },
  ];

  const handleMoodSubmit = () => {
    if (!selectedMood) {
      toast({
        title: "Error",
        description: "Please select a mood.",
        variant: "destructive",
      });
      return;
    }

    const score = getMoodScore(selectedMood);
    createMutation.mutate({
      mood: selectedMood,
      score,
      notes: notes.trim() || undefined,
    });
  };

  const todaysMood = moodEntries.find(entry => {
    const entryDate = new Date(entry.createdAt);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  });

  const recentMoods = moodEntries.slice(0, 7);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-neutral-800">Mood Tracker</h2>
          <p className="text-neutral-600">Track your emotional wellbeing over time</p>
        </div>
        <Button 
          onClick={handleMoodSubmit}
          disabled={createMutation.isPending || !selectedMood}
        >
          <i className="fas fa-plus mr-2"></i>
          {createMutation.isPending ? "Logging..." : "Log Mood"}
        </Button>
      </div>

      {/* Current Mood & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Today's Mood */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Today's Mood</h3>
            <div className="text-center">
              {todaysMood ? (
                <>
                  <div className="text-6xl mb-2">{getMoodEmoji(todaysMood.mood)}</div>
                  <p className="text-xl font-medium text-neutral-800 capitalize">
                    {todaysMood.mood.replace("-", " ")}
                  </p>
                  <p className="text-sm text-neutral-600">
                    Logged at {formatDateTime(todaysMood.createdAt)}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-2 text-neutral-300">😐</div>
                  <p className="text-xl font-medium text-neutral-500">Not logged yet</p>
                  <p className="text-sm text-neutral-400">Log your mood for today</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Average */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">This Week</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats?.averageScore?.toFixed(1) || "0.0"}
              </div>
              <p className="text-sm text-neutral-600">Average Score</p>
              <div className="flex justify-center space-x-1 mt-3">
                {recentMoods.slice(0, 7).map((mood, index) => (
                  <span key={index} className="text-lg">
                    {getMoodEmoji(mood.mood)}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Tracking Streak</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {stats?.streak || 0}
              </div>
              <p className="text-sm text-neutral-600">Days in a row</p>
              <div className="flex justify-center mt-3">
                <i className="fas fa-fire text-orange-500 text-2xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood Selection & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mood Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-6">
                Mood Trends (Last 30 Days)
              </h3>
              <div className="h-64 flex items-end justify-between space-x-1">
                {moodEntries.slice(0, 30).reverse().map((entry, index) => {
                  const height = (entry.score / 10) * 100;
                  return (
                    <div
                      key={entry.id}
                      className="bg-primary/60 rounded-t"
                      style={{ 
                        height: `${height}%`, 
                        width: `${90 / Math.min(30, moodEntries.length)}%` 
                      }}
                      title={`${entry.mood} - ${entry.score}/10`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-neutral-500 mt-4">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mood Selection & Recent Entries */}
        <div className="space-y-6">
          {/* Mood Selection */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                How are you feeling?
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                      selectedMood === mood.value
                        ? "bg-primary text-white"
                        : "hover:bg-neutral-100"
                    }`}
                  >
                    <span className="text-2xl mb-1">{mood.emoji}</span>
                    <span className="text-xs font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <Textarea
                  placeholder="Add notes about your mood (optional)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleMoodSubmit}
                disabled={createMutation.isPending || !selectedMood}
                className="w-full"
              >
                {createMutation.isPending ? "Logging..." : "Log Mood"}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Mood Entries */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-6">Recent Entries</h3>
              <div className="space-y-4">
                {recentMoods.length > 0 ? (
                  recentMoods.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                        <div>
                          <p className="text-sm font-medium text-neutral-800 capitalize">
                            {entry.mood.replace("-", " ")}
                          </p>
                          <p className="text-xs text-neutral-600">
                            {formatDateTime(entry.createdAt)}
                          </p>
                          {entry.notes && (
                            <p className="text-xs text-neutral-500 mt-1 truncate max-w-32">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary">{entry.score}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <i className="fas fa-heart text-4xl mb-4 text-neutral-300"></i>
                    <p>No mood entries yet.</p>
                    <p className="text-sm">Start tracking your mood today!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
