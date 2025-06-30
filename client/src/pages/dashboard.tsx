import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime, getMoodEmoji } from "@/lib/utils";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard-stats"],
  });

  const quickMoods = [
    { value: "happy", emoji: "😊", label: "Happy" },
    { value: "neutral", emoji: "😐", label: "Neutral" },
    { value: "sad", emoji: "😔", label: "Sad" },
    { value: "anxious", emoji: "😰", label: "Anxious" },
    { value: "excited", emoji: "🤩", label: "Excited" },
    { value: "tired", emoji: "😴", label: "Tired" },
  ];

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-8 w-96 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-800 mb-2">
          Good morning, John 👋
        </h2>
        <p className="text-neutral-600">
          How are you feeling today? Let's check in with your mental wellness journey.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Journal Streak */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <i className="fas fa-fire text-primary text-lg"></i>
              </div>
              <span className="text-sm text-neutral-500">This Week</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">
                {stats?.journalStreak || 0}
              </p>
              <p className="text-sm text-neutral-600">Day Streak</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Entries */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <i className="fas fa-book text-secondary text-lg"></i>
              </div>
              <span className="text-sm text-neutral-500">All Time</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">
                {stats?.totalEntries || 0}
              </p>
              <p className="text-sm text-neutral-600">Journal Entries</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Chats */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <i className="fas fa-robot text-accent text-lg"></i>
              </div>
              <span className="text-sm text-neutral-500">This Month</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">
                {stats?.aiChats || 0}
              </p>
              <p className="text-sm text-neutral-600">AI Conversations</p>
            </div>
          </CardContent>
        </Card>

        {/* Mood Score */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-heart text-pink-500 text-lg"></i>
              </div>
              <span className="text-sm text-neutral-500">Average</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">
                {stats?.avgMood?.toFixed(1) || "0.0"}
              </p>
              <p className="text-sm text-neutral-600">Mood Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Mood Check */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Journal Entries */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800">
                  Recent Journal Entries
                </h3>
                <Link href="/journal">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {stats?.recentEntries?.length > 0 ? (
                  stats.recentEntries.map((entry: any) => (
                    <div
                      key={entry.id}
                      className="p-4 bg-neutral-50 rounded-lg border-l-4 border-primary"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-600">
                          {formatDateTime(entry.createdAt)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                          <span className="text-sm text-neutral-500 capitalize">
                            {entry.mood.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                      <p className="text-neutral-700 text-sm">
                        {entry.title || entry.content.substring(0, 100) + "..."}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <i className="fas fa-book-open text-4xl mb-4 text-neutral-300"></i>
                    <p>No journal entries yet.</p>
                    <p className="text-sm">Start by writing your first entry!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Mood Check & AI Chat */}
        <div className="space-y-6">
          {/* Quick Mood Check */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Quick Mood Check
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                How are you feeling right now?
              </p>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {quickMoods.map((mood) => (
                  <button
                    key={mood.value}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
                  >
                    <span className="text-2xl mb-1">{mood.emoji}</span>
                    <span className="text-xs text-neutral-600">{mood.label}</span>
                  </button>
                ))}
              </div>

              <Link href="/mood">
                <Button className="w-full">Log Mood</Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Companion Quick Access */}
          <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-robot text-lg"></i>
              </div>
              <div>
                <h3 className="font-semibold">AI Companion</h3>
                <p className="text-sm opacity-90">Always here to listen</p>
              </div>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Need someone to talk to? Our AI companion is here to provide support and guidance.
            </p>
            <Link href="/chat">
              <Button variant="secondary" className="w-full bg-white text-primary hover:bg-neutral-50">
                Start Conversation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
