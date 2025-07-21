'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, MessageCircle, TrendingUp, Calendar, Smile, Frown, Meh } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import Navbar from "@/components/navbar";

export default function Dashboard() {
  const { data: moods, isLoading: moodsLoading } = useQuery({
    queryKey: ['moods'],
    queryFn: async () => {
      const res = await fetch('/api/moods');
      return res.json();
    },
  });

  const { data: journals, isLoading: journalsLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: async () => {
      const res = await fetch('/api/journals');
      return res.json();
    },
  });

  const moodData = moods?.slice(0, 7).reverse().map((mood: any) => ({
    date: format(new Date(mood.createdAt), 'MMM dd'),
    value: mood.value,
  })) || [];

  const averageMood = moods?.reduce((sum: number, mood: any) => sum + mood.value, 0) / (moods?.length || 1) || 0;
  const recentJournals = journals?.slice(0, 3) || [];

  const getMoodIcon = (mood: number) => {
    if (mood >= 4) return <Smile className="h-5 w-5 text-green-600" />;
    if (mood >= 3) return <Meh className="h-5 w-5 text-yellow-600" />;
    return <Frown className="h-5 w-5 text-red-600" />;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return "text-green-600";
    if (mood >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your mental wellness overview.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`text-2xl font-bold ${getMoodColor(averageMood)}`}>
                  {averageMood.toFixed(1)}
                </div>
                {getMoodIcon(averageMood)}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{journals?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mood Logs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moods?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total mood logs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                Days active
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Mood Trend</CardTitle>
              <CardDescription>Your mood over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {moodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodData}>
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
                  No mood data available. Start tracking your mood!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Journals */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Journal Entries</CardTitle>
              <CardDescription>Your latest thoughts and reflections</CardDescription>
            </CardHeader>
            <CardContent>
              {recentJournals.length > 0 ? (
                <div className="space-y-4">
                  {recentJournals.map((journal: any) => (
                    <div key={journal.id} className="border-l-4 border-indigo-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{journal.title}</h4>
                        <div className="flex items-center space-x-1">
                          {getMoodIcon(journal.mood)}
                          <span className="text-sm text-gray-500">
                            {format(new Date(journal.createdAt), 'MMM dd')}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {journal.content.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No journal entries yet. Start writing!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/journal">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                  <h3 className="font-medium">New Journal Entry</h3>
                  <p className="text-sm text-gray-600">Write about your day</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/mood">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <h3 className="font-medium">Log Mood</h3>
                  <p className="text-sm text-gray-600">Track how you're feeling</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/chat">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-medium">Chat Support</h3>
                  <p className="text-sm text-gray-600">Talk with our AI assistant</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}