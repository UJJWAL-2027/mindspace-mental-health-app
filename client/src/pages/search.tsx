import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime, getMoodEmoji } from "@/lib/utils";
import type { JournalEntry } from "@shared/schema";

export default function Search() {
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [tags, setTags] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { data: results = [], isLoading, refetch } = useQuery<JournalEntry[]>({
    queryKey: ["/api/search-entries", { q: query, mood, dateRange, tags }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        q: query,
        ...(mood && mood !== "any" && { mood }),
        ...(dateRange && dateRange !== "all" && { dateRange }),
        ...(tags && { tags }),
      });
      const response = await fetch(`/api/search-entries?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: hasSearched,
  });

  const handleSearch = () => {
    setHasSearched(true);
    refetch();
  };

  const moods = [
    { value: "very-happy", label: "😄 Very Happy" },
    { value: "happy", label: "😊 Happy" },
    { value: "neutral", label: "😐 Neutral" },
    { value: "sad", label: "😔 Sad" },
    { value: "anxious", label: "😰 Anxious" },
    { value: "excited", label: "🤩 Excited" },
    { value: "tired", label: "😴 Tired" },
  ];

  const dateRanges = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-800 mb-2">Search Journal Entries</h2>
        <p className="text-neutral-600">Find specific thoughts, feelings, or experiences from your journal</p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search your journal entries..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              <i className="fas fa-search mr-2"></i>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className="pt-6 border-t border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    {dateRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">Mood</label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Mood</SelectItem>
                    {moods.map((moodOption) => (
                      <SelectItem key={moodOption.value} value={moodOption.value}>
                        {moodOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">Tags</label>
                <Input
                  type="text"
                  placeholder="work, family, goals..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-800">Search Results</h3>
            <span className="text-sm text-neutral-600">
              Found {results.length} {results.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="mt-4 text-neutral-600">Searching your entries...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <Card key={result.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getMoodEmoji(result.mood)}</span>
                      <div>
                        <h4 className="font-semibold text-neutral-800">
                          {result.title || "Untitled Entry"}
                        </h4>
                        <p className="text-sm text-neutral-600">
                          {formatDateTime(result.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full capitalize">
                      {result.mood.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-neutral-700 text-sm mb-4">
                    {result.content.length > 200 
                      ? `${result.content.substring(0, 200)}...` 
                      : result.content
                    }
                  </p>
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {result.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <i className="fas fa-search text-4xl text-neutral-300 mb-4"></i>
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">No results found</h3>
                  <p className="text-neutral-600 mb-4">
                    We couldn't find any journal entries matching your search criteria.
                  </p>
                  <div className="text-sm text-neutral-500">
                    <p>Try:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Using different keywords</li>
                      <li>Removing some filters</li>
                      <li>Checking your spelling</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasSearched && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <i className="fas fa-search text-6xl text-neutral-300 mb-6"></i>
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                Search Your Journal Entries
              </h3>
              <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                Use the search bar above to find specific thoughts, feelings, or experiences 
                from your journal entries. You can search by keywords or use filters to narrow down results.
              </p>
              <Button onClick={handleSearch} disabled={!query.trim()}>
                <i className="fas fa-search mr-2"></i>
                Start Searching
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
