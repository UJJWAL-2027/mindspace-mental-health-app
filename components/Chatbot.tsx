import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getResponse } from "../lib/rules";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  function handleSend() {
    setResponse(getResponse(input));
    setInput("");
  }

  return (
    <div>
      <h2>MindSpace AI Chatbot</h2>
      <Textarea
        value={input}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
        placeholder="Type your concern..."
      />
      <Button onClick={handleSend} disabled={!input}>Send</Button>
      {response && <div><strong>AI:</strong> {response}</div>}
    </div>
  );
}