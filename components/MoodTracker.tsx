import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Button } from "@/components/ui/button";

const moods = ["🙂", "😐", "🙁", "😢", "😡"];

export default function MoodTracker() {
  const [mood, setMood] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (selectedMood: string) => {
      await fetch("/api/mood", {
        method: "POST",
        body: JSON.stringify({ mood: selectedMood }),
        headers: { "Content-Type": "application/json" },
      });
    },
    {
      onSuccess: () => {
        setMood(null);
        queryClient.invalidateQueries("mood");
      },
    }
  );

  const { data: moodHistory = [] } = useQuery("mood", async () => {
    const res = await fetch("/api/mood");
    return res.json();
  });

  return (
    <div>
      <h2>How are you feeling today?</h2>
      <div className="flex gap-2">
        {moods.map((m) => (
          <Button key={m} variant={mood === m ? "default" : "outline"} onClick={() => setMood(m)}>
            {m}
          </Button>
        ))}
      </div>
      <Button onClick={() => mood && mutation.mutate(mood)} disabled={!mood}>Save Mood</Button>
      <div>
        <h3>Your Mood History</h3>
        <ul>
          {moodHistory.map((m: any) => (
            <li key={m.id}>
              <small>{m.created_at}</small>: {m.mood}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}