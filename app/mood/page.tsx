'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from "@/components/navbar";
import { toast } from "sonner";

const moodEmojis = ["😢", "😔", "😐", "😊", "😄"];
const moodLabels = ["Very Sad", "Sad", "Neutral", "Happy", "Very Happy"];

export default function Mood() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  const queryClient = useQueryClient();

  const { data: moods, isLoading } = useQuery({
    queryKey: ['moods'],
    queryFn: async () => {
      const res = await fetch('/api/moods');
      return res.json();
    },
  });

  const logMood = useMutation({
    mutationFn: async (data: { value: number; note?: string }) => {
      const res = await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moods'] });
      setSelectedMood(null);
      setNote("");
      setIsLogging(false);
      toast.success("Mood logged successfully!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood === null) return;
    
    logMood.mutate({
      value: selectedMood,
      note: note.trim() || undefined,
    });
  };

  const chartData = moods?.slice(0, 30).reverse().map((mood: any) => ({
    date: format(new Date(mood.createdAt), 'MMM dd'),
    value: mood.value,
  })) || [];

  const averageMood = moods?.reduce((sum: number, mood: any) => sum + mood.value, 0) / (moods?.length || 1) || 0;
  const recentMoods = moods?.slice(0, 5) || [];

  const getMoodColor = (moodValue: number) => {
    if (moodValue >= 4) return "text-green-600";
    if (moodValue >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mood Tracker</h1>
          <p className="text-gray-600">Track and visualize your emotional well-being over time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mood Logging */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>How are you feeling?</CardTitle>
                <CardDescription>
                  Select your current mood and add a note if you'd like.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isLogging ? (
                  <Button onClick={() => setIsLogging(true)} className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Log Mood
                  </Button>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label>Select your mood</Label>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {moodEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedMood(index + 1)}
                            className={`p-4 text-2xl rounded-lg border-2 transition-all ${
                              selectedMood === index + 1
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      {selectedMood && (
                        <p className="text-sm text-gray-600 mt-2 text-center">
                          {moodLabels[selectedMood - 1]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="note">Add a note (optional)</Label>
                      <Textarea
                        id="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What's influencing your mood today?"
                        className="mt-2"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={selectedMood === null || logMood.isPending}
                        className="flex-1"
                      >
                        {logMood.isPending ? "Logging..." : "Log Mood"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsLogging(false);
                          setSelectedMood(null);
                          setNote("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Mood Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Mood Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Mood</span>
                    <span className={`font-bold ${getMoodColor(averageMood)}`}>
                      {averageMood.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Logs</span>
                    <span className="font-bold">{moods?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="font-bold">
                      {moods?.filter((mood: any) => 
                        new Date(mood.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mood Chart & History */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mood Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Mood Trend</CardTitle>
                <CardDescription>Your mood over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 5]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-300 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No mood data yet. Start tracking your mood!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Mood History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Mood Logs</CardTitle>
                <CardDescription>Your latest mood entries</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : recentMoods.length > 0 ? (
                  <div className="space-y-4">
                    {recentMoods.map((mood: any) => (
                      <div key={mood.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl">{moodEmojis[mood.value - 1]}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`font-medium ${getMoodColor(mood.value)}`}>
                              {moodLabels[mood.value - 1]}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(mood.createdAt), 'MMM dd, yyyy h:mm a')}
                            </span>
                          </div>
                          {mood.note && (
                            <p className="text-sm text-gray-600">{mood.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No mood logs yet. Start tracking your mood!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}