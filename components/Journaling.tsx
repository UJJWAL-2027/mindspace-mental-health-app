import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getPrompt } from "../utils/prompts";

export default function Journaling() {
  const [entry, setEntry] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (newEntry: string) => {
      await fetch("/api/journal", {
        method: "POST",
        body: JSON.stringify({ entry: newEntry }),
        headers: { "Content-Type": "application/json" },
      });
    },
    {
      onSuccess: () => {
        setEntry("");
        queryClient.invalidateQueries("journal");
      },
    }
  );

  const { data: journals = [] } = useQuery("journal", async () => {
    const res = await fetch("/api/journal");
    return res.json();
  });

  return (
    <div>
      <h2>Today's Prompt: {getPrompt()}</h2>
      <Textarea
        value={entry}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEntry(e.target.value)}
        placeholder="Write your thoughts here..."
      />
      <Button onClick={() => mutation.mutate(entry)} disabled={!entry}>Save Entry</Button>
      <div>
        <h3>Your Journals</h3>
        {journals.map((j: any) => (
          <div key={j.id}>
            <small>{j.created_at}</small>
            <p>{j.entry}</p>
          </div>
        ))}
      </div>
    </div>
  );
}